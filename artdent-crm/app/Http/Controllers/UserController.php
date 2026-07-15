<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use App\Support\Auditor;
use App\Support\PlanLimitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->with('roles')
            ->where('company_id', auth()->user()->company_id)
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'is_active' => $u->is_active,
                'created_at' => $u->created_at?->format('d/m/Y'),
                'roles' => $u->roles->map(fn (Role $r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'display_name' => $r->display_name ?? $r->name,
                ]),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::query()
                ->where('name', '!=', 'Super Admin')
                ->orderBy('display_name')
                ->get(['id', 'name', 'display_name']),
            'branches' => Branch::query()
                ->where('company_id', auth()->user()->company_id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request, PlanLimitService $limits): RedirectResponse
    {
        $limits->assertCanAddUser();

        $validated = $request->validated();

        $user = User::create([
            'company_id' => auth()->user()->company_id,
            'branch_id' => $validated['branch_id'] ?? null,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['roles'])) {
            // Asegurar que no se asigne Super Admin por accidente desde el frontend
            $roles = Role::whereIn('id', $validated['roles'])
                ->where('name', '!=', 'Super Admin')
                ->pluck('id');

            $user->syncRoles($roles);
        }

        Auditor::log('user.created', $user, ['email' => $user->email, 'roles' => $user->roles()->pluck('name')->all()]);

        return redirect()->route('users.index')
            ->with('success', "Usuario {$user->name} creado exitosamente.");
    }

    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'branch_id' => $user->branch_id,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('id'),
                'is_super_admin' => $user->hasRole('Super Admin'),
            ],
            'roles' => Role::query()
                ->where('name', '!=', 'Super Admin')
                ->orderBy('display_name')
                ->get(['id', 'name', 'display_name']),
            'branches' => Branch::query()
                ->where('company_id', auth()->user()->company_id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $rolesBefore = $user->roles()->pluck('name')->all();

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        // No permitir cambiar roles ni permisos si es Super Admin
        if (! $user->hasRole('Super Admin')) {
            // Asegurar que no se asigne Super Admin a otros usuarios
            $roles = Role::whereIn('id', $validated['roles'] ?? [])
                ->where('name', '!=', 'Super Admin')
                ->pluck('id');

            $user->syncRoles($roles);
        }

        $rolesAfter = $user->roles()->pluck('name')->all();

        Auditor::log('user.updated', $user, [
            'is_active' => $data['is_active'],
            'password_changed' => ! empty($validated['password']),
            'roles_before' => $rolesBefore,
            'roles_after' => $rolesAfter,
        ]);

        return redirect()->route('users.index')
            ->with('success', "Usuario {$user->name} actualizado correctamente.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->hasRole('Super Admin')) {
            return back()->with('error', 'No se puede eliminar a un usuario con rol de Super Administrador.');
        }

        Auditor::log('user.deleted', $user, ['email' => $user->email, 'roles' => $user->roles()->pluck('name')->all()]);

        $user->roles()->detach();
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuario eliminado.');
    }
}
