<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Todas las rutas de la app (artdent-crm) viven aquí.
| El sistema cambia de inquilino según el login vía email/session.
|
*/

Route::middleware([
    'web',
])->group(function () {

    Route::get('/', function () {
        return redirect()->route('login');
    });

    Route::get('/print-manager/download/{platform?}', [\App\Http\Controllers\PrintManagerDownloadController::class, 'download'])
        ->name('print-manager.download');

    // ── Storage fallback ──────────────────────────────────────────────────────
    Route::middleware('tenant.session')->get('/storage/{path}', function (string $path) {
        $realPath = storage_path('app/public/'.ltrim($path, '/'));

        if (! file_exists($realPath) || is_dir($realPath)) {
            abort(404);
        }

        $mime = mime_content_type($realPath) ?: 'application/octet-stream';

        return response()->file($realPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    })->where('path', '.*');

    // ── Kiosk ────────────────────────────────────────────────────────────────
    Route::get('/attendance-kiosk', [\App\Http\Controllers\AttendanceKioskController::class, 'index'])->name('attendance-kiosk');

    Route::middleware('lab.network')->group(function () {
        Route::post('/attendance-kiosk/webauthn/authentication-options', [\App\Http\Controllers\WebAuthnKioskController::class, 'authenticationOptions'])->name('attendance-kiosk.webauthn.authentication-options');
        Route::post('/attendance-kiosk/webauthn/verify', [\App\Http\Controllers\WebAuthnKioskController::class, 'verify'])->name('attendance-kiosk.webauthn.verify');
    });

    // ── Presupuesto público ────────────────────────────────────────────────
    Route::get('/q/{token}', [\App\Http\Controllers\QuoteController::class, 'publicShow'])->name('quotes.public');

    // ── Rutas autenticadas ─────────────────────────────────────────────────
    Route::middleware(['auth'])->group(function () {

        require __DIR__.'/modules/dashboard.php';

        require __DIR__.'/modules/products.php';
        require __DIR__.'/modules/inventory.php';

        require __DIR__.'/modules/clinic.php';
        require __DIR__.'/modules/laboratory.php';

        require __DIR__.'/modules/sales.php';
        require __DIR__.'/modules/finance.php';
        require __DIR__.'/modules/accounting.php';

        require __DIR__.'/modules/hr.php';
        require __DIR__.'/modules/ecommerce.php';

        require __DIR__.'/modules/admin.php';
        require __DIR__.'/modules/user.php';

        require __DIR__.'/modules/profile.php';

        // Notificaciones in-app
        Route::prefix('crm/notifications')->name('crm.notifications.')->group(function (): void {
            Route::get('/', [\App\Http\Controllers\CrmNotificationController::class, 'index'])->name('index');
            Route::post('read-all', [\App\Http\Controllers\CrmNotificationController::class, 'markAllRead'])->name('read-all');
            Route::post('{crmNotification}/read', [\App\Http\Controllers\CrmNotificationController::class, 'markRead'])->name('read');
        });

    });

    // ── Panel de asignación (Bearer token) ───────────────────────────────────
    require __DIR__.'/modules/assign-panel.php';

    require __DIR__.'/auth.php';
});
