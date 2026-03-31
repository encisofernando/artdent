<?php

namespace App\Observers;

use App\Models\User;
use App\Support\CrmMode;
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

        $this->centralConnection()->table('user_tenant_map')->updateOrInsert(
            ['email' => $this->normalizedEmail($user->email)],
            ['tenant_id' => $tenantId, 'updated_at' => now(), 'created_at' => now()]
        );
    }

    public function updated(User $user): void
    {
        if (! tenancy()->initialized || ! $tenantId = $this->currentTenantId()) {
            return;
        }

        if ($user->isDirty('email')) {
            $this->centralConnection()->table('user_tenant_map')
                ->where('tenant_id', $tenantId)
                ->where('email', $this->normalizedEmail((string) $user->getOriginal('email')))
                ->update([
                    'email' => $this->normalizedEmail($user->email),
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
