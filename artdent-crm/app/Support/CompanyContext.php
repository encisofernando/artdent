<?php

namespace App\Support;

use App\Models\Company;

class CompanyContext
{
    private const SESSION_KEY = 'active_company_id';

    private const DEFAULT_COMPANY_ID = 1;

    /**
     * Resuelve la company activa para el request actual.
     *
     * - Usuarios sin el permiso `companies.switch`: siempre su company_id fijo.
     * - Usuarios con `companies.switch` (ej. Super Admin): la que tengan en
     *   sesión, con default a la company id 1 si todavía no eligieron ninguna.
     * - Sin usuario autenticado (ej. alta pública de customers de e-commerce):
     *   también default a la company id 1.
     */
    public static function id(): ?int
    {
        $user = auth()->user();

        if (! $user) {
            return self::DEFAULT_COMPANY_ID;
        }

        if ($user->can('companies.switch')) {
            return (int) session(self::SESSION_KEY, self::DEFAULT_COMPANY_ID);
        }

        return $user->company_id;
    }

    /**
     * Cambia la company activa en sesión. Sólo permitido para usuarios con
     * el permiso `companies.switch`; cualquier otro caso aborta con 403/404.
     */
    public static function set(int $companyId): void
    {
        $user = auth()->user();

        abort_unless($user && $user->can('companies.switch'), 403);
        abort_unless(Company::whereKey($companyId)->exists(), 404);

        session([self::SESSION_KEY => $companyId]);
    }

    /**
     * Companies que el usuario actual puede elegir desde el selector.
     * Vacío para usuarios sin permiso de switch (no se muestra el selector).
     */
    public static function availableFor(?\App\Models\User $user): \Illuminate\Support\Collection
    {
        if (! $user || ! $user->can('companies.switch')) {
            return collect();
        }

        return Company::query()->orderBy('name')->get(['id', 'name', 'fantasy_name']);
    }
}
