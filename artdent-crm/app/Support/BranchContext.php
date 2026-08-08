<?php

namespace App\Support;

use App\Models\Branch;
use App\Models\User;

class BranchContext
{
    private const SESSION_KEY = 'active_branch_id';

    /**
     * Resuelve la sucursal activa para el request actual.
     *
     * - Usuarios con `branch_id` fijo (ej. cajero asignado a una sucursal):
     *   siempre esa, sin selector.
     * - Usuarios sin `branch_id` fijo: la que tengan en sesión, siempre que
     *   pertenezca a la company activa (si cambió de company, se ignora y
     *   cae a null en vez de filtrar con una sucursal de otra empresa).
     * - Sin elección todavía: null (AfipPointOfSale::resolveFor cae al PV
     *   is_default de la company, comportamiento actual).
     */
    public static function id(): ?int
    {
        $user = auth()->user();

        if (! $user) {
            return null;
        }

        if ($user->branch_id) {
            return $user->branch_id;
        }

        $branchId = session(self::SESSION_KEY);

        if (! $branchId) {
            return null;
        }

        $belongsToActiveCompany = Branch::whereKey($branchId)
            ->where('company_id', CompanyContext::id())
            ->exists();

        return $belongsToActiveCompany ? (int) $branchId : null;
    }

    /**
     * Cambia la sucursal activa en sesión. Sólo permitido para usuarios sin
     * `branch_id` fijo; la sucursal debe estar activa y pertenecer a la
     * company activa.
     */
    public static function set(int $branchId): void
    {
        $user = auth()->user();

        abort_unless($user && ! $user->branch_id, 403);
        abort_unless(
            Branch::whereKey($branchId)->where('company_id', CompanyContext::id())->where('is_active', true)->exists(),
            404
        );

        session([self::SESSION_KEY => $branchId]);
    }

    /**
     * Sucursales que el usuario actual puede elegir desde el selector.
     * Vacío para usuarios con `branch_id` fijo (no se muestra el selector).
     */
    public static function availableFor(?User $user): \Illuminate\Support\Collection
    {
        if (! $user || $user->branch_id) {
            return collect();
        }

        return Branch::query()
            ->where('company_id', CompanyContext::id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }
}
