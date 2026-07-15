<?php

namespace App\Support;

use App\Models\SuperadminAuditLog;
use App\Models\Tenant;

/**
 * Registro append-only de acciones de superadmin sobre tenants. Se llama
 * explícitamente desde cada método mutante de TenantController — nada mágico
 * (sin observers/eventos), para que quede obvio en el propio controller qué
 * se audita y con qué payload.
 */
class SuperadminAudit
{
    public static function log(string $action, ?Tenant $tenant = null, array $changes = [], ?string $note = null): void
    {
        $user = auth()->user();

        SuperadminAuditLog::create([
            'actor_id' => $user?->id,
            'actor_email' => $user?->email,
            'action' => $action,
            'tenant_id' => $tenant?->id,
            'tenant_name' => $tenant?->name,
            'changes' => $changes ?: null,
            'note' => $note,
            'ip_address' => request()?->ip(),
        ]);
    }
}
