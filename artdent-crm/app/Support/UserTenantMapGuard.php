<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserTenantMapGuard
{
    /**
     * Devuelve el tenant_id que ya reclamó ese email en user_tenant_map, si
     * es distinto del tenant activo — null si el email está libre o ya es
     * del propio tenant. Sólo aplica en modo multi_tenant con tenancy
     * inicializada (en modo owner no existe user_tenant_map).
     */
    public static function claimedByOtherTenant(string $email): ?string
    {
        if (CrmMode::isOwner() || ! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        $currentTenantId = tenant('id');

        $claimedBy = DB::connection(config('tenancy.database.central_connection'))
            ->table('user_tenant_map')
            ->where('email', Str::lower(trim($email)))
            ->value('tenant_id');

        return ($claimedBy && $claimedBy !== $currentTenantId) ? $claimedBy : null;
    }
}
