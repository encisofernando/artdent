<?php

use App\Http\Controllers\Api\NavePosPaymentController;
use App\Http\Controllers\HeldSaleController;
use App\Http\Controllers\InstallmentsSimulatorController;
use App\Http\Controllers\LoyaltyRewardController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleItemController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\SaleReturnController;
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
Route::post('sales/{sale}/nave-charge', [NavePosPaymentController::class, 'createForSale'])->name('sales.nave-charge')->middleware('permission:sales.edit');
Route::post('sales/{sale}/generate-pdf', [SaleController::class, 'generatePdf'])->name('sales.generate-pdf')->middleware('permission:sales.view');
Route::post('sales/{sale}/send-email', [SaleController::class, 'sendEmail'])->name('sales.send-email')->middleware('permission:sales.view');
Route::post('sales/{sale}/returns', [SaleReturnController::class, 'store'])->name('sales.returns.store')->middleware('permission:sales.edit');

// Recompensas de puntos disponibles para un cliente — selector de "Puntos"
// como medio de pago en Sale/Create.jsx (ver LoyaltyReward/*.jsx en
// Sistema → Administración para el CRUD del catálogo).
Route::get('customers/{customer}/loyalty-rewards', [LoyaltyRewardController::class, 'forCustomer'])->name('customers.loyalty-rewards')->middleware('permission:sales.create');

// Ventas en espera (carritos guardados sin confirmar)
Route::get('held-sales', [HeldSaleController::class, 'index'])->name('held-sales.index')->middleware('permission:sales.create');
Route::post('held-sales', [HeldSaleController::class, 'store'])->name('held-sales.store')->middleware('permission:sales.create');
Route::get('held-sales/{heldSale}', [HeldSaleController::class, 'show'])->name('held-sales.show')->middleware('permission:sales.create');
Route::delete('held-sales/{heldSale}', [HeldSaleController::class, 'destroy'])->name('held-sales.destroy')->middleware('permission:sales.create');

// Sub-recursos de venta (items y pagos)
Route::resource('sale-items', SaleItemController::class)->middleware('permission:sales.edit');
Route::resource('sale-payments', SalePaymentController::class)->middleware('permission:sales.edit');

// Estado de una intención de cobro Nave — compartido por el POS y por
// cuentas corrientes de clientes (routes/modules/ecommerce.php), no
// depende de ningún permiso puntual: NavePosPaymentController::status()
// ya valida que el intent pertenezca a la empresa activa.
Route::get('nave-charge-intents/{intent}/status', [NavePosPaymentController::class, 'status'])->name('nave-charge-intents.status');

// ── Simulador de cuotas Nave (solo lectura — la tabla de tasas se edita en
// Sistema → Administración, ver routes/modules/settings.php) ───────────────────
Route::get('installments-simulator', [InstallmentsSimulatorController::class, 'index'])->name('installments-simulator.index')->middleware('permission:sales.view');

// ── POS legado ────────────────────────────────────────────────────────────────
Route::get('ventas/pos', [VentasController::class, 'pos'])->name('ventas.pos')->middleware('permission:sales.view');
Route::resource('ventas', VentasController::class)->middleware('permission:sales.view');
