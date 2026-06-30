<?php

use App\Http\Controllers\HikVisionController;
use App\Http\Controllers\HikVisionWebhookController;
use Illuminate\Support\Facades\Route;

// Webhook — sin autenticación (el terminal llama a este endpoint)
Route::post('hikvision/webhook', [HikVisionWebhookController::class, 'receive'])
    ->name('hikvision.webhook')
    ->withoutMiddleware(['auth', 'verified']);

// Admin HikVision — requiere autenticación y permiso de staff
Route::middleware(['auth', 'verified', 'permission:staff.edit'])->prefix('hikvision')->name('hikvision.')->group(function () {
    // Dispositivos
    Route::get('devices', [HikVisionController::class, 'index'])->name('devices.index');
    Route::post('devices', [HikVisionController::class, 'store'])->name('devices.store');
    Route::put('devices/{hikVisionDevice}', [HikVisionController::class, 'update'])->name('devices.update');
    Route::delete('devices/{hikVisionDevice}', [HikVisionController::class, 'destroy'])->name('devices.destroy');

    // Acciones sobre el dispositivo
    Route::post('devices/{hikVisionDevice}/test-connection', [HikVisionController::class, 'testConnection'])->name('devices.test-connection');
    Route::post('devices/{hikVisionDevice}/sync-collaborators', [HikVisionController::class, 'syncCollaborators'])->name('devices.sync-collaborators');
    Route::post('devices/{hikVisionDevice}/subscribe-events', [HikVisionController::class, 'subscribeEvents'])->name('devices.subscribe-events');
    Route::post('devices/{hikVisionDevice}/sync-time', [HikVisionController::class, 'syncTime'])->name('devices.sync-time');
    Route::post('devices/{hikVisionDevice}/pull-records', [HikVisionController::class, 'pullRecords'])->name('devices.pull-records');
    Route::post('devices/{hikVisionDevice}/push-collaborator', [HikVisionController::class, 'pushCollaborator'])->name('devices.push-collaborator');

    // Log de eventos
    Route::get('events', [HikVisionController::class, 'events'])->name('events.index');
});
