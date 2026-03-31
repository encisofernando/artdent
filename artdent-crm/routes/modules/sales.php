<?php

use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleItemController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\VentasController;
use Illuminate\Support\Facades\Route;

Route::resource('quotes', QuoteController::class)->except(['edit', 'update']);
Route::patch('quotes/{quote}/status', [QuoteController::class, 'updateStatus'])->name('quotes.status');
Route::post('quotes/{quote}/send-email', [QuoteController::class, 'sendEmail'])->name('quotes.send-email');

Route::resource('sales', SaleController::class);
Route::post('sales/{sale}/pay', [SaleController::class, 'pay'])->name('sales.pay');
Route::post('sales/{sale}/generate-pdf', [SaleController::class, 'generatePdf'])->name('sales.generate-pdf');
Route::post('sales/{sale}/send-email', [SaleController::class, 'sendEmail'])->name('sales.send-email');
Route::resource('sale-items', SaleItemController::class);
Route::resource('sale-payments', SalePaymentController::class);

// POS del controlador legacy — ANTES del resource
Route::get('ventas/pos', [VentasController::class, 'pos'])->name('ventas.pos');
Route::resource('ventas', VentasController::class);
