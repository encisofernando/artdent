<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\PurchasesController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\WarehousesController;

// ── Público (sin token)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/create-password', [AuthController::class, 'createPassword']); // para el flujo de CrearContraseña.jsx
});

// ── Protegido (con token Bearer)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('auth/me',       [AuthController::class, 'me']);
    Route::post('auth/logout',  [AuthController::class, 'logout']);

    // Catálogos y auxiliares
    Route::get('warehouses',        [WarehousesController::class, 'index']);
    Route::get('payment-methods',   [WarehousesController::class, 'paymentMethods']);
    Route::get('taxes',             [WarehousesController::class, 'taxes']);

    // Productos
    Route::apiResource('products', ProductsController::class);
    // Stock por producto (dos entradas típicas)
    Route::get('products/{id}/stock', [StockController::class, 'productStock']);
    Route::get('stock/summary',       [StockController::class, 'summary']);

    // Clientes
    Route::apiResource('customers', CustomersController::class);

    // Compras
    Route::apiResource('purchases', PurchasesController::class)->only(['index','show','store']);

    // Ventas
    Route::apiResource('sales', SalesController::class)->only(['index','show','store']);
    Route::post('sales/{sale}/items',    [SalesController::class, 'addItem']);
    Route::post('sales/{sale}/confirm',  [SalesController::class, 'confirm']);
    Route::post('sales/{sale}/invoice',  [SalesController::class, 'invoice']); // crea factura vía ARCA

    // Facturas
    Route::apiResource('invoices', InvoicesController::class)->only(['index','show','store']);
});
