<?php

use App\Http\Controllers\LabWithdrawalController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

// Acciones especiales — ANTES del resource (evita que {stock} capture estos segmentos)
Route::post('stocks/adjust', [StockController::class, 'adjust'])->name('stocks.adjust');
Route::post('stocks/transfer', [StockController::class, 'transfer'])->name('stocks.transfer');

Route::resource('stocks', StockController::class)->only(['index']);
Route::resource('stock-movements', StockMovementController::class)->only(['index']);
Route::resource('warehouses', WarehouseController::class)->only(['index', 'store', 'update', 'destroy']);
Route::resource('lab-withdrawals', LabWithdrawalController::class)
    ->only(['index', 'create', 'store', 'show', 'destroy']);
