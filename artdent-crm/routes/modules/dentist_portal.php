<?php

use App\Http\Controllers\Api\LabAccountMercadoPagoController;
use App\Http\Controllers\Api\NavePosPaymentController;
use App\Http\Controllers\DentistPortalAuthController;
use App\Http\Controllers\DentistPortalController;
use App\Http\Controllers\DentistPortalOrderController;
use App\Http\Controllers\DentistPortalPaymentReportController;
use Illuminate\Support\Facades\Route;

// ── Portal del Odontólogo (autenticación independiente por email + código de un solo uso) ──
//
// En un deploy "portal_only" (panel.artdent.com.ar) TODO el sitio es el
// portal — paths limpios en la raíz. En el CRM normal (pos.artdent.com.ar)
// queda bajo /dentist-portal, sin cambios de comportamiento.
$dentistPortalPrefix = config('crm.portal_only') ? '' : 'dentist-portal';

// Rutas públicas (login/verificación/logout)
Route::prefix($dentistPortalPrefix)->name('dentist-portal.')->group(function () {
    Route::get('login', [DentistPortalAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [DentistPortalAuthController::class, 'sendCode'])->name('login.send');
    Route::get('verify', [DentistPortalAuthController::class, 'showVerify'])->name('verify');
    Route::post('verify', [DentistPortalAuthController::class, 'verifyCode'])->name('verify.post');
    Route::post('logout', [DentistPortalAuthController::class, 'logout'])->name('logout');
});

// Rutas protegidas con la sesión del odontólogo
Route::prefix($dentistPortalPrefix)->name('dentist-portal.')->middleware(['web', 'tenant.session', 'dentist.portal.auth'])->group(function () {
    Route::get('/', [DentistPortalController::class, 'show'])->name('show');
    Route::get('jobs/{job}', [DentistPortalController::class, 'showJob'])->name('jobs.show');
    Route::get('orders/new', [DentistPortalOrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [DentistPortalOrderController::class, 'store'])->name('orders.store');
    Route::get('account/report-payment', [DentistPortalPaymentReportController::class, 'create'])->name('account.report-payment.create');
    Route::post('account/report-payment', [DentistPortalPaymentReportController::class, 'store'])->name('account.report-payment.store');
    Route::get('account/checkout', [DentistPortalController::class, 'showCheckout'])->name('account.checkout');
    Route::post('account/nave-charge', [NavePosPaymentController::class, 'createForLabAccount'])->name('account.nave-charge');
    Route::post('account/mp-preference', [LabAccountMercadoPagoController::class, 'createPreference'])->name('account.mp-preference');
    Route::get('nave-charge-intents/{intent}/status', [NavePosPaymentController::class, 'statusForLabAccount'])->name('nave-charge-intents.status');
    Route::post('request-pickup', [DentistPortalController::class, 'requestPickup'])->name('request-pickup');
    Route::get('moves/{move}/pdf', [DentistPortalController::class, 'movePdf'])->name('move-pdf');
});
