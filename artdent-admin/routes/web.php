<?php

use App\Http\Controllers\AfipIssuerController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KbArticleController;
use App\Http\Controllers\PaymentCredentialController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebhookController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));

// ── Webhooks (sin CSRF, sin auth) ────────────────────────────────────────────
Route::prefix('webhooks')->name('webhooks.')->withoutMiddleware([VerifyCsrfToken::class])->group(function () {
    Route::post('mercadopago', [WebhookController::class, 'mercadopago'])->name('mercadopago');
});

// ── Callback de retorno después del pago ─────────────────────────────────────
Route::get('subscriptions/callback', function (Request $request) {
    // El usuario regresa desde MP después de ingresar su tarjeta.
    // En este punto la suscripción puede estar aún "pending" — MP enviará
    // el webhook cuando sea autorizada (puede tardar unos segundos).
    return redirect('/')->with('success', '¡Suscripción procesada! Tu cuenta será activada en instantes.');
})->name('subscriptions.callback');

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// ── Alta self-service de tenants (público, sin auth) ─────────────────────────
// El aprovisionamiento real sólo ocurre en /signup/verify, tras confirmar el
// email — ver docblock de SignupController.
Route::prefix('signup')->name('signup.')->group(function () {
    Route::get('/', [SignupController::class, 'create'])->name('create');
    Route::post('/', [SignupController::class, 'store'])->name('store')->middleware('throttle:5,10');
    Route::get('check-email', [SignupController::class, 'checkEmail'])->name('check-email');
    Route::get('verify', [SignupController::class, 'verify'])->name('verify')->middleware('signed');
    Route::get('success', [SignupController::class, 'success'])->name('success');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// ── Panel (autenticado) ───────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::get('tenants/create', [TenantController::class, 'create'])->name('tenants.create');
    Route::post('tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::get('tenants/{tenant}/edit', [TenantController::class, 'edit'])->name('tenants.edit');
    Route::put('tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');
    Route::patch('tenants/{tenant}/activate', [TenantController::class, 'activate'])->name('tenants.activate');
    Route::patch('tenants/{tenant}/suspend', [TenantController::class, 'suspend'])->name('tenants.suspend');
    Route::patch('tenants/{tenant}/assign-owner', [TenantController::class, 'assignOwner'])->name('tenants.assign-owner');
    Route::post('tenants/{tenant}/checkout', [TenantController::class, 'generateCheckout'])->name('tenants.checkout');
    Route::post('tenants/{tenant}/user-maps', [TenantController::class, 'storeUserMap'])->name('tenants.user-maps.store');
    Route::delete('tenants/{tenant}/user-maps/{userMap}', [TenantController::class, 'destroyUserMap'])->name('tenants.user-maps.destroy');
    Route::put('tenants/{tenant}/modules/{module}', [TenantController::class, 'updateModule'])->name('tenants.modules.update');

    Route::get('plans', [PlanController::class, 'index'])->name('plans.index');
    Route::get('plans/create', [PlanController::class, 'create'])->name('plans.create');
    Route::post('plans', [PlanController::class, 'store'])->name('plans.store');
    Route::get('plans/{plan}/edit', [PlanController::class, 'edit'])->name('plans.edit');
    Route::put('plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('plans/{plan}', [PlanController::class, 'destroy'])->name('plans.destroy');
    Route::patch('plans/{plan}/toggle-active', [PlanController::class, 'toggleActive'])->name('plans.toggle-active');
    Route::patch('plans/{plan}/publish-to-mp', [PlanController::class, 'publishToMp'])->name('plans.publish-to-mp');
    Route::patch('plans/{plan}/sync-mp', [PlanController::class, 'syncMp'])->name('plans.sync-mp');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    Route::get('afip-issuer', [AfipIssuerController::class, 'edit'])->name('afip-issuer.edit');
    Route::put('afip-issuer', [AfipIssuerController::class, 'update'])->name('afip-issuer.update');
    Route::post('afip-issuer/upload', [AfipIssuerController::class, 'uploadCert'])->name('afip-issuer.upload');
    Route::post('afip-issuer/generate-csr', [AfipIssuerController::class, 'generateCsr'])->name('afip-issuer.generate-csr');
    Route::post('afip-issuer/test-connection', [AfipIssuerController::class, 'testConnection'])->name('afip-issuer.test-connection');

    Route::get('payment-credentials', [PaymentCredentialController::class, 'edit'])->name('payment-credentials.edit');
    Route::put('payment-credentials', [PaymentCredentialController::class, 'update'])->name('payment-credentials.update');
    Route::post('payment-credentials/test-connection', [PaymentCredentialController::class, 'testConnection'])->name('payment-credentials.test-connection');

    Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::patch('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
    Route::post('tickets/{ticket}/messages', [TicketController::class, 'storeMessage'])->name('tickets.messages.store');

    Route::get('kb-articles', [KbArticleController::class, 'index'])->name('kb-articles.index');
    Route::get('kb-articles/create', [KbArticleController::class, 'create'])->name('kb-articles.create');
    Route::post('kb-articles', [KbArticleController::class, 'store'])->name('kb-articles.store');
    Route::get('kb-articles/{kbArticle}/edit', [KbArticleController::class, 'edit'])->name('kb-articles.edit');
    Route::put('kb-articles/{kbArticle}', [KbArticleController::class, 'update'])->name('kb-articles.update');
    Route::delete('kb-articles/{kbArticle}', [KbArticleController::class, 'destroy'])->name('kb-articles.destroy');
    Route::patch('kb-articles/{kbArticle}/toggle-publish', [KbArticleController::class, 'togglePublish'])->name('kb-articles.toggle-publish');
});
