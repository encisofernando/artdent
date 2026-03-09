<?php

namespace App\Http\Controllers;

use App\Models\LabAccount;
use App\Models\LabAccountMove;
use App\Models\Dentist;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LabAccountMoveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id ?? 1;

        $search = $request->input('search');

        $query = LabAccountMove::with(['account.dentist', 'paymentMethod', 'user'])
            ->whereHas('account.dentist', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('account.dentist', function ($dentistQuery) use ($search) {
                    $dentistQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                })
                ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $moves = $query
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('LabAccountMove/Index', [
            'moves' => $moves,
            'filters' => ['search' => $search]
        ]);
    }

    /**
     * Show form for creating payment
     */
    public function create()
    {
        $companyId = auth()->user()->company_id ?? 1;

        return Inertia::render('LabAccountMove/Create', [
            'dentists' => Dentist::with('labAccount')
                ->where('company_id', $companyId)
                ->orderBy('name')
                ->get(),

            'paymentMethods' => PaymentMethod::where('is_active', true)->get()
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
        $labAccountMove->load(['account.dentist.company', 'paymentMethod', 'user']);

        if ($labAccountMove->account->dentist->company_id !== (auth()->user()->company_id ?? 1)) {
            abort(403);
        }

        return Inertia::render('LabAccountMove/Show', [
            'move' => $labAccountMove
        ]);
    }
}