<?php

use Illuminate\Support\Facades\Route;

// panel.artdent.com.ar (mismo codebase/DB que pos.artdent.com.ar, ver
// config/crm.php "portal_only"): la raíz del sitio NO se registra acá —
// routes/modules/dentist_portal.php ya registra "/" (prefijo vacío en ese
// modo) apuntando a DentistPortalController::show(), cuyo middleware
// dentist.portal.auth ya redirige solo a "login" si no hay sesión. Definir
// otra ruta "/" acá también generaría un choque de rutas duplicadas.
if (! config('crm.portal_only')) {
    Route::get('/', function () {
        return redirect()->route('login');
    });
}

Route::get('/print-manager/download/{platform?}', [\App\Http\Controllers\PrintManagerDownloadController::class, 'download'])
    ->name('print-manager.download');

// Manifest PWA — dinámico en vez de archivo estático en public/ porque
// panel.artdent.com.ar (portal_only) y pos.artdent.com.ar comparten el mismo
// codebase pero necesitan un manifest distinto (start_url distinto, nombre
// distinto). Un archivo estático se desincroniza en cada deploy; una ruta no.
Route::get('/manifest.webmanifest', function () {
    if (config('crm.portal_only')) {
        return response()->json([
            'id' => '/',
            'name' => 'Portal de Odontólogos — ArtDent',
            'short_name' => 'Portal ArtDent',
            'description' => 'Consultá tus trabajos, pagos y el estado de tus órdenes con el laboratorio.',
            'lang' => 'es-AR',
            'dir' => 'ltr',
            'start_url' => '/?source=pwa',
            'scope' => '/',
            'display' => 'standalone',
            'display_override' => ['window-controls-overlay', 'standalone', 'browser'],
            'background_color' => '#020617',
            'theme_color' => '#0f172a',
            'categories' => ['business', 'medical'],
            'prefer_related_applications' => false,
            'icons' => [
                ['src' => '/pwa/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any maskable'],
                ['src' => '/pwa/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any maskable'],
            ],
        ]);
    }

    return response()->json([
        'id' => '/dashboard',
        'name' => 'ArtCode CRM',
        'short_name' => 'ArtCode CRM',
        'description' => 'Gestión comercial, laboratorio, e-commerce y finanzas de ArtCode en una experiencia instalable.',
        'lang' => 'es-AR',
        'dir' => 'ltr',
        'start_url' => '/dashboard?source=pwa',
        'scope' => '/',
        'display' => 'standalone',
        'display_override' => ['window-controls-overlay', 'standalone', 'browser'],
        'background_color' => '#020617',
        'theme_color' => '#0f172a',
        'categories' => ['business', 'medical', 'productivity'],
        'prefer_related_applications' => false,
        'icons' => [
            ['src' => '/pwa/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any maskable'],
            ['src' => '/pwa/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any maskable'],
        ],
        'shortcuts' => [
            [
                'name' => 'Panel General',
                'short_name' => 'Dashboard',
                'description' => 'Abrí el panel general del CRM',
                'url' => '/dashboard?source=pwa-shortcut',
                'icons' => [['src' => '/pwa/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png']],
            ],
            [
                'name' => 'Nueva Venta',
                'short_name' => 'Ventas',
                'description' => 'Creá una nueva venta desde la app instalada',
                'url' => '/sales/create?source=pwa-shortcut',
                'icons' => [['src' => '/pwa/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png']],
            ],
            [
                'name' => 'Órdenes',
                'short_name' => 'Órdenes',
                'description' => 'Consultá trabajos y órdenes del laboratorio',
                'url' => '/jobs?source=pwa-shortcut',
                'icons' => [['src' => '/pwa/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png']],
            ],
        ],
    ]);
})->name('manifest');

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

