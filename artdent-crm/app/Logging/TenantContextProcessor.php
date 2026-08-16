<?php

namespace App\Logging;

use App\Support\CompanyContext;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Auth;
use Monolog\LogRecord;

/**
 * Agrega tenant_id/company_id a cada línea de log, sin tener que tocar los
 * ~125 call sites de Log:: existentes uno por uno. A diferencia de un
 * middleware con Log::withContext() (que corre antes de que la tenancy se
 * inicialice en rutas públicas/webhooks — tenant.session,
 * tenant.public_token, isup.tenant corren como middleware DE RUTA, después
 * del middleware global), un processor de Monolog se evalúa en el momento
 * exacto de cada log, así que siempre ve el tenant/company reales de ese
 * punto del código — funciona igual en requests HTTP, comandos artisan y
 * jobs en cola.
 */
class TenantContextProcessor
{
    public function __invoke(LogRecord $record): LogRecord
    {
        $tenantId = ! CrmMode::isOwner() && function_exists('tenant') && tenancy()->initialized
            ? tenant('id')
            : null;

        // CompanyContext::id() devuelve el default (1) sin usuario
        // autenticado — útil dentro de un request real, pero ruido
        // engañoso en comandos artisan/colas sin contexto real, así que
        // sólo se agrega si hay alguien logueado de verdad.
        $companyId = Auth::check() ? CompanyContext::id() : null;

        $extra = array_filter([
            'tenant_id' => $tenantId,
            'company_id' => $companyId,
        ], fn ($value) => $value !== null);

        if ($extra === []) {
            return $record;
        }

        return $record->with(extra: [...$record->extra, ...$extra]);
    }
}
