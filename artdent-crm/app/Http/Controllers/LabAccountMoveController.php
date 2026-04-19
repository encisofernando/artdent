<?php

namespace App\Http\Controllers;

use App\Models\LabAccount;
use App\Models\LabAccountMove;
use App\Models\Dentist;
use App\Models\PaymentMethod;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LabAccountMoveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id ?? 1;

        $search = $request->input('search');
        $period = $request->input('period', 'week');
        $from = $request->input('from');
        $to = $request->input('to');
        $dentistsHaveLastName = Schema::hasColumn('dentists', 'last_name');

        [$resolvedFrom, $resolvedTo] = $this->resolveDateRange($period, $from, $to);

        $query = LabAccountMove::with(['account.dentist', 'paymentMethod', 'user'])
            ->whereHas('account.dentist', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });

        if ($search) {
            $query->where(function ($q) use ($search, $dentistsHaveLastName) {
                $q->whereHas('account.dentist', function ($dentistQuery) use ($search, $dentistsHaveLastName) {
                    $dentistQuery->where(function ($nameQuery) use ($search, $dentistsHaveLastName) {
                        $nameQuery->where('name', 'like', "%{$search}%");

                        if ($dentistsHaveLastName) {
                            $nameQuery->orWhere('last_name', 'like', "%{$search}%");
                        }
                    });
                })
                ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $query->whereBetween('move_date', [
            $resolvedFrom->toDateString(),
            $resolvedTo->toDateString(),
        ]);

        $moves = $query
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $debtors = LabAccount::with('dentist')
            ->where('balance', '>', 0)
            ->whereHas('dentist', function ($q) use ($companyId, $search, $dentistsHaveLastName) {
                $q->where('company_id', $companyId);

                if ($search) {
                    $q->where(function ($dentistQuery) use ($search, $dentistsHaveLastName) {
                        $dentistQuery->where('name', 'like', "%{$search}%");

                        if ($dentistsHaveLastName) {
                            $dentistQuery->orWhere('last_name', 'like', "%{$search}%");
                        }
                    });
                }
            })
            ->orderByDesc('balance')
            ->get()
            ->map(fn (LabAccount $account) => [
                'id' => $account->id,
                'balance' => (float) $account->balance,
                'dentist' => $account->dentist ? [
                    'id' => $account->dentist->id,
                    'name' => $account->dentist->name,
                    'last_name' => $dentistsHaveLastName ? $account->dentist->last_name : null,
                ] : null,
            ])
            ->values();

        return Inertia::render('LabAccountMove/Index', [
            'moves' => $moves,
            'debtors' => $debtors,
            'filters' => [
                'search' => $search,
                'period' => $period,
                'from' => $resolvedFrom->toDateString(),
                'to' => $resolvedTo->toDateString(),
            ],
        ]);
    }

    private function resolveDateRange(string $period, ?string $from, ?string $to): array
    {
        $today = Carbon::today();

        [$start, $end] = match ($period) {
            'today' => [$today->copy(), $today->copy()],
            'month' => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()],
            'year' => [$today->copy()->startOfYear(), $today->copy()->endOfYear()],
            'range' => [
                $this->parseDateOrFallback($from, $today->copy()->startOfWeek(CarbonInterface::MONDAY)),
                $this->parseDateOrFallback($to, $today->copy()->endOfWeek(CarbonInterface::SUNDAY)),
            ],
            default => [$today->copy()->startOfWeek(CarbonInterface::MONDAY), $today->copy()->endOfWeek(CarbonInterface::SUNDAY)],
        };

        if ($start->gt($end)) {
            [$start, $end] = [$end, $start];
        }

        return [$start, $end];
    }

    private function parseDateOrFallback(?string $value, Carbon $fallback): Carbon
    {
        if (! $value) {
            return $fallback;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return $fallback;
        }
    }

    /**
     * Show form for creating payment
     */
    public function create(Request $request)
    {
        $companyId = auth()->user()->company_id ?? 1;

        return Inertia::render('LabAccountMove/Create', [
            'dentists' => Dentist::with('labAccount')
                ->where('company_id', $companyId)
                ->orderBy('name')
                ->get(),

            'paymentMethods' => PaymentMethod::where('is_active', true)->get(),
            'selectedDentistId' => $request->integer('dentist_id') ?: null,
        ]);
    }

    /**
     * Store payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'description' => 'required|string|max:255',
            'move_date' => 'required|date'
        ]);

        $companyId = auth()->user()->company_id ?? 1;

        $dentist = Dentist::where('id', $validated['dentist_id'])
            ->where('company_id', $companyId)
            ->firstOrFail();

        DB::transaction(function () use ($validated, $dentist) {

            $account = LabAccount::lockForUpdate()->firstOrCreate(
                ['dentist_id' => $dentist->id],
                ['balance' => 0]
            );

            $move = new LabAccountMove([
                'lab_account_id' => $account->id,
                'user_id' => auth()->id(),
                'type' => LabAccountMove::TYPE_PAYMENT,
                'amount' => $validated['amount'],
                'description' => $validated['description'],
                'payment_method_id' => $validated['payment_method_id'],
                'move_date' => $validated['move_date'],
            ]);

            $newBalance = $account->balance + $move->signed_amount;

            $move->balance_after = $newBalance;

            $move->save();

            $account->update([
                'balance' => $newBalance
            ]);
        });

        return redirect()
            ->route('lab-account-moves.index')
            ->with('success', 'Pago registrado exitosamente. La cuenta corriente ha sido actualizada.');
    }

    /**
     * Show receipt
     */
    public function show(LabAccountMove $labAccountMove)
    {
        $labAccountMove->loadMissing(['account.dentist.company', 'paymentMethod', 'user']);

        $dentist = $labAccountMove->account?->dentist;

        if (! $dentist || $dentist->company_id !== (auth()->user()->company_id ?? 1)) {
            abort(403);
        }

        return Inertia::render('LabAccountMove/Show', [
            'move' => $labAccountMove
        ]);
    }
}
