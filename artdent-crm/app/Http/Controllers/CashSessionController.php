<?php

namespace App\Http\Controllers;

use App\Models\CashDrawer;
use App\Models\CashSession;
use App\Services\CashSessionService;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashSessionController extends Controller
{
    public function __construct(
        protected CashSessionService $sessionService
    ) {}

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
            'totals' => $this->sessionService->buildReport($cashSession),
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

        $result = $this->sessionService->closeSession(
            $cashSession,
            (float) $validated['closing_amount'],
            $validated['notes'] ?? null,
            isAutomatic: false
        );

        $difference = $result['difference'];
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

    public function buildReport(CashSession $cashSession): array
    {
        return $this->sessionService->buildReport($cashSession);
    }

    public function sendClosedReportEmail(CashSession $cashSession, array $report, float $closingAmount, float $difference): void
    {
        $this->sessionService->sendClosedReportEmail($cashSession, $report, $closingAmount, $difference);
    }

    private function authorizeSameCompany(Request $request, CashSession $cashSession): void
    {
        $companyId = CompanyContext::id();

        // cash_drawer tiene BelongsToCompany (Fase 2): si la caja es de otra
        // empresa, la relación ya la filtra sola y devuelve null — no una
        // fila con company_id distinto. Comparar con ?-> en vez de asumir
        // que siempre hay fila evita un 500 (null->company_id) donde
        // debería ser un 404 igual que para cualquier otro cross-empresa.
        abort_unless($cashSession->cash_drawer?->company_id === $companyId, 404);
    }
}
