<?php

namespace App\Http\Middleware;

use App\Models\CashRegisterSetting;
use App\Models\CashSession;
use App\Services\CashSessionService;
use App\Support\CompanyContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sólo se aplica al punto de venta (Sale) — Laboratorio y E-commerce no
 * usan caja física, siguen andando igual tenga o no el tenant esto
 * prendido. No-op total si el tenant no activó Caja en Settings.
 */
class EnsureCashSessionIsCurrent
{
    public function __construct(
        protected CashSessionService $sessionService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $companyId = CompanyContext::id();
        $settings = CashRegisterSetting::forCompany($companyId);

        if (! $settings->is_enabled) {
            return $next($request);
        }

        $user = $request->user();

        $openSession = CashSession::query()
            ->where('status', 'open')
            ->where('user_id', $user->id)
            ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
            ->first();

        if ($openSession && $this->sessionService->isSessionExpired($openSession, $settings)) {
            $timeLabel = $settings->close_time ?: '00:00';

            return redirect()->route('cash-sessions.show', $openSession)
                ->with('error', "La caja superó el horario de cierre automático ({$timeLabel} hs) — cerrala antes de seguir.");
        }

        if (! $openSession) {
            return redirect()->route('cash-sessions.index')
                ->with('error', 'Abrí una caja antes de facturar.');
        }

        return $next($request);
    }
}
