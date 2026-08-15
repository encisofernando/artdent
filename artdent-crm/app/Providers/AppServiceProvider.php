<?php

namespace App\Providers;

use App\Models\CrmNotification;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\HikVisionDevice;
use App\Models\NaveChargeIntent;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Observers\CrmNotificationObserver;
use App\Observers\CustomerObserver;
use App\Observers\EcommerceOrderObserver;
use App\Observers\HikVisionDeviceObserver;
use App\Observers\NaveChargeIntentObserver;
use App\Observers\TenantModuleCacheObserver;
use App\Observers\UserObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        HikVisionDevice::observe(HikVisionDeviceObserver::class);
        NaveChargeIntent::observe(NaveChargeIntentObserver::class);
        Customer::observe(CustomerObserver::class);

        // Implicitly grant "Super Admin" role all permissions
        // This works in the app by using gate-related functions like auth()->user->can() and @can()
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });

        // routes/api.php (checkout, catálogo, webhooks de pago, panel de
        // asignación, etc.) no tenía ningún throttle — ver bootstrap/app.php
        // (throttleApi()). 60/min por usuario autenticado o IP es el default
        // razonable para tráfico normal de e-commerce/POS.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Webhooks de MP/Nave: los llaman los servidores del proveedor de
        // pago, compartiendo IP entre todos sus merchants — un límite por
        // usuario/IP pensado para navegadores podría descartar pagos reales
        // bajo carga. 300/min por IP igual acota abuso sin arriesgar eso.
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(300)->by($request->ip());
        });
    }
}
