<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\WarehouseController;

// Acciones especiales — ANTES del resource (evita que {stock} capture estos segmentos)
Route::post('stocks/adjust', [StockController::class, 'adjust'])->name('stocks.adjust');
Route::post('stocks/transfer', [StockController::class, 'transfer'])->name('stocks.transfer');

Route::resource('stocks', StockController::class);
Route::resource('stock-movements', StockMovementController::class);
Route::resource('warehouses', WarehouseController::class);
