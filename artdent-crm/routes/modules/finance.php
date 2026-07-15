<?php

use App\Http\Controllers\CashDrawerController;
use App\Http\Controllers\CashMovementController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\ComprasController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeRecordController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseItemController;
use Illuminate\Support\Facades\Route;

Route::middleware('module:finanzas')->group(function () {
    // Gestión de Caja y Movimientos
    Route::get('cash-drawers', [CashDrawerController::class, 'index'])->name('cash-drawers.index')->middleware('permission:reports.view');
    Route::post('cash-drawers', [CashDrawerController::class, 'store'])->name('cash-drawers.store')->middleware('permission:reports.create');
    Route::put('cash-drawers/{cashDrawer}', [CashDrawerController::class, 'update'])->name('cash-drawers.update')->middleware('permission:reports.create');
    Route::delete('cash-drawers/{cashDrawer}', [CashDrawerController::class, 'destroy'])->name('cash-drawers.destroy')->middleware('permission:reports.create');

    Route::get('cash-sessions', [CashSessionController::class, 'index'])->name('cash-sessions.index')->middleware('permission:reports.view');
    Route::post('cash-sessions', [CashSessionController::class, 'store'])->name('cash-sessions.store')->middleware('permission:reports.create');
    Route::get('cash-sessions/{cashSession}', [CashSessionController::class, 'show'])->name('cash-sessions.show')->middleware('permission:reports.view');
    Route::put('cash-sessions/{cashSession}/close', [CashSessionController::class, 'close'])->name('cash-sessions.close')->middleware('permission:reports.create');
    Route::delete('cash-sessions/{cashSession}', [CashSessionController::class, 'destroy'])->name('cash-sessions.destroy')->middleware('permission:reports.create');

    Route::post('cash-movements', [CashMovementController::class, 'store'])->name('cash-movements.store')->middleware('permission:reports.create');
    Route::delete('cash-movements/{cashMovement}', [CashMovementController::class, 'destroy'])->name('cash-movements.destroy')->middleware('permission:reports.create');

    // Gastos e Ingresos
    Route::resource('expenses', ExpenseController::class)->middleware('permission:reports.create');
    Route::resource('expense-categorys', ExpenseCategoryController::class)->middleware('permission:settings.edit');
    Route::resource('income-records', IncomeRecordController::class)->middleware('permission:reports.view');

    // Compras (Relacionado con Inventario/Reportes)
    Route::resource('purchases', PurchaseController::class)->middleware('permission:reports.view');
    Route::resource('purchase-items', PurchaseItemController::class)->middleware('permission:reports.view');
    Route::resource('compras', ComprasController::class)->middleware('permission:reports.view');
});
