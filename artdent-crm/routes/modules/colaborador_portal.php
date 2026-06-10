<?php

use App\Http\Controllers\ColaboradorPortalController;
use App\Http\Controllers\TariffPhaseController;
use Illuminate\Support\Facades\Route;

// ── Portal de Colaboradores (autenticación independiente por PIN) ──────────────

// Rutas públicas (login/logout)
Route::prefix('colaboradores')->name('colaboradores.')->group(function () {
    Route::get('login', [ColaboradorPortalController::class, 'showLogin'])->name('login');
    Route::post('login', [ColaboradorPortalController::class, 'login'])->name('login.post');
    Route::post('logout', [ColaboradorPortalController::class, 'logout'])->name('logout');
});

// Rutas protegidas con autenticación de colaborador
Route::prefix('colaboradores')->name('colaboradores.')->middleware(['web', 'tenant.session', 'colaborador.auth'])->group(function () {
    Route::get('/', [ColaboradorPortalController::class, 'dashboard'])->name('dashboard');
    Route::post('jobs/{job}/claim', [ColaboradorPortalController::class, 'claim'])->name('jobs.claim');
    Route::get('jobs/{job}', [ColaboradorPortalController::class, 'showJob'])->name('jobs.show');
    Route::post('phases/{phase}/claim', [ColaboradorPortalController::class, 'claimPhase'])->name('phases.claim');
    Route::post('jobs/{job}/phases/{phase}/prueba', [ColaboradorPortalController::class, 'sendToPrueba'])->name('jobs.phases.prueba');
    Route::post('jobs/{job}/phases/{phase}/complete', [ColaboradorPortalController::class, 'completePhase'])->name('jobs.phases.complete');
    Route::get('jobs/{job}/phases/{phase}/ticket', [ColaboradorPortalController::class, 'showTicket'])->name('jobs.phases.ticket');
});

// ── Gestión de fases de aranceles (admin CRM) ─────────────────────────────────
Route::prefix('tariffs/{tariff}/phases')->name('tariff-phases.')->middleware(['web', 'tenant.session', 'auth', 'permission:products.edit'])->group(function () {
    Route::get('/', [TariffPhaseController::class, 'index'])->name('index');
    Route::post('/', [TariffPhaseController::class, 'store'])->name('store');
    Route::put('{phase}', [TariffPhaseController::class, 'update'])->name('update');
    Route::delete('{phase}', [TariffPhaseController::class, 'destroy'])->name('destroy');
});
