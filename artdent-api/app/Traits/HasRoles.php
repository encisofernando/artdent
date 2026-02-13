<?php

namespace App\Traits;

trait HasRoles
{
    public function roles()
    {
        return $this->belongsToMany(
            \App\Models\Role::class,
            'role_user',
            'user_id',
            'role_id'
        );
    }

    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    public function assignRole(string $roleName): void
    {
        $role = \App\Models\Role::where('name', $roleName)->firstOrFail();
        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    public function removeRole(string $roleName): void
    {
        $role = \App\Models\Role::where('name', $roleName)->first();
        if ($role) {
            $this->roles()->detach($role->id);
        }
    }
}
