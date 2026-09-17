<?php

use App\Http\Controllers\LabAccountController;
use App\Http\Controllers\LabAccountMoveController;
use App\Http\Controllers\LabFinanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('module:laboratorio')->group(function () {
    // Órdenes de Laboratorio (Legacy redirect hacia jobs)
    Route::redirect('laboratorios', '/jobs');
    Route::redirect('laboratorios/create', '/jobs/create');

    // Cuentas de Laboratorio
    Route::resource('lab-accounts', LabAccountController::class)->middleware('permission:orders.view');
    Route::resource('lab-account-moves', LabAccountMoveController::class)->middleware('permission:orders.edit');
    Route::get('lab-finance', [LabFinanceController::class, 'index'])->name('lab-finance.index')->middleware('permission:orders.view');
    Route::post('lab-finance/incomes', [LabFinanceController::class, 'storeIncome'])->name('lab-finance.incomes.store')->middleware('permission:orders.edit');
    Route::post('lab-finance/expenses', [LabFinanceController::class, 'storeExpense'])->name('lab-finance.expenses.store')->middleware('permission:orders.edit');
    Route::delete('lab-finance/incomes/{incomeRecord}', [LabFinanceController::class, 'destroyIncome'])->name('lab-finance.incomes.destroy')->middleware('permission:orders.edit');
    Route::delete('lab-finance/expenses/{expense}', [LabFinanceController::class, 'destroyExpense'])->name('lab-finance.expenses.destroy')->middleware('permission:orders.edit');
});
