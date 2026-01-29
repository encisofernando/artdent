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
    // ✅ Recuperar contraseña (envía email con link)
    // IMPORTANTE: ya estamos dentro del prefijo "auth", evitar duplicar.
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);

});

// ── Protegido (con token Bearer)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('auth/me',       [AuthController::class, 'me']);
    Route::post('auth/logout',  [AuthController::class, 'logout']);

    // Catálogos y auxiliares
    Route::get('warehouses',        [WarehousesController::class, 'index']);
    // payment-methods y taxes se manejan por sus controllers dedicados (CRUD)

    // Productos
    Route::apiResource('products', ProductsController::class);
    // Stock por producto (dos entradas típicas)
    Route::get('products/{id}/stock', [StockController::class, 'productStock']);
    Route::get('stock/summary',       [StockController::class, 'summary']);

    // Clientes
    Route::apiResource('customers', CustomersController::class);

    // --- Added to match frontend services ---
    Route::apiResource('employees', \App\Http\Controllers\EmployeesController::class)->only(['index','show','store','update','destroy']);
    Route::apiResource('vendors', \App\Http\Controllers\VendorsController::class)->only(['index','show','store','update','destroy']);
    Route::get('invoice-types', [\App\Http\Controllers\InvoiceTypesController::class, 'index']);
    Route::get('payments', [\App\Http\Controllers\PaymentsController::class, 'index']);
    Route::post('payments', [\App\Http\Controllers\PaymentsController::class, 'store']);
    Route::get('receipts', [\App\Http\Controllers\ReceiptsController::class, 'index']);
    Route::post('receipts', [\App\Http\Controllers\ReceiptsController::class, 'store']);
    Route::get('roles', [\App\Http\Controllers\RolesController::class, 'index']);

    // === Colaboradores (Asistencias y Pagos) ===
    Route::apiResource('collaborators', CollaboratorsController::class)->only(['index','show','store','update','destroy']);
    Route::apiResource('collaborator-attendances', CollaboratorAttendancesController::class)->only(['index','store','update','destroy']);
    Route::post('collaborator-receipts/generate', [CollaboratorReceiptsController::class, 'generate']);
    Route::get('collaborator-receipts/{id}', [CollaboratorReceiptsController::class, 'show']);
    Route::apiResource('vendors', \App\Http\Controllers\VendorsController::class)->only(['index','show','store','update','destroy']);
    Route::get('invoice-types', [\App\Http\Controllers\InvoiceTypesController::class, 'index']);
    Route::get('payments', [\App\Http\Controllers\PaymentsController::class, 'index']);
    Route::post('payments', [\App\Http\Controllers\PaymentsController::class, 'store']);
    Route::get('receipts', [\App\Http\Controllers\ReceiptsController::class, 'index']);
    Route::post('receipts', [\App\Http\Controllers\ReceiptsController::class, 'store']);
    Route::get('roles', [\App\Http\Controllers\RolesController::class, 'index']);

    // Impuestos (taxes)
    Route::apiResource('taxes', \App\Http\Controllers\TaxesController::class)->only(['index','show','store','update','destroy']);
    // Métodos de pago
    Route::apiResource('payment-methods', \App\Http\Controllers\PaymentMethodsController::class)->only(['index','show','store','update','destroy']);

    // Empresas
    Route::get('companies/me', [\App\Http\Controllers\CompaniesController::class, 'me']);
    Route::get('companies/{company}', [\App\Http\Controllers\CompaniesController::class, 'show']);
    // Compat (frontend puede usar /company)
    Route::get('company', [\App\Http\Controllers\CompaniesController::class, 'me']);
    Route::get('company/{company}', [\App\Http\Controllers\CompaniesController::class, 'show']);

    // Categorías (si la tabla está vacía, devuelve [])
    Route::apiResource('categories', \App\Http\Controllers\CategoriesController::class)
        ->only(['index','show','store','update','destroy']);


    // Compras
    Route::apiResource('purchases', PurchasesController::class)->only(['index','show','store']);

    // Ventas
    Route::apiResource('sales', SalesController::class)->only(['index','show','store']);
    Route::post('sales/{sale}/items',    [SalesController::class, 'addItem']);
    Route::post('sales/{sale}/confirm',  [SalesController::class, 'confirm']);
    Route::post('sales/{sale}/invoice',  [SalesController::class, 'invoice']); // crea factura vía ARCA

    // Facturas
    Route::apiResource('invoices', InvoicesController::class)->only(['index','show','store']);

    // Promociones (por ahora sin tabla)
    Route::get('promotions', fn() => response()->json([]));

});