// ── Fallback para /tenant-storage/{path} (ver App\Support\TenantStorageUrl) ───
// Un symlink estático (público/tenant-storage → storage/tenantX/app/public)
// sólo sirve para un dominio de UN tenant fijo (ej. pos.artdent.com.ar). En un
// dominio multi-tenant real (pos.artcode.com.ar, varios tenants en la misma
// URL) no hay forma de que un symlink apunte a "el tenant correcto" según el
// request — hace falta resolverlo en runtime. Storage::disk('public') ya es
// tenant-aware (FilesystemTenancyBootstrapper, config/tenancy.php), así que
// esta ruta sirve el archivo del tenant activo sin necesitar el symlink en
// ningún dominio (donde el symlink SÍ existe y funciona, el webserver lo
// sirve directo y esta ruta ni se ejecuta).
Route::middleware('tenant.session')->get('/tenant-storage/{path}', function (string $path) {
    $realPath = \Illuminate\Support\Facades\Storage::disk('public')->path(ltrim($path, '/'));

    if (! file_exists($realPath) || is_dir($realPath)) {
        abort(404);
    }

    $mime = mime_content_type($realPath) ?: 'application/octet-stream';

    return response()->file($realPath, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');

// Attendance kiosk — publicly accessible
Route::get('/attendance-kiosk', [\App\Http\Controllers\AttendanceKioskController::class, 'index'])->name('attendance-kiosk');

// Job-phase kiosk — publicly accessible (same pattern as attendance kiosk).
// lab.network ahora también inicializa la tenancy del dueño de la IP/token
// (ver App\Http\Middleware\RestrictToLabNetwork) — module: recién puede
// evaluarse después de eso, por eso va en ese orden.
Route::middleware(['lab.network', 'module:laboratorio'])->group(function () {
    Route::get('/job-kiosk', [\App\Http\Controllers\JobPhaseKioskController::class, 'index'])->name('job-kiosk');
    Route::get('/job-kiosk/available-jobs', [\App\Http\Controllers\JobPhaseKioskController::class, 'availableJobs'])->name('job-kiosk.available-jobs');
    Route::get('/job-kiosk/in-progress', [\App\Http\Controllers\JobPhaseKioskController::class, 'inProgressPhases'])->name('job-kiosk.in-progress');
    Route::post('/job-kiosk/take-phase', [\App\Http\Controllers\JobPhaseKioskController::class, 'takePhase'])->name('job-kiosk.take-phase');
    Route::post('/job-kiosk/complete-phase', [\App\Http\Controllers\JobPhaseKioskController::class, 'completePhase'])->name('job-kiosk.complete-phase');
    Route::post('/job-kiosk/send-to-proof', [\App\Http\Controllers\JobPhaseKioskController::class, 'sendToProof'])->name('job-kiosk.send-to-proof');
    Route::post('/job-kiosk/return-from-proof/{job}', [\App\Http\Controllers\JobPhaseKioskController::class, 'returnFromProof'])->name('job-kiosk.return-from-proof');
});

// WebAuthn kiosk authentication — requires kiosk token or lab IP
Route::middleware(['lab.network', 'module:rrhh'])->group(function () {
    Route::post('/attendance-kiosk/webauthn/authentication-options', [\App\Http\Controllers\WebAuthnKioskController::class, 'authenticationOptions'])->name('attendance-kiosk.webauthn.authentication-options');
    Route::post('/attendance-kiosk/webauthn/verify', [\App\Http\Controllers\WebAuthnKioskController::class, 'verify'])->name('attendance-kiosk.webauthn.verify');
});

// ISUP listener ingest — sólo lo llama el proceso isup-listener (Node.js),
// nunca un terminal ni un navegador. isup.internal exige el token compartido;
// isup.tenant resuelve e inicializa la tenancy a partir del account_id del
// body (no hay sesión/dominio para resolverlo, igual que lab.network).
Route::middleware(['isup.internal', 'isup.tenant'])->prefix('internal/isup')->name('isup.internal.')->group(function () {
    Route::post('/connect', [\App\Http\Controllers\IsupIngestController::class, 'connect'])->name('connect');
    Route::post('/disconnect', [\App\Http\Controllers\IsupIngestController::class, 'disconnect'])->name('disconnect');
    Route::post('/events', [\App\Http\Controllers\IsupIngestController::class, 'events'])->name('events');
});

Route::middleware(['tenant.session', 'auth'])->group(function () {

    require __DIR__.'/modules/dashboard.php';

    Route::get('/ayuda', [\App\Http\Controllers\HelpController::class, 'index'])->name('help.index');

    require __DIR__.'/modules/support.php';

    require __DIR__.'/modules/products.php';
    require __DIR__.'/modules/inventory.php';

    require __DIR__.'/modules/clinic.php';
    require __DIR__.'/modules/laboratory.php';

    require __DIR__.'/modules/sales.php';
    require __DIR__.'/modules/finance.php';
    require __DIR__.'/modules/accounting.php';

    require __DIR__.'/modules/hr.php';
    require __DIR__.'/modules/ecommerce.php';
    require __DIR__.'/modules/hikvision.php';

    require __DIR__.'/modules/admin.php';

    require __DIR__.'/modules/profile.php';

    // CRM in-app notifications (JSON, session auth)
    Route::prefix('crm/notifications')->name('crm.notifications.')->group(function (): void {
        Route::get('/', [\App\Http\Controllers\CrmNotificationController::class, 'index'])->name('index');
        Route::post('read-all', [\App\Http\Controllers\CrmNotificationController::class, 'markAllRead'])->name('read-all');
        Route::post('{crmNotification}/read', [\App\Http\Controllers\CrmNotificationController::class, 'markRead'])->name('read');
    });

    // Chatbot API
    Route::middleware('module:chat_ia')->group(function (): void {
        Route::get('/api/chatbot/conversations', [\App\Http\Controllers\ChatbotController::class, 'index'])->name('api.chatbot.index');
        Route::get('/api/chatbot/history/{id?}', [\App\Http\Controllers\ChatbotController::class, 'history'])->name('api.chatbot.history');
        Route::post('/api/chatbot', [\App\Http\Controllers\ChatbotController::class, 'handle'])->name('api.chatbot');
        Route::delete('/api/chatbot', [\App\Http\Controllers\ChatbotController::class, 'reset'])->name('api.chatbot.reset');
    });

});

// Presupuesto público — sin autenticación (link compartible por WhatsApp)
Route::get('/q/{token}', [\App\Http\Controllers\QuoteController::class, 'publicShow'])->name('quotes.public');

// Portal del cliente — sin autenticación, acceso por token único
Route::get('/portal/{token}', [\App\Http\Controllers\CustomerPortalController::class, 'show'])->name('customer.portal');

// Portal de colaboradores — autenticación independiente por PIN
require __DIR__.'/modules/colaborador_portal.php';

// Portal del odontólogo — login por email + código de un solo uso
require __DIR__.'/modules/dentist_portal.php';

// Panel de asignación — usa auth:sanctum (Bearer token) fuera del grupo de sesión
require __DIR__.'/modules/assign-panel.php';

// En panel.artdent.com.ar (portal_only) el sitio entero ES el portal del
// odontólogo — las rutas de auth de staff (/login, /register, /forgot-password...)
// no tienen sentido ahí y, peor, "/login" choca en la tabla de rutas con
// dentist_portal.php (que registra su propio "login" con prefijo vacío en
// este modo), pisando esa ruta por completo (hasta el lookup por nombre).
if (! config('crm.portal_only')) {
    require __DIR__.'/auth.php';
}
