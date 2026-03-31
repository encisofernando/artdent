<?php

use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/admin'));

// ── Webhooks (sin CSRF, sin auth) ────────────────────────────────────────────
Route::prefix('webhooks')->name('webhooks.')->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])->group(function () {
    Route::post('mercadopago', [WebhookController::class, 'mercadopago'])->name('mercadopago');
});

// ── Callback de retorno después del pago ─────────────────────────────────────
Route::get('subscriptions/callback', function (\Illuminate\Http\Request $request) {
    // El usuario regresa desde MP después de ingresar su tarjeta.
    // En este punto la suscripción puede estar aún "pending" — MP enviará
    // el webhook cuando sea autorizada (puede tardar unos segundos).
    return redirect('/')->with('success', '¡Suscripción procesada! Tu cuenta será activada en instantes.');
})->name('subscriptions.callback');
