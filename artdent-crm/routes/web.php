<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// ── Fallback para archivos de storage cuando el symlink no existe ─────────────
// Si el symlink public/storage existe y el servidor sirve el archivo estático,
// esta ruta nunca se ejecuta. Sólo actúa cuando el archivo no se resuelve
// estáticamente (symlink roto o inexistente en producción).
Route::get('/storage/{path}', function (string $path) {
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

// Kiosk page — publicly accessible (anyone can see the UI)
Route::get('/attendance-kiosk', [\App\Http\Controllers\AttendanceKioskController::class, 'index'])->name('attendance-kiosk');

// Clock-face POST — requires kiosk token or lab IP
Route::middleware('lab.network')->post('/attendance-kiosk/clock-face', [\App\Http\Controllers\AttendanceKioskController::class, 'clockFace'])->name('attendance-kiosk.clock-face');

// WebAuthn kiosk authentication — requires kiosk token or lab IP
Route::middleware('lab.network')->group(function () {
    Route::post('/attendance-kiosk/webauthn/authentication-options', [\App\Http\Controllers\WebAuthnKioskController::class, 'authenticationOptions'])->name('attendance-kiosk.webauthn.authentication-options');
    Route::post('/attendance-kiosk/webauthn/verify', [\App\Http\Controllers\WebAuthnKioskController::class, 'verify'])->name('attendance-kiosk.webauthn.verify');
});

Route::middleware(['auth'])->group(function () {

    require __DIR__.'/modules/dashboard.php';

    require __DIR__.'/modules/products.php';
    require __DIR__.'/modules/inventory.php';

    require __DIR__.'/modules/clinic.php';
    require __DIR__.'/modules/laboratory.php';

    require __DIR__.'/modules/sales.php';
    require __DIR__.'/modules/finance.php';

    require __DIR__.'/modules/hr.php';
    require __DIR__.'/modules/ecommerce.php';

    require __DIR__.'/modules/admin.php';
    require __DIR__.'/modules/user.php';

    require __DIR__.'/modules/profile.php';

});

// Presupuesto público — sin autenticación (link compartible por WhatsApp)
Route::get('/q/{token}', [\App\Http\Controllers\QuoteController::class, 'publicShow'])->name('quotes.public');

// Panel de asignación — usa auth:sanctum (Bearer token) fuera del grupo de sesión
require __DIR__.'/modules/assign-panel.php';

require __DIR__.'/auth.php';
