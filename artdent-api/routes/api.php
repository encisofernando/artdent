<?php
// routes/api.php

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
use App\Http\Controllers\SalesHubController;
use App\Http\Controllers\ReceiptsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CouponsController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\Api\DashboardStatsController;

// Módulo laboratorio
use App\Http\Controllers\ClientController;      // → tabla clinics
use App\Http\Controllers\PatientController;     // → tabla patients
use App\Http\Controllers\JobTypeController;     // → tabla job_types
use App\Http\Controllers\TariffController;      // → tabla tariffs
use App\Http\Controllers\PaymentController;     // → lab payments (lab-payments)
use App\Http\Controllers\CostController;        // → tabla costs
use App\Http\Controllers\JobController;         // → tabla jobs
use App\Http\Controllers\DentistController;    // → tabla dentists
use App\Http\Controllers\MovementController;     // → tabla movements (histórico de cambios en jobs, costos, pagos, etc)


use App\Http\Controllers\API\ClinicController;
// ── Público (sin token/cookie) ────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/refresh',         [AuthController::class, 'refresh']);
    Route::post('/create-password', [AuthController::class, 'createPassword']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
});

// ── Catálogo público con auth opcional ───────────────────────────────────────
Route::prefix('catalog')->middleware('auth.optional')->group(function () {
    Route::get('/categories',         [PublicCatalogController::class, 'categories']);
    Route::get('/products',           [PublicCatalogController::class, 'products']);
    Route::get('/products/{product}', [PublicCatalogController::class, 'product']);
    // FIX: unificado en PublicOrdersController (había duplicado con CatalogController)
    Route::get('/orders/{code}',      [PublicOrdersController::class, 'show']);
    Route::post('/checkout',          [PublicCheckoutController::class, 'checkout']);
});

// ── Search ────────────────────────────────────────────────────────────────────
Route::prefix('search')->group(function () {
    Route::get('/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/popular',     [SearchController::class, 'popular']);
    Route::post('/track',      [SearchController::class, 'track']);
});

// ── Analytics ─────────────────────────────────────────────────────────────────
Route::prefix('analytics')->group(function () {
    Route::post('/product-view',  [AnalyticsController::class, 'productView']);
    Route::post('/product-click', [AnalyticsController::class, 'productClick']);
    Route::post('/add-to-cart',   [AnalyticsController::class, 'addToCart']);
    Route::post('/purchase',      [AnalyticsController::class, 'purchase']);
});

// Públicas sueltas
Route::get('/products/{product}/reviews', [ReviewsController::class, 'index']);
Route::get('/coupons/available',          [CouponsController::class, 'available']);
Route::post('/coupons/validate',          [CouponsController::class, 'validateCoupon']);
Route::post('/contact',                   [ContactController::class, 'store'])->name('contact.store');
Route::post('/collaborator-attendances/mark', [CollaboratorAttendancesController::class, 'markAttendance']);

