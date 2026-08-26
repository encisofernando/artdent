<?php

namespace App\Observers;

use App\Models\User;
use App\Support\CrmMode;
use App\Support\UserTenantMapGuard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserObserver
{
    private function centralConnection(): \Illuminate\Database\Connection
    {
        return DB::connection(config('tenancy.database.central_connection'));
    }

    private function normalizedEmail(string $email): string
    {
        return Str::lower(trim($email));
    }

    private function currentTenantId(): ?string
    {
        if (CrmMode::isOwner() || ! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        return tenant('id');
    }

    public function created(User $user): void
    {
        if (! tenancy()->initialized || ! $tenantId = $this->currentTenantId()) {
            return;
        }

        $email = $this->normalizedEmail($user->email);

        // updateOrInsert() matchea sólo por email — si otro tenant ya lo
        // tiene mapeado, sobrescribirlo a ciegas sería secuestrarle el
        // login (LoginRequest resuelve el tenant por este mapa). Si llegó
        // acá con un email ajeno (StoreUserRequest debería haberlo
        // bloqueado en el flujo normal del admin — esto es defensa en
        // profundidad para seeders/tinker/imports), se deja el mapeo
        // existente intacto.
        if ($claimedBy = UserTenantMapGuard::claimedByOtherTenant($email)) {
            \Log::warning('UserObserver: email ya reclamado por otro tenant, no se sobrescribe el mapeo', [
                'email' => $email,
                'tenant_id' => $tenantId,
                'claimed_by' => $claimedBy,
            ]);

            return;
        }

        $this->centralConnection()->table('user_tenant_map')->updateOrInsert(
            ['email' => $email],
            ['tenant_id' => $tenantId, 'updated_at' => now(), 'created_at' => now()]
        );
    }

    public function updated(User $user): void
    {
        if (! tenancy()->initialized || ! $tenantId = $this->currentTenantId()) {
            return;
        }

        if ($user->isDirty('email')) {
            $newEmail = $this->normalizedEmail($user->email);

            // Mismo criterio que created(): el email nuevo ya está scopeado
            // a otro tenant, no se toca el mapeo (evita además la violación
            // del UNIQUE de user_tenant_map.email, que acá tiraría una
            // excepción sin capturar).
            if ($claimedBy = UserTenantMapGuard::claimedByOtherTenant($newEmail)) {
                \Log::warning('UserObserver: intento de cambiar a un email ya reclamado por otro tenant, no se actualiza el mapeo', [
                    'email' => $newEmail,
                    'tenant_id' => $tenantId,
                    'claimed_by' => $claimedBy,
                ]);

                return;
            }

            $this->centralConnection()->table('user_tenant_map')
                ->where('tenant_id', $tenantId)
                ->where('email', $this->normalizedEmail((string) $user->getOriginal('email')))
                ->update([
                    'email' => $newEmail,
                    'updated_at' => now(),
                ]);

            return;
        }

        $this->created($user);
    }

    public function deleted(User $user): void
    {
        if (! $user->trashed()) {
            return;
        }

        $this->removeMap($user);
    }

    public function restored(User $user): void
    {
        $this->created($user);
    }

    public function forceDeleted(User $user): void
    {
        $this->removeMap($user);
    }

    private function removeMap(User $user): void
    {
        if (! tenancy()->initialized || ! $tenantId = $this->currentTenantId()) {
            return;
        }

        $this->centralConnection()->table('user_tenant_map')
            ->where('tenant_id', $tenantId)
            ->where('email', $this->normalizedEmail($user->email))
            ->delete();
    }
}
