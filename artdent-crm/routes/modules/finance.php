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

// Gestión de Caja y Movimientos
Route::resource('cash-drawers', CashDrawerController::class)->middleware('permission:reports.view');
Route::resource('cash-movements', CashMovementController::class)->middleware('permission:reports.create');
Route::resource('cash-sessions', CashSessionController::class)->middleware('permission:reports.view');

// Gastos e Ingresos
Route::resource('expenses', ExpenseController::class)->middleware('permission:reports.create');
Route::resource('expense-categorys', ExpenseCategoryController::class)->middleware('permission:settings.edit');
Route::resource('income-records', IncomeRecordController::class)->middleware('permission:reports.view');

// Compras (Relacionado con Inventario/Reportes)
Route::resource('purchases', PurchaseController::class)->middleware('permission:reports.view');
Route::resource('purchase-items', PurchaseItemController::class)->middleware('permission:reports.view');
Route::resource('compras', ComprasController::class)->middleware('permission:reports.view');