// ── Protegido (cookie Sanctum o Bearer token) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Verificación de sesión al iniciar la SPA
    Route::get('/user',         [AuthController::class, 'me']);   // alias Sanctum estándar
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Empresa (propio)
    Route::get('/companies/me', [CompaniesController::class, 'me']);
    Route::get('/company',      [CompaniesController::class, 'me']); // alias legacy

    // QR asistencia
    Route::get('/attendance/generate-qr', [CollaboratorAttendancesController::class, 'generateDailyQr']);

    // Contacto (admin de mensajes)
    // ⚠️  /stats/summary ANTES de /{id} para evitar que Laravel matchee "stats" como ID
    Route::prefix('contact')->group(function () {
        Route::get('/',              [ContactController::class, 'index'])->name('contact.index');
        Route::get('/stats/summary', [ContactController::class, 'stats'])->name('contact.stats');
        Route::get('/{id}',          [ContactController::class, 'show'])->name('contact.show');
        Route::patch('/{id}/status', [ContactController::class, 'updateStatus'])->name('contact.updateStatus');
        Route::delete('/{id}',       [ContactController::class, 'destroy'])->name('contact.destroy');
    });

    // Reviews (usuario)
    Route::post('/products/{product}/reviews',   [ReviewsController::class, 'store']);
    Route::post('/reviews/{review}/helpful',     [ReviewsController::class, 'markAsHelpful']);
    Route::post('/reviews/{review}/not-helpful', [ReviewsController::class, 'markAsNotHelpful']);

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/',                [WishlistController::class, 'index']);
        Route::post('/',               [WishlistController::class, 'store']);
        Route::put('/{wishlist}',      [WishlistController::class, 'update']);
        Route::delete('/{wishlist}',   [WishlistController::class, 'destroy']);
        Route::get('/check/{product}', [WishlistController::class, 'check']);
    });

    // Order tracking (usuario)
    Route::get('/orders/{order}/tracking', [OrderTrackingController::class, 'show']);
    Route::get('/my-orders',               [OrderTrackingController::class, 'myOrders']);

    // Notificaciones
    Route::prefix('notifications')->group(function () {
        Route::get('/',                     [NotificationsController::class, 'index']);
        Route::get('/unread-count',         [NotificationsController::class, 'unreadCount']);
        Route::get('/preferences',          [NotificationsController::class, 'getPreferences']);
        Route::put('/preferences',          [NotificationsController::class, 'updatePreferences']);
        Route::post('/{notification}/read', [NotificationsController::class, 'markAsRead']);
        Route::post('/mark-all-read',       [NotificationsController::class, 'markAllAsRead']);
        Route::delete('/{notification}',    [NotificationsController::class, 'destroy']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats',               [DashboardStatsController::class, 'getStats']);
        Route::get('/charts',              [DashboardStatsController::class, 'getChartData']);
        Route::get('/recent-transactions', [DashboardStatsController::class, 'getRecentTransactions']);
        Route::get('/export/pdf',          [DashboardStatsController::class, 'exportPDF']);
        Route::get('/layout',              [DashboardStatsController::class, 'getLayout']);
        Route::post('/layout',             [DashboardStatsController::class, 'saveLayout']);
    });

    // ── Admin only ────────────────────────────────────────────────────────────
    Route::middleware('role:Admin')->group(function () {

        // Almacenes
        Route::apiResource('warehouses', WarehousesController::class);
        Route::get('/taxes',           [WarehousesController::class, 'taxes']);
        Route::get('/payment-methods', [WarehousesController::class, 'paymentMethods']);

        // Productos
        Route::apiResource('products', ProductsController::class);
        Route::get('/products/{product}/stock',                   [StockController::class, 'productStock']);
        Route::get('/stock/summary',                              [StockController::class, 'summary']);
        Route::get('/products/{product}/images',                  [ProductsController::class, 'listImages']);
        Route::post('/products/{product}/images',                 [ProductsController::class, 'uploadImage']);
        Route::post('/products/{product}/images/{image}/primary', [ProductsController::class, 'setImagePrimary']);
        Route::delete('/products/{product}/images/{image}',       [ProductsController::class, 'deleteImage']);

        // Reviews (admin)
        Route::post('/reviews/{review}/vendor-response', [ReviewsController::class, 'storeVendorResponse']);
        Route::put('/reviews/{review}/approve',          [ReviewsController::class, 'approve']);
        Route::delete('/reviews/{review}',               [ReviewsController::class, 'destroy']);

        // Cupones (admin)
        Route::prefix('coupons')->group(function () {
            Route::get('/',               [CouponsController::class, 'index']);
            Route::post('/',              [CouponsController::class, 'store']);
            Route::put('/{coupon}',       [CouponsController::class, 'update']);
            Route::delete('/{coupon}',    [CouponsController::class, 'destroy']);
            Route::get('/{coupon}/usage', [CouponsController::class, 'usage']);
        });

        // Order tracking (admin)
        Route::post('/orders/{order}/tracking',           [OrderTrackingController::class, 'addUpdate']);
        Route::put('/orders/{order}/tracking/{tracking}', [OrderTrackingController::class, 'updateStatus']);

        // Clientes e-commerce
        Route::apiResource('customers', CustomersController::class);

        // Empleados
        Route::apiResource('employees', \App\Http\Controllers\EmployeesController::class)
            ->only(['index', 'show', 'store', 'update', 'destroy']);

        // Colaboradores
        Route::apiResource('collaborators', CollaboratorsController::class)
            ->only(['index', 'show', 'store', 'update', 'destroy']);
        Route::apiResource('collaborator-attendances', CollaboratorAttendancesController::class)
            ->only(['index', 'store', 'update', 'destroy']);
        Route::post('/collaborator-receipts/generate', [CollaboratorReceiptsController::class, 'generate']);
        Route::get('/collaborator-receipts/{id}',      [CollaboratorReceiptsController::class, 'show']);

        // Proveedores
        Route::apiResource('vendors', \App\Http\Controllers\VendorsController::class)
            ->only(['index', 'show', 'store', 'update', 'destroy']);

        // Facturación / pagos e-commerce
        // ⚠️  Separados de lab-payments para evitar colisión de rutas
        Route::get('/invoice-types', [\App\Http\Controllers\InvoiceTypesController::class, 'index']);
        Route::get('/payments',      [\App\Http\Controllers\PaymentsController::class, 'index']);
        Route::post('/payments',     [\App\Http\Controllers\PaymentsController::class, 'store']);

        // Recibos
        Route::get('/receipts',              [ReceiptsController::class, 'index']);
        Route::post('/receipts',             [ReceiptsController::class, 'store']);
        Route::delete('/receipts/{receipt}', [ReceiptsController::class, 'destroy']);

        // Roles / Impuestos
        Route::get('/roles', [\App\Http\Controllers\RolesController::class, 'index']);
        Route::apiResource('taxes', \App\Http\Controllers\TaxesController::class)
            ->only(['index', 'show', 'store', 'update', 'destroy']);

        // Compras
        Route::apiResource('purchases', PurchasesController::class)
            ->only(['index', 'show', 'store']);

        // Ventas POS
        Route::apiResource('sales', SalesController::class)
            ->only(['index', 'show', 'store', 'update']);
        Route::post('/sales/{sale}/items',    [SalesController::class, 'addItem']);
        Route::post('/sales/{sale}/confirm',  [SalesController::class, 'confirm']);
        Route::post('/sales/{sale}/invoice',  [SalesController::class, 'invoice']);
        Route::post('/sales/{sale}/cancel',   [SalesController::class, 'cancel']);
        Route::post('/sales/{sale}/receipts', [SalesController::class, 'receipts']);

        // Facturas
        Route::apiResource('invoices', InvoicesController::class)
            ->only(['index', 'show', 'store']);

        // Hub POS + e-commerce
        Route::get('/sales-hub',                       [SalesHubController::class, 'index']);
        Route::get('/sales-hub/{source}/{id}',         [SalesHubController::class, 'show']);
        Route::put('/sales-hub/{source}/{id}',         [SalesHubController::class, 'update']);
        Route::post('/sales-hub/{source}/{id}/cancel', [SalesHubController::class, 'cancel']);

        // Categorías
        Route::apiResource('categories', CategoriesController::class);

        // Promociones
        Route::get('/promotions', [PromotionsController::class, 'index']);

        // Empresa (admin)
        Route::get('/companies/{company}', [CompaniesController::class, 'show']);

        // ── Módulo Laboratorio ────────────────────────────────────────────────
        // clients   → tabla clinics  (clínicas / odontólogos / clientes del lab)
        // patients  → tabla patients
        // job-types → tabla job_types
        // jobs      → tabla jobs
        // tariffs   → tabla tariffs
        // lab-payments → PaymentController (renombrado para no chocar con /payments)
        // costs     → tabla costs
        Route::apiResource('clients',      ClientController::class);
        Route::apiResource('patients',     PatientController::class);
        Route::apiResource('dentists',     DentistController::class);
        Route::apiResource('job-types',    JobTypeController::class);
        Route::apiResource('jobs',         JobController::class);
        Route::apiResource('tariffs',      TariffController::class);
        Route::apiResource('lab-payments', PaymentController::class);
        Route::apiResource('costs',        CostController::class);
        Route::apiResource('clinics', ClinicController::class);
        Route::apiResource('movements', MovementController::class);
    });
});
