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

// Gestión de Caja y Movimientos — fuera de module:finanzas a propósito: Caja
// ya tiene su propio gate (cash_register_settings.is_enabled, toggle en
// Settings → Caja) independiente del sistema de módulos de plan. Meterla
// también bajo "finanzas" duplicaba el control y dejaba a tenants sin ese
// módulo de plan sin poder usar Caja aunque la hubieran activado ellos
// mismos. cash-register.view: ve montos/historial/informes.
// cash-register.operate: sólo puede abrir y cerrar una caja "a ciegas" (sin
// ver contenido) — CashSessionController decide qué devolver según cuál de
// los dos tenga el usuario. Administrar cajas físicas (cash-drawers) y
// movimientos manuales quedan reservados a view.
Route::get('cash-drawers', [CashDrawerController::class, 'index'])->name('cash-drawers.index')->middleware('permission:cash-register.view');
Route::post('cash-drawers', [CashDrawerController::class, 'store'])->name('cash-drawers.store')->middleware('permission:cash-register.view');
Route::put('cash-drawers/{cashDrawer}', [CashDrawerController::class, 'update'])->name('cash-drawers.update')->middleware('permission:cash-register.view');
Route::delete('cash-drawers/{cashDrawer}', [CashDrawerController::class, 'destroy'])->name('cash-drawers.destroy')->middleware('permission:cash-register.view');

Route::get('cash-sessions', [CashSessionController::class, 'index'])->name('cash-sessions.index')->middleware('permission:cash-register.view|cash-register.operate');
Route::post('cash-sessions', [CashSessionController::class, 'store'])->name('cash-sessions.store')->middleware('permission:cash-register.view|cash-register.operate');
Route::get('cash-sessions/{cashSession}', [CashSessionController::class, 'show'])->name('cash-sessions.show')->middleware('permission:cash-register.view|cash-register.operate');
Route::put('cash-sessions/{cashSession}/close', [CashSessionController::class, 'close'])->name('cash-sessions.close')->middleware('permission:cash-register.view|cash-register.operate');
Route::delete('cash-sessions/{cashSession}', [CashSessionController::class, 'destroy'])->name('cash-sessions.destroy')->middleware('permission:cash-register.view');

Route::post('cash-movements', [CashMovementController::class, 'store'])->name('cash-movements.store')->middleware('permission:cash-register.view');
Route::delete('cash-movements/{cashMovement}', [CashMovementController::class, 'destroy'])->name('cash-movements.destroy')->middleware('permission:cash-register.view');

Route::middleware('module:finanzas')->group(function () {
    // Gastos e Ingresos
    Route::resource('expenses', ExpenseController::class)->middleware('permission:reports.create');
    Route::resource('expense-categorys', ExpenseCategoryController::class)->middleware('permission:settings.edit');
    Route::resource('income-records', IncomeRecordController::class)->middleware('permission:reports.view');

    // Compras (Relacionado con Inventario/Reportes)
    Route::resource('purchases', PurchaseController::class)->middleware('permission:reports.view');
    Route::resource('purchase-items', PurchaseItemController::class)->middleware('permission:reports.view');
    Route::resource('compras', ComprasController::class)->middleware('permission:reports.view');
});
