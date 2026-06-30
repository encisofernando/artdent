<?php

use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleItemController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\VentasController;
use Illuminate\Support\Facades\Route;

// ── Presupuestos ──────────────────────────────────────────────────────────────
Route::get('quotes', [QuoteController::class, 'index'])->name('quotes.index')->middleware('permission:sales.view');
Route::get('quotes/create', [QuoteController::class, 'create'])->name('quotes.create')->middleware('permission:sales.create');
Route::post('quotes', [QuoteController::class, 'store'])->name('quotes.store')->middleware('permission:sales.create');
Route::get('quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show')->middleware('permission:sales.view');
Route::patch('quotes/{quote}/status', [QuoteController::class, 'updateStatus'])->name('quotes.status')->middleware('permission:sales.edit');
Route::post('quotes/{quote}/send-email', [QuoteController::class, 'sendEmail'])->name('quotes.send-email')->middleware('permission:sales.edit');

// ── Ventas ────────────────────────────────────────────────────────────────────
Route::get('sales', [SaleController::class, 'index'])->name('sales.index')->middleware('permission:sales.view');
Route::get('sales/create', [SaleController::class, 'create'])->name('sales.create')->middleware('permission:sales.create');
Route::post('sales', [SaleController::class, 'store'])->name('sales.store')->middleware('permission:sales.create');
Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show')->middleware('permission:sales.view');
Route::get('sales/{sale}/edit', [SaleController::class, 'edit'])->name('sales.edit')->middleware('permission:sales.edit');
Route::put('sales/{sale}', [SaleController::class, 'update'])->name('sales.update')->middleware('permission:sales.edit');
Route::delete('sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy')->middleware('permission:sales.delete');
Route::post('sales/{sale}/pay', [SaleController::class, 'pay'])->name('sales.pay')->middleware('permission:sales.edit');
Route::post('sales/{sale}/generate-pdf', [SaleController::class, 'generatePdf'])->name('sales.generate-pdf')->middleware('permission:sales.view');
Route::post('sales/{sale}/send-email', [SaleController::class, 'sendEmail'])->name('sales.send-email')->middleware('permission:sales.view');

// Sub-recursos de venta (items y pagos)
Route::resource('sale-items', SaleItemController::class)->middleware('permission:sales.edit');
Route::resource('sale-payments', SalePaymentController::class)->middleware('permission:sales.edit');

// ── POS legado ────────────────────────────────────────────────────────────────
Route::get('ventas/pos', [VentasController::class, 'pos'])->name('ventas.pos')->middleware('permission:sales.view');
Route::resource('ventas', VentasController::class)->middleware('permission:sales.view');
