<?php

namespace App\Http\Controllers;

use App\Models\CashDrawer;
use App\Models\CashSession;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $drawers = CashDrawer::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->with(['openSession' => fn ($query) => $query->with('user:id,name')])
            ->orderBy('name')
            ->get()
            ->map(fn (CashDrawer $drawer) => [
                'id' => $drawer->id,
                'name' => $drawer->name,
                'open_session' => $drawer->openSession,
            ]);

        $sessions = CashSession::query()
            ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
            ->with(['cash_drawer:id,name', 'user:id,name'])
            ->latest('opened_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Caja/Index', [
            'drawers' => $drawers,
            'sessions' => $sessions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'cash_drawer_id' => ['required', 'integer', 'exists:cash_drawers,id'],
            'opening_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $drawer = CashDrawer::where('company_id', $companyId)->findOrFail($validated['cash_drawer_id']);

        if ($drawer->cash_sessions()->where('status', 'open')->exists()) {
            return back()->with('error', 'Esta caja ya tiene una sesión abierta.');
        }

        $session = CashSession::create([
            'cash_drawer_id' => $drawer->id,
            'user_id' => $request->user()->id,
            'opened_at' => now(),
            'opening_amount' => $validated['opening_amount'],
            'status' => 'open',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('cash-sessions.show', $session)->with('success', 'Caja abierta.');
    }

    public function show(Request $request, CashSession $cashSession): Response
    {
        $this->authorizeSameCompany($request, $cashSession);

        $cashSession->load([
            'cash_drawer:id,name',
            'user:id,name',
            'cash_movements' => fn ($query) => $query->with('payment_method:id,name')->latest('created_at'),
        ]);

        return Inertia::render('Caja/Show', [
            'session' => $cashSession,
            'totals' => $this->totals($cashSession),
        ]);
    }

    public function close(Request $request, CashSession $cashSession): RedirectResponse
    {
        $this->authorizeSameCompany($request, $cashSession);

        if ($cashSession->status !== 'open') {
            return back()->with('error', 'Esta sesión ya está cerrada.');
        }

        $validated = $request->validate([
            'closing_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $totals = $this->totals($cashSession);
        $difference = round($validated['closing_amount'] - $totals['expected_cash'], 2);

        $notes = trim(($cashSession->notes ? $cashSession->notes."\n" : '').
            'Cierre: contado '.number_format($validated['closing_amount'], 2, ',', '.').
            ' / esperado '.number_format($totals['expected_cash'], 2, ',', '.').
            ' / diferencia '.number_format($difference, 2, ',', '.').
            ($validated['notes'] ? ' — '.$validated['notes'] : ''));

        $cashSession->update([
            'closed_at' => now(),
            'closing_amount' => $validated['closing_amount'],
            'status' => 'closed',
            'notes' => $notes,
        ]);

        $message = $difference === 0.0
            ? 'Caja cerrada sin diferencias.'
            : ($difference > 0
                ? 'Caja cerrada con sobrante de $'.number_format($difference, 2, ',', '.')
                : 'Caja cerrada con faltante de $'.number_format(abs($difference), 2, ',', '.'));

        return redirect()->route('cash-sessions.index')->with('success', $message);
    }

    public function destroy(Request $request, CashSession $cashSession): RedirectResponse
    {
        $this->authorizeSameCompany($request, $cashSession);

        if ($cashSession->status !== 'open' || $cashSession->cash_movements()->exists()) {
            return back()->with('error', 'Solo se puede eliminar una sesión abierta y sin movimientos registrados.');
        }

        $cashSession->delete();

        return redirect()->route('cash-sessions.index')->with('success', 'Sesión eliminada.');
    }

    /**
     * @return array{opening_amount: float, cash_in: float, cash_out: float, expected_cash: float}
     */
    private function totals(CashSession $cashSession): array
    {
        $cashIn = (float) $cashSession->cash_movements()->where('type', 'in')->sum('amount');
        $cashOut = (float) $cashSession->cash_movements()->where('type', 'out')->sum('amount');

        return [
            'opening_amount' => (float) $cashSession->opening_amount,
            'cash_in' => $cashIn,
            'cash_out' => $cashOut,
            'expected_cash' => round($cashSession->opening_amount + $cashIn - $cashOut, 2),
        ];
    }

    private function authorizeSameCompany(Request $request, CashSession $cashSession): void
    {
        $companyId = CompanyContext::id();

        abort_unless($cashSession->cash_drawer->company_id === $companyId, 404);
    }
}
