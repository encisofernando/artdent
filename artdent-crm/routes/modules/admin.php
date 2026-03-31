<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceItemController;
use App\Http\Controllers\InvoiceTypeController;
use App\Http\Controllers\NewsletterSubscriberController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\ShippingMethodController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VariantAttributeValueController;
use App\Http\Controllers\VendorAccountController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorPaymentController;
use Illuminate\Support\Facades\Route;

// Usuarios
Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users.view');
Route::get('users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:users.create');
Route::post('users', [UserController::class, 'store'])->name('users.store')->middleware('permission:users.create');
Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:users.edit');
Route::put('users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users.edit');
Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users.delete');

// Roles y Permisos
Route::get('roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:roles.view');
Route::post('roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:roles.create');
Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:roles.edit');
Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:roles.delete');

// Suscripción SaaS
Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
Route::post('subscription/checkout', [SubscriptionController::class, 'checkout'])->name('subscription.checkout');
Route::post('subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');

Route::get('settings', [CompanyController::class, 'edit'])->name('settings.edit');
Route::put('settings', [CompanyController::class, 'update'])->name('settings.update');

Route::resource('branchs', BranchController::class);

Route::resource('vendors', VendorController::class);

// Gestión de Proveedores
Route::prefix('proveedores')->name('proveedores.')->group(function () {
    // Comprobantes (Facturas / Remitos de compra)
    Route::prefix('comprobantes')->name('comprobantes.')->group(function () {
        Route::get('/', [PurchaseController::class, 'index'])->name('index');
        Route::get('/create', [PurchaseController::class, 'create'])->name('create');
        Route::post('/', [PurchaseController::class, 'store'])->name('store');
        Route::get('/{purchase}', [PurchaseController::class, 'show'])->name('show');
        Route::get('/{purchase}/edit', [PurchaseController::class, 'edit'])->name('edit');
        Route::put('/{purchase}', [PurchaseController::class, 'update'])->name('update');
        Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])->name('destroy');
    });

    // Pagos a proveedores
    Route::prefix('pagos')->name('pagos.')->group(function () {
        Route::get('/', [VendorPaymentController::class, 'index'])->name('index');
        Route::get('/create', [VendorPaymentController::class, 'create'])->name('create');
        Route::post('/', [VendorPaymentController::class, 'store'])->name('store');
        Route::delete('/{vendorPayment}', [VendorPaymentController::class, 'destroy'])->name('destroy');
    });

    // Cuentas corrientes
    Route::prefix('ctacte')->name('ctacte.')->group(function () {
        Route::get('/', [VendorAccountController::class, 'index'])->name('index');
        Route::get('/{vendor}', [VendorAccountController::class, 'show'])->name('show');
    });
});

Route::resource('taxs', TaxController::class);
Route::resource('payment-methods', PaymentMethodController::class);

Route::resource('shipping-methods', ShippingMethodController::class);
Route::resource('shipments', ShipmentController::class);

Route::resource('newsletter-subscribers', NewsletterSubscriberController::class);
Route::resource('notifications', NotificationController::class);

Route::resource('invoices', InvoiceController::class);
Route::resource('invoice-items', InvoiceItemController::class);
Route::resource('invoice-types', InvoiceTypeController::class);

// ── AFIP / ARCA ─────────────────────────────────────────────────────────────
use App\Http\Controllers\AfipController;

Route::prefix('afip')->name('afip.')->group(function () {
    // Genera comprobante de forma síncrona (respuesta inmediata)
    Route::post('sales/{sale}/generate', [AfipController::class, 'generate'])->name('sales.generate');
    // Despacha job en cola (asíncrono)
    Route::post('sales/{sale}/dispatch', [AfipController::class, 'dispatch'])->name('sales.dispatch');
    // Sube certificado o clave privada de la empresa
    Route::post('upload-cert', [AfipController::class, 'uploadCert'])->name('upload-cert');
    // Guarda configuración AFIP (entorno, auto-invoice, punto de venta)
    Route::post('settings', [AfipController::class, 'saveSettings'])->name('settings');
    // Valida archivos y consulta último comprobante autorizado
    Route::get('test-connection', [AfipController::class, 'testConnection'])->name('test-connection');
    // Genera clave privada RSA + CSR para registrar en portal ARCA
    Route::post('generate-csr', [AfipController::class, 'generateCsr'])->name('generate-csr');
});

// ── Padrón ARCA ──────────────────────────────────────────────────────────────
use App\Http\Controllers\PadronController;

Route::prefix('padron')->name('padron.')->group(function () {
    Route::get('{cuit}', [PadronController::class, 'lookup'])->name('lookup');
    Route::delete('{cuit}/cache', [PadronController::class, 'invalidate'])->name('invalidate');
});

Route::resource('variant-attribute-values', VariantAttributeValueController::class);

// Gestión de Tokens API (Sanctum) — Administración → API
use App\Http\Controllers\ApiTokenController;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    // Crear symlink storage en producción
    Route::post('storage-link', function () {
        try {
            \Artisan::call('storage:link', ['--force' => true]);
            $output = trim(\Artisan::output());

            return back()->with('success', 'Symlink creado correctamente. '.$output);
        } catch (\Throwable $e) {
            return back()->with('error', 'Error al crear symlink: '.$e->getMessage());
        }
    })->name('storage-link');
});
