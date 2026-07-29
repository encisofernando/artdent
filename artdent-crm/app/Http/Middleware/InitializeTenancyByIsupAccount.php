<?php

namespace App\Http\Middleware;

use App\Models\IsupDeviceRegistry;
use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resuelve e inicializa la tenancy para requests del isup-listener, usando
 * el/los identificador(es) de dispositivo que manda en el body (account_id,
 * y/o serial_no/mac_address si el binding real a HCNetSDK los reporta —
 * NET_DVR_ALARMER trae serial/IP/MAC pero no quedó confirmado si el
 * account_id configurado en el terminal viaja de vuelta en ese mismo struct,
 * ver docs/hikvision-isup-arquitectura.md § 5). Mismo patrón que
 * RestrictToLabNetwork con KioskNetwork: no se puede confiar en
 * dominio/sesión acá — el "cliente" es un proceso interno reenviando
 * eventos de un dispositivo físico sin login.
 *
 * Ningún identificador reconocido en isup_device_registry es, por
 * definición, un dispositivo no dado de alta — se rechaza acá, antes de
 * tocar cualquier BD de tenant.
 */
class InitializeTenancyByIsupAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $accountId = (string) $request->input('account_id', '');
        $serialNo = (string) $request->input('serial_no', '');
        $macAddress = (string) $request->input('mac_address', '');

        if ($accountId === '' && $serialNo === '' && $macAddress === '') {
            abort(422, 'Se requiere account_id, serial_no o mac_address.');
        }

        $registry = IsupDeviceRegistry::query()
            ->when($accountId !== '', fn ($q) => $q->orWhere('account_id', $accountId))
            ->when($serialNo !== '', fn ($q) => $q->orWhere('serial_no', $serialNo))
            ->when($macAddress !== '', fn ($q) => $q->orWhere('mac_address', $macAddress))
            ->first();

        if (! $registry) {
            abort(404, 'Dispositivo no registrado (account_id/serial/MAC desconocidos).');
        }

        $tenant = Tenant::find($registry->tenant_id);

        if (! $tenant || ! $tenant->isActive()) {
            abort(404, 'Tenant inactivo o inexistente para este account_id.');
        }

        tenancy()->initialize($tenant);

        return $next($request);
    }
}
