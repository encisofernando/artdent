<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleItemController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\VentasController;

Route::resource('sales', SaleController::class);
Route::resource('sale-items', SaleItemController::class);
Route::resource('sale-payments', SalePaymentController::class);

// POS del controlador legacy — ANTES del resource
Route::get('ventas/pos', [VentasController::class, 'pos'])->name('ventas.pos');
Route::resource('ventas', VentasController::class);
