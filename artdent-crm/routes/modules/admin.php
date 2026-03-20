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
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VariantAttributeValueController;
use App\Http\Controllers\VendorAccountController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorPaymentController;
use Illuminate\Support\Facades\Route;

Route::resource('users', UserController::class);
Route::resource('roles', RoleController::class);

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
