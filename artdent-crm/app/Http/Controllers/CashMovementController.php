<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\CashSession;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CashMovementController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'cash_session_id' => ['required', 'integer', 'exists:cash_sessions,id'],
            'type' => ['required', 'in:in,out'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'concept' => ['required', 'string', 'max:255'],
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
        ]);

        $session = CashSession::with('cash_drawer')->findOrFail($validated['cash_session_id']);
        abort_unless($session->cash_drawer->company_id === $companyId, 404);

        if ($session->status !== 'open') {
            return back()->with('error', 'No se pueden registrar movimientos en una caja cerrada.');
        }

        CashMovement::create([
            'cash_session_id' => $session->id,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'concept' => $validated['concept'],
            'reference_type' => 'manual',
        ]);

        return back()->with('success', 'Movimiento registrado.');
    }

    public function destroy(Request $request, CashMovement $cashMovement): RedirectResponse
    {
        $companyId = CompanyContext::id();
        $cashMovement->load('cash_session.cash_drawer');
        abort_unless($cashMovement->cash_session->cash_drawer->company_id === $companyId, 404);

        if ($cashMovement->cash_session->status !== 'open' || $cashMovement->reference_type !== 'manual') {
            return back()->with('error', 'Solo se pueden eliminar movimientos manuales de una caja todavía abierta.');
        }

        $cashMovement->delete();

        return back()->with('success', 'Movimiento eliminado.');
    }
}
