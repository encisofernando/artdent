<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * Registro append-only de acciones sensibles dentro de un tenant (por
 * empresa, vía BelongsToCompany en AuditLog). Se llama explícitamente desde
 * cada método mutante — mismo criterio que App\Support\SuperadminAudit del
 * lado admin: nada mágico (sin observers/eventos), para que el propio
 * controller deje explícito qué se audita y con qué payload.
 */
class Auditor
{
    public static function log(string $action, ?Model $subject = null, array $changes = [], ?string $note = null): void
    {
        $user = auth()->user();

        AuditLog::create([
            'actor_id' => $user?->id,
            'actor_name' => $user?->name,
            'action' => $action,
            'auditable_type' => $subject ? $subject::class : null,
            'auditable_id' => $subject?->getKey(),
            'changes' => $changes ?: null,
            'note' => $note,
        ]);
    }
}
