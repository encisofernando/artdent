<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// ── Fallback para archivos de storage cuando el symlink no existe ─────────────
// Si el symlink public/storage existe y el servidor sirve el archivo estático,
// esta ruta nunca se ejecuta. Sólo actúa cuando el archivo no se resuelve
// estáticamente (symlink roto o inexistente en producción).
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

// Kiosk page — publicly accessible (anyone can see the UI)
Route::get('/attendance-kiosk', [\App\Http\Controllers\AttendanceKioskController::class, 'index'])->name('attendance-kiosk');

// Clock-face POST — requires kiosk token or lab IP
Route::middleware('lab.network')->post('/attendance-kiosk/clock-face', [\App\Http\Controllers\AttendanceKioskController::class, 'clockFace'])->name('attendance-kiosk.clock-face');

// WebAuthn kiosk authentication — requires kiosk token or lab IP
Route::middleware('lab.network')->group(function () {
    Route::post('/attendance-kiosk/webauthn/authentication-options', [\App\Http\Controllers\WebAuthnKioskController::class, 'authenticationOptions'])->name('attendance-kiosk.webauthn.authentication-options');
    Route::post('/attendance-kiosk/webauthn/verify', [\App\Http\Controllers\WebAuthnKioskController::class, 'verify'])->name('attendance-kiosk.webauthn.verify');
});

Route::middleware(['tenant.session', 'auth'])->group(function () {

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

    // CRM in-app notifications (JSON, session auth)
    Route::prefix('crm/notifications')->name('crm.notifications.')->group(function (): void {
        Route::get('/', [\App\Http\Controllers\CrmNotificationController::class, 'index'])->name('index');
        Route::post('read-all', [\App\Http\Controllers\CrmNotificationController::class, 'markAllRead'])->name('read-all');
        Route::post('{crmNotification}/read', [\App\Http\Controllers\CrmNotificationController::class, 'markRead'])->name('read');
    });

    // Chatbot API
    Route::get('/api/chatbot/conversations', [\App\Http\Controllers\ChatbotController::class, 'index'])->name('api.chatbot.index');
    Route::get('/api/chatbot/history/{id?}', [\App\Http\Controllers\ChatbotController::class, 'history'])->name('api.chatbot.history');
    Route::post('/api/chatbot', [\App\Http\Controllers\ChatbotController::class, 'handle'])->name('api.chatbot');
    Route::delete('/api/chatbot', [\App\Http\Controllers\ChatbotController::class, 'reset'])->name('api.chatbot.reset');

});

// Presupuesto público — sin autenticación (link compartible por WhatsApp)
Route::get('/q/{token}', [\App\Http\Controllers\QuoteController::class, 'publicShow'])->name('quotes.public');

// Portal del cliente — sin autenticación, acceso por token único
Route::get('/portal/{token}', [\App\Http\Controllers\CustomerPortalController::class, 'show'])->name('customer.portal');

// Panel de asignación — usa auth:sanctum (Bearer token) fuera del grupo de sesión
require __DIR__.'/modules/assign-panel.php';

require __DIR__.'/auth.php';
