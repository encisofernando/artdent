<?php

namespace App\Providers;

use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Observers\CrmNotificationObserver;
use App\Observers\EcommerceOrderObserver;
use App\Observers\TenantModuleCacheObserver;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        EcommerceOrder::observe(EcommerceOrderObserver::class);
        CrmNotification::observe(CrmNotificationObserver::class);
        User::observe(UserObserver::class);
        TenantSubscription::observe(TenantModuleCacheObserver::class);
        TenantModule::observe(TenantModuleCacheObserver::class);

        // Implicitly grant "Super Admin" role all permissions
        // This works in the app by using gate-related functions like auth()->user->can() and @can()
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });
    }
}
