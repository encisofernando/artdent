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
use App\Http\Controllers\CollaboratorsController;
use App\Http\Controllers\CollaboratorAttendancesController;
use App\Http\Controllers\CollaboratorReceiptsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\CompaniesController;
use App\Http\Controllers\PromotionsController;
use App\Http\Controllers\ProductImagesController;
use App\Http\Controllers\Catalog\CatalogController as PublicCatalogController;
use App\Http\Controllers\Catalog\CheckoutController as PublicCheckoutController;
use App\Http\Controllers\Catalog\OrdersController as PublicOrdersController;

// ── Público (sin token)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/create-password', [AuthController::class, 'createPassword']); // para el flujo de CrearContraseña.jsx
    // ✅ Recuperar contraseña (envía email con link)
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);

});

// ── Catálogo público (sin login) con auth opcional para precios B2B
Route::prefix('catalog')->middleware('auth.optional')->group(function () {
    Route::get('/categories', [PublicCatalogController::class, 'categories']);
    Route::get('/products', [PublicCatalogController::class, 'products']);
    Route::get('/products/{product}', [PublicCatalogController::class, 'product']);

    // Checkout: crea orden + items (guest o autenticado)
    Route::post('/checkout', [PublicCheckoutController::class, 'checkout']);

    // Consulta de pedido por código (si es invitado, requiere email en query)
    Route::get('/orders/{code}', [PublicOrdersController::class, 'show']);
});

// ── Protegido (con token Bearer)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('auth/me',       [AuthController::class, 'me']);
    Route::post('auth/logout',  [AuthController::class, 'logout']);

    // Catálogos y auxiliares
    Route::get('warehouses',        [WarehousesController::class, 'index']);
    Route::get('payment-methods',   [WarehousesController::class, 'paymentMethods']);
    Route::get('taxes', fn() => response()->json([
    ['id' => 0,  'name' => 'Exento',    'rate' => 0],
    ['id' => 10, 'name' => 'IVA 10.5%', 'rate' => 10.5],
    ['id' => 21, 'name' => 'IVA 21%',   'rate' => 21],
    ]));

    // Productos
    Route::apiResource('products', ProductsController::class);
    // Imágenes de productos (backoffice)
    Route::get('products/{product}/images', [ProductImagesController::class, 'index']);
    Route::post('products/{product}/images', [ProductImagesController::class, 'store']);
    Route::post('products/{product}/images/{image}/primary', [ProductImagesController::class, 'setPrimary']);
    Route::delete('products/{product}/images/{image}', [ProductImagesController::class, 'destroy']);
    // Stock por producto (dos entradas típicas)
    Route::get('products/{product}/stock', [StockController::class, 'productStock']);
    Route::get('stock/summary',            [StockController::class, 'summary']);

    // Clientes
    Route::apiResource('customers', CustomersController::class);

    // --- Added to match frontend services ---
    Route::apiResource('employees', \App\Http\Controllers\EmployeesController::class)->only(['index','show','store','update','destroy']);

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


    // Compras
    Route::apiResource('purchases', PurchasesController::class)->only(['index','show','store']);

    // Ventas
    Route::apiResource('sales', SalesController::class)->only(['index','show','store']);
    Route::post('sales/{sale}/items',    [SalesController::class, 'addItem']);
    Route::post('sales/{sale}/confirm',  [SalesController::class, 'confirm']);
    Route::post('sales/{sale}/invoice',  [SalesController::class, 'invoice']); // crea factura vía ARCA

    // Facturas
    Route::apiResource('invoices', InvoicesController::class)->only(['index','show','store']);

    // routes/api.php
    // Catálogos
    Route::apiResource('categories', CategoriesController::class)->only(['index','show','store','update','destroy']);

    // Promociones (placeholder: si en el futuro agregás tabla/promos)
    Route::get('promotions', [PromotionsController::class, 'index']);

    // Empresa del usuario autenticado
    Route::get('companies/me', [CompaniesController::class, 'me']);
    Route::get('companies/{company}', [CompaniesController::class, 'show']);

});
