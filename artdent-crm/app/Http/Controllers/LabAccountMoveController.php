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
     * Shows the "Pagos" view for Laboratory.
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id ?? 1;

        $search = $request->input('search');
        
        $query = LabAccountMove::with(['lab_account.dentist', 'payment_method', 'user'])
            ->whereHas('lab_account.dentist', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });

        // Filter for specific types if requested, otherwise show all or just payments?
        // Let's show all moves in a general ledger, but focus on paginated list.
        if ($search) {
            $query->whereHas('lab_account.dentist', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            })->orWhere('description', 'like', "%{$search}%");
        }

        $moves = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('LabAccountMove/Index', [
            'moves' => $moves,
            'filters' => ['search' => $search]
        ]);
    }

    /**
     * Show the form for creating a new resource (Registrar Pago)
     */
    public function create()
    {
        $companyId = auth()->user()->company_id ?? 1;

        return Inertia::render('LabAccountMove/Create', [
            // Only bring dentists who have a LabAccount with balance > 0 (meaning they owe us)
            // Actually, bring all in case they want to pay in advance
            'dentists' => Dentist::with('labAccount')
                ->where('company_id', $companyId)
                ->orderBy('name')
                ->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->get()
        ]);
    }

    /**
     * Store a newly created payment (Abono/Credit)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'description' => 'required|string',
            'move_date' => 'required|date'
        ]);

        $companyId = auth()->user()->company_id ?? 1;
        
        // Verify Dentist belongs to company
        $dentist = Dentist::where('id', $validated['dentist_id'])->where('company_id', $companyId)->firstOrFail();

        DB::transaction(function () use ($validated, $dentist) {
            // Find or create account
            $account = LabAccount::firstOrCreate(
                ['dentist_id' => $dentist->id],
                ['balance' => 0]
            );

            // It's a payment, so it REDUCES the positive balance (debt)
            $newBalance = $account->balance - $validated['amount'];
            
            $account->update(['balance' => $newBalance]);

            LabAccountMove::create([
                'lab_account_id' => $account->id,
                'user_id' => auth()->id() ?? 1,
                'type' => 'credit', // Pago a favor
                'amount' => $validated['amount'],
                'balance_after' => $newBalance,
                'description' => $validated['description'],
                'payment_method_id' => $validated['payment_method_id'],
                'move_date' => $validated['move_date'],
            ]);
        });

        return redirect()->route('lab-account-moves.index')
            ->with('success', 'Pago registrado exitosamente. La cuenta corriente ha sido actualizada.');
    }

    /**
     * Display the specified resource (Recibo)
     */
    public function show(LabAccountMove $labAccountMove)
    {
        $labAccountMove->load(['lab_account.dentist.company', 'payment_method', 'user']);
        
        // Ensure it belongs to the company
        if ($labAccountMove->lab_account->dentist->company_id !== (auth()->user()->company_id ?? 1)) {
            abort(403);
        }

        return Inertia::render('LabAccountMove/Show', [
            'move' => $labAccountMove
        ]);
    }
}
