<?php

namespace App\Listeners;

use Illuminate\Foundation\Events\DiagnosingHealth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * /up en Laravel 12 sólo soporta extenderse escuchando este evento — si
 * cualquier listener tira una excepción, /up responde 500 (ver
 * ApplicationBuilder::withRouting()). Sin esto, /up sólo confirmaba que
 * PHP-FPM respondía, no que la app pudiera hacer nada real: la BD central
 * (compartida entre los 3 deploys) o la BD de este tenant específico
 * podían estar caídas y /up seguía devolviendo 200.
 */
class VerifyInfrastructureOnHealthCheck
{
    public function handle(DiagnosingHealth $event): void
    {
        try {
            DB::connection('central')->getPdo();
        } catch (\Throwable $e) {
            throw new \RuntimeException('DB central inaccesible: '.$e->getMessage(), previous: $e);
        }

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            throw new \RuntimeException('DB de tenant inaccesible: '.$e->getMessage(), previous: $e);
        }

        // Redis sostiene el cache de módulos/permisos por tenant
        // (TenantModuleResolver, Spatie Permission) — sin él la app no
        // rompe de forma obvia al toque, pero degrada silenciosamente.
        if (config('cache.default') === 'redis') {
            try {
                Cache::store('redis')->has('health-check-probe');
            } catch (\Throwable $e) {
                throw new \RuntimeException('Redis inaccesible: '.$e->getMessage(), previous: $e);
            }
        }
    }
}
