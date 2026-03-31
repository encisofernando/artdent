<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Route;

class UserLanding
{
    public static function uriFor(?User $user, bool $absolute = true): string
    {
        if ($user && $user->can('accounting.view') && ! $user->hasAnyPermission([
            'products.view',
            'customers.view',
            'orders.view',
            'ecommerce.view',
            'reports.view',
            'settings.edit',
            'staff.view',
        ]) && Route::has('accounting.index')) {
            return route('accounting.index', absolute: $absolute);
        }

        if (Route::has('dashboard')) {
            return route('dashboard', absolute: $absolute);
        }

        if (Route::has('home')) {
            return route('home', absolute: $absolute);
        }

        return '/';
    }
}
