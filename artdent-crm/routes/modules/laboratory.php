<?php

use App\Http\Controllers\LabAccountController;
use App\Http\Controllers\LabAccountMoveController;
use App\Http\Controllers\LabFinanceController;
use App\Http\Controllers\LaboratorioController;
use Illuminate\Support\Facades\Route;

// Órdenes de Laboratorio
Route::get('laboratorios', [LaboratorioController::class, 'index'])->name('laboratorios.index')->middleware('permission:orders.view');
Route::get('laboratorios/create', [LaboratorioController::class, 'create'])->name('laboratorios.create')->middleware('permission:orders.create');
Route::post('laboratorios', [LaboratorioController::class, 'store'])->name('laboratorios.store')->middleware('permission:orders.create');
Route::get('laboratorios/{laboratorio}/edit', [LaboratorioController::class, 'edit'])->name('laboratorios.edit')->middleware('permission:orders.edit');
Route::put('laboratorios/{laboratorio}', [LaboratorioController::class, 'update'])->name('laboratorios.update')->middleware('permission:orders.edit');
Route::delete('laboratorios/{laboratorio}', [LaboratorioController::class, 'destroy'])->name('laboratorios.destroy')->middleware('permission:orders.delete');

// Cuentas de Laboratorio
Route::resource('lab-accounts', LabAccountController::class)->middleware('permission:orders.view');
Route::resource('lab-account-moves', LabAccountMoveController::class)->middleware('permission:orders.edit');
Route::get('lab-finance', [LabFinanceController::class, 'index'])->name('lab-finance.index')->middleware('permission:orders.view');
Route::post('lab-finance/incomes', [LabFinanceController::class, 'storeIncome'])->name('lab-finance.incomes.store')->middleware('permission:orders.edit');
Route::post('lab-finance/expenses', [LabFinanceController::class, 'storeExpense'])->name('lab-finance.expenses.store')->middleware('permission:orders.edit');
Route::delete('lab-finance/incomes/{incomeRecord}', [LabFinanceController::class, 'destroyIncome'])->name('lab-finance.incomes.destroy')->middleware('permission:orders.edit');
Route::delete('lab-finance/expenses/{expense}', [LabFinanceController::class, 'destroyExpense'])->name('lab-finance.expenses.destroy')->middleware('permission:orders.edit');
