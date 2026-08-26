<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Sincroniza public_token_registry (BD central) cada vez que se genera un
 * token público nuevo (presupuesto compartible, portal de cliente) — ver
 * App\Models\PublicTokenRegistry y App\Http\Middleware\InitializeTenancyByPublicToken.
 */
class PublicTokenRegistrar
{
    public static function register(string $token, string $type): void
    {
        if (CrmMode::isOwner() || ! function_exists('tenant') || ! tenancy()->initialized) {
            return;
        }

        DB::connection(config('tenancy.database.central_connection'))
            ->table('public_token_registry')
            ->updateOrInsert(
                ['token' => $token],
                ['type' => $type, 'tenant_id' => tenant('id'), 'updated_at' => now(), 'created_at' => now()]
            );
    }
}
