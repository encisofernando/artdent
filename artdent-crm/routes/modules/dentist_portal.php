<?php

use App\Http\Controllers\DentistPortalAuthController;
use App\Http\Controllers\DentistPortalController;
use Illuminate\Support\Facades\Route;

// ── Portal del Odontólogo (autenticación independiente por email + código de un solo uso) ──

// Rutas públicas (login/verificación/logout)
Route::prefix('dentist-portal')->name('dentist-portal.')->group(function () {
    Route::get('login', [DentistPortalAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [DentistPortalAuthController::class, 'sendCode'])->name('login.send');
    Route::get('verify', [DentistPortalAuthController::class, 'showVerify'])->name('verify');
    Route::post('verify', [DentistPortalAuthController::class, 'verifyCode'])->name('verify.post');
    Route::post('logout', [DentistPortalAuthController::class, 'logout'])->name('logout');
});

// Rutas protegidas con la sesión del odontólogo
Route::prefix('dentist-portal')->name('dentist-portal.')->middleware(['web', 'tenant.session', 'dentist.portal.auth'])->group(function () {
    Route::get('/', [DentistPortalController::class, 'show'])->name('show');
    Route::post('request-pickup', [DentistPortalController::class, 'requestPickup'])->name('request-pickup');
    Route::get('moves/{move}/pdf', [DentistPortalController::class, 'movePdf'])->name('move-pdf');
});
