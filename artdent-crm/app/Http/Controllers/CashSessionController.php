<?php

namespace App\Http\Controllers;

use App\Mail\CashSessionClosedMail;
use App\Models\CashDrawer;
use App\Models\CashSession;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CashSessionController extends Controller
{
    /**
     * Rótulos de tipo de medio de pago para el informe de cierre — mismo
     * criterio que SaleController::POS_PAYMENT_METHOD_LABELS.
     */
    private const PAYMENT_TYPE_LABELS = [
        'cash' => 'Efectivo',
        'debit' => 'Débito',
        'credit' => 'Crédito',
        'transfer' => 'Transferencia',
        'cuenta_corriente' => 'Cuenta Corriente',
        'nave_qr' => 'QR (Nave)',
        'loyalty_points' => 'Puntos',
    ];

    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $canView = $request->user()->can('cash-register.view');

        $drawers = CashDrawer::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->with(['openSession' => fn ($query) => $query->with('user:id,name')])
            ->orderBy('name')
            ->get()
            ->map(fn (CashDrawer $drawer) => [
                'id' => $drawer->id,
                'name' => $drawer->name,
                'open_session' => $drawer->openSession ? [
                    'id' => $drawer->openSession->id,
                    'user' => $drawer->openSession->user,
                    'opened_at' => $drawer->openSession->opened_at,
                    'is_mine' => $drawer->openSession->user_id === $request->user()->id,
                    // Sin cash-register.view, el monto de apertura no viaja al
                    // frontend ni para cajas ajenas ni para la propia.
                    'opening_amount' => $canView ? $drawer->openSession->opening_amount : null,
                ] : null,
            ]);

        return Inertia::render('Caja/Index', [
            'drawers' => $drawers,
            'can_view' => $canView,
            'sessions' => $canView
                ? CashSession::query()
                    ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
                    ->with(['cash_drawer:id,name', 'user:id,name'])
                    ->latest('opened_at')
                    ->paginate(20)
                    ->withQueryString()
                : null,
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

        $canView = $request->user()->can('cash-register.view');

        // Sin cash-register.view (sólo operate), el cajero únicamente puede
        // llegar a SU PROPIA sesión, y sólo para cerrarla — nunca ver
        // contenido ajeno ni el arqueo.
        if (! $canView) {
            abort_unless($cashSession->user_id === $request->user()->id, 404);

            return Inertia::render('Caja/Show', [
                'session' => [
                    'id' => $cashSession->id,
                    'status' => $cashSession->status,
                    'opened_at' => $cashSession->opened_at,
                    'cash_drawer' => $cashSession->cash_drawer()->select('id', 'name')->first(),
                ],
                'can_view' => false,
                'totals' => null,
            ]);
        }

        $cashSession->load([
            'cash_drawer:id,name',
            'user:id,name',
            'cash_movements' => fn ($query) => $query->with('payment_method:id,name')->latest('created_at'),
        ]);

        return Inertia::render('Caja/Show', [
            'session' => $cashSession,
            'can_view' => true,
            'totals' => $this->buildReport($cashSession),
        ]);
    }

    public function close(Request $request, CashSession $cashSession): RedirectResponse
    {
        $this->authorizeSameCompany($request, $cashSession);

        if (! $request->user()->can('cash-register.view')) {
            abort_unless($cashSession->user_id === $request->user()->id, 404);
        }

        if ($cashSession->status !== 'open') {
            return back()->with('error', 'Esta sesión ya está cerrada.');
        }

        $validated = $request->validate([
            'closing_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = $this->buildReport($cashSession);
        $difference = round($validated['closing_amount'] - $report['expected_cash'], 2);

        $notes = trim(($cashSession->notes ? $cashSession->notes."\n" : '').
            'Cierre: contado '.number_format($validated['closing_amount'], 2, ',', '.').
            ' / esperado '.number_format($report['expected_cash'], 2, ',', '.').
            ' / diferencia '.number_format($difference, 2, ',', '.').
            ($validated['notes'] ? ' — '.$validated['notes'] : ''));

        $cashSession->update([
            'closed_at' => now(),
            'closing_amount' => $validated['closing_amount'],
            'status' => 'closed',
            'notes' => $notes,
        ]);

        $this->sendClosedReportEmail($cashSession, $report, $validated['closing_amount'], $difference);

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
     * Informe de cierre completo: caja inicial, ingresos manuales (no
     * originados por una venta), ventas desglosadas por medio de pago,
     * egresos, total esperado en efectivo y total por medios digitales.
     *
     * @return array{opening_amount: float, manual_income: float, sales_by_method: array<int, array{key: string, label: string, amount: float}>, sales_cash: float, sales_digital_total: float, expenses: float, expected_cash: float}
     */
    private function buildReport(CashSession $cashSession): array
    {
        $cashSession->loadMissing(['cash_movements', 'sales.sale_payments.paymentMethod']);

        $manualIncome = round((float) $cashSession->cash_movements
            ->where('type', 'in')
            ->filter(fn ($movement) => $movement->reference_type !== 'sale')
            ->sum('amount'), 2);

        $expenses = round((float) $cashSession->cash_movements->where('type', 'out')->sum('amount'), 2);

        $byMethod = [];
        foreach ($cashSession->sales as $sale) {
            foreach ($sale->sale_payments as $payment) {
                $key = strtolower($payment->paymentMethod?->type ?? 'otro');
                $byMethod[$key] = ($byMethod[$key] ?? 0.0) + (float) $payment->amount;
            }
        }

        $salesCash = round($byMethod['cash'] ?? 0.0, 2);
        $salesDigitalTotal = round(array_sum($byMethod) - $salesCash, 2);

        $salesByMethod = collect($byMethod)
            ->map(fn ($amount, $key) => [
                'key' => $key,
                'label' => self::PAYMENT_TYPE_LABELS[$key] ?? ucfirst($key),
                'amount' => round($amount, 2),
            ])
            ->sortByDesc('amount')
            ->values()
            ->all();

        return [
            'opening_amount' => (float) $cashSession->opening_amount,
            'manual_income' => $manualIncome,
            'sales_by_method' => $salesByMethod,
            'sales_cash' => $salesCash,
            'sales_digital_total' => $salesDigitalTotal,
            'expenses' => $expenses,
            'expected_cash' => round($cashSession->opening_amount + $manualIncome + $salesCash - $expenses, 2),
        ];
    }

    private function sendClosedReportEmail(CashSession $cashSession, array $report, float $closingAmount, float $difference): void
    {
        $cashSession->loadMissing(['cash_drawer', 'user']);

        $recipients = User::query()
            ->where('company_id', $cashSession->cash_drawer->company_id)
            ->where('is_active', true)
            ->get()
            ->filter(fn (User $user) => $user->can('cash-register.view'))
            ->pluck('email')
            ->filter()
            ->unique();

        if ($recipients->isEmpty()) {
            return;
        }

        Mail::to($recipients->all())->send(new CashSessionClosedMail($cashSession, $report, $closingAmount, $difference));
    }

    private function authorizeSameCompany(Request $request, CashSession $cashSession): void
    {
        $companyId = CompanyContext::id();

        abort_unless($cashSession->cash_drawer->company_id === $companyId, 404);
    }
}
