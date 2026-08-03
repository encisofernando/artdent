<?php

use App\Http\Controllers\InsumosFinanceController;
use App\Http\Controllers\LabWithdrawalController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware('module:insumos')->group(function () {
    // ── Lectura de stock ──────────────────────────────────────────────────────────
    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('stocks', [StockController::class, 'index'])->name('stocks.index');
        Route::get('stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
        Route::get('warehouses', [WarehouseController::class, 'index'])->name('warehouses.index');
        Route::get('lab-withdrawals', [LabWithdrawalController::class, 'index'])->name('lab-withdrawals.index');
    });

    // ── Retiros de insumos ────────────────────────────────────────────────────────
    // create/store DEBEN ir antes del wildcard {labWithdrawal}
    Route::middleware('permission:inventory.create')->group(function () {
        Route::get('lab-withdrawals/create', [LabWithdrawalController::class, 'create'])->name('lab-withdrawals.create');
        Route::post('lab-withdrawals', [LabWithdrawalController::class, 'store'])->name('lab-withdrawals.store');
    });

    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('lab-withdrawals/{labWithdrawal}', [LabWithdrawalController::class, 'show'])->name('lab-withdrawals.show');
    });

    // ── Gestión de depósitos ──────────────────────────────────────────────────────
    Route::middleware('permission:inventory.edit')->group(function () {
        Route::post('warehouses', [WarehouseController::class, 'store'])->name('warehouses.store');
        Route::put('warehouses/{warehouse}', [WarehouseController::class, 'update'])->name('warehouses.update');
        Route::delete('warehouses/{warehouse}', [WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    });

    Route::delete('lab-withdrawals/{labWithdrawal}', [LabWithdrawalController::class, 'destroy'])
        ->name('lab-withdrawals.destroy')
        ->middleware('permission:inventory.delete');

    // ── Operaciones privilegiadas (ajustes manuales y transferencias) ─────────────
    Route::middleware('permission:inventory.manage')->group(function () {
        Route::post('stocks/adjust', [StockController::class, 'adjust'])->name('stocks.adjust');
        Route::post('stocks/transfer', [StockController::class, 'transfer'])->name('stocks.transfer');
    });

    // ── Ingresos y egresos manuales de Insumos (scope='insumos', ver LabFinance) ───
    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('insumos-finance', [InsumosFinanceController::class, 'index'])->name('insumos-finance.index');
    });

    Route::middleware('permission:inventory.edit')->group(function () {
        Route::post('insumos-finance/incomes', [InsumosFinanceController::class, 'storeIncome'])->name('insumos-finance.incomes.store');
        Route::post('insumos-finance/expenses', [InsumosFinanceController::class, 'storeExpense'])->name('insumos-finance.expenses.store');
        Route::delete('insumos-finance/incomes/{incomeRecord}', [InsumosFinanceController::class, 'destroyIncome'])->name('insumos-finance.incomes.destroy');
        Route::delete('insumos-finance/expenses/{expense}', [InsumosFinanceController::class, 'destroyExpense'])->name('insumos-finance.expenses.destroy');
    });
});
