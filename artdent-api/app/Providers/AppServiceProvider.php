<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

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
        // Forzar el link de restablecimiento al Frontend (React)
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'https://artdent.com.ar'));

        ResetPassword::createUrlUsing(function ($notifiable, string $token) use ($frontend) {
            return rtrim($frontend, '/')
                . '/crear-contraseña?token=' . urlencode($token)
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
