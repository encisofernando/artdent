<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CashDrawerController;
use App\Http\Controllers\CashMovementController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\IncomeRecordController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseItemController;
use App\Http\Controllers\ComprasController;

Route::resource('cash-drawers', CashDrawerController::class);
Route::resource('cash-movements', CashMovementController::class);
Route::resource('cash-sessions', CashSessionController::class);

Route::resource('expenses', ExpenseController::class);
Route::resource('expense-categorys', ExpenseCategoryController::class);

Route::resource('income-records', IncomeRecordController::class);

Route::resource('purchases', PurchaseController::class);
Route::resource('purchase-items', PurchaseItemController::class);
Route::resource('compras', ComprasController::class);
