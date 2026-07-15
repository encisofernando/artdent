<?php

use App\Http\Controllers\SupportTicketController;
use Illuminate\Support\Facades\Route;

// Centro de soporte — sin gating de módulo (disponible para todos los
// tenants sin importar el plan, igual que /ayuda). Los tickets viven en la
// BD central compartida con artdent-admin (ver App\Models\Ticket).
Route::prefix('soporte')->name('support.')->group(function () {
    Route::get('/', [SupportTicketController::class, 'index'])->name('index');
    Route::post('/', [SupportTicketController::class, 'store'])->name('store');
    Route::get('/{ticket}', [SupportTicketController::class, 'show'])->name('show');
    Route::post('/{ticket}/messages', [SupportTicketController::class, 'storeMessage'])->name('messages.store');
});
