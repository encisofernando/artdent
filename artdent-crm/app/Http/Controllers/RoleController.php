<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Auditor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of roles and their permissions.
     */
    public function index(): Response
    {
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->orderBy('name')->get()->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name'),
            ]),
            'all_permissions' => Permission::all()->pluck('name'),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191|unique:roles,name',
            'display_name' => 'nullable|string|max:191',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'] ?? $validated['name'],
            'description' => $validated['description'] ?? null,
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        Auditor::log('role.created', $role, ['name' => $role->name, 'permissions' => $role->permissions()->pluck('name')->all()]);

        return redirect()->route('roles.index')
            ->with('success', "Rol '{$role->display_name}' creado correctamente.");
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        if ($role->name === 'Super Admin') {
            return back()->with('error', 'El rol de Super Administrador no puede ser modificado.');
        }

        $validated = $request->validate([
            'display_name' => 'nullable|string|max:191',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $permissionsBefore = $role->permissions()->pluck('name')->all();

        // We don't allow renaming the 'name' (identifier) easily to avoid breaking syncs
        $role->update([
            'display_name' => $validated['display_name'] ?? $role->display_name,
            'description' => $validated['description'] ?? $role->description,
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        Auditor::log('role.updated', $role, [
            'permissions_before' => $permissionsBefore,
            'permissions_after' => $role->permissions()->pluck('name')->all(),
        ]);

        return redirect()->route('roles.index')
            ->with('success', "Rol '{$role->display_name}' actualizado.");
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'Super Admin') {
            return back()->with('error', 'El rol de Super Administrador no puede ser eliminado.');
        }

        Auditor::log('role.deleted', $role, ['name' => $role->name]);

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Rol eliminado correctamente.');
    }
}
