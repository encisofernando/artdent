<?php

namespace App\Http\Middleware;

use App\Models\CashRegisterSetting;
use App\Models\CashSession;
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
    public function handle(Request $request, Closure $next): Response
    {
        $companyId = CompanyContext::id();

        if (! CashRegisterSetting::forCompany($companyId)->is_enabled) {
            return $next($request);
        }

        $user = $request->user();

        $openSession = CashSession::query()
            ->where('status', 'open')
            ->where('user_id', $user->id)
            ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
            ->first();

        if ($openSession && ! $openSession->opened_at->isToday()) {
            return redirect()->route('cash-sessions.show', $openSession)
                ->with('error', 'Te quedó una caja abierta de un día anterior — cerrala antes de seguir.');
        }

        if (! $openSession) {
            return redirect()->route('cash-sessions.index')
                ->with('error', 'Abrí una caja antes de facturar.');
        }

        return $next($request);
    }
}
