<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CashRegisterSettingsController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceTypeController;
use App\Http\Controllers\LoyaltyRewardController;
use App\Http\Controllers\LoyaltySettingsController;
use App\Http\Controllers\NaveInstallmentRateSettingsController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShippingSettingsController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UserController;
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

// Auditoría (registro de acciones sensibles: ventas canceladas, cambios de
// precio masivos, altas/bajas de usuarios y roles)
Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index')->middleware('permission:settings.edit');

// Suscripción SaaS
Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
Route::post('subscription/checkout', [SubscriptionController::class, 'checkout'])->name('subscription.checkout')->middleware('permission:settings.edit');
Route::post('subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel')->middleware('permission:settings.edit');

Route::get('settings', [CompanyController::class, 'edit'])->name('settings.edit');
Route::put('settings', [CompanyController::class, 'update'])->name('settings.update')->middleware('permission:settings.edit');

// Tasas de cuotas Nave (usadas por el simulador de Ventas, ver routes/modules/sales.php)
Route::get('nave-installment-rates', [NaveInstallmentRateSettingsController::class, 'index'])->name('nave-installment-rates.index')->middleware('permission:settings.edit');
Route::post('nave-installment-rates', [NaveInstallmentRateSettingsController::class, 'store'])->name('nave-installment-rates.store')->middleware('permission:settings.edit');

// Puntos de fidelización (POS + e-commerce, ver app/Services/LoyaltyService.php)
Route::get('loyalty-settings', [LoyaltySettingsController::class, 'index'])->name('loyalty-settings.index')->middleware('permission:settings.edit');
Route::put('loyalty-settings', [LoyaltySettingsController::class, 'update'])->name('loyalty-settings.update')->middleware('permission:settings.edit');
Route::resource('loyalty-rewards', LoyaltyRewardController::class)->except(['show'])->middleware('permission:settings.edit');
Route::get('shipping-settings', [ShippingSettingsController::class, 'index'])->name('shipping-settings.index')->middleware('permission:settings.edit');
Route::put('shipping-settings', [ShippingSettingsController::class, 'update'])->name('shipping-settings.update')->middleware('permission:settings.edit');
Route::get('cash-register-settings', [CashRegisterSettingsController::class, 'index'])->name('cash-register-settings.index')->middleware('permission:settings.edit');
Route::put('cash-register-settings', [CashRegisterSettingsController::class, 'update'])->name('cash-register-settings.update')->middleware('permission:settings.edit');

// Multi-empresa: listado/alta + selector de compañía activa (companies.switch)
Route::get('companies', [CompanyController::class, 'index'])->name('companies.index')->middleware('permission:companies.switch');
Route::post('companies', [CompanyController::class, 'store'])->name('companies.store')->middleware('permission:companies.switch');
Route::post('companies/active', [CompanyController::class, 'setActive'])->name('companies.set-active');

Route::post('branchs/active', [BranchController::class, 'setActive'])->name('branchs.set-active');
Route::resource('branchs', BranchController::class)->except(['create', 'show', 'edit'])->middleware('permission:settings.edit');

// vendors/proveedores/* reusan permission:purchases.* — el mismo permiso
// que ya gatea la sección "Proveedores" del sidebar (Sidebar.jsx:90-92).
Route::resource('vendors', VendorController::class)->middleware('permission:purchases.view');

// Gestión de Proveedores
Route::prefix('proveedores')->name('proveedores.')->middleware('permission:purchases.view')->group(function () {
    // Comprobantes (Facturas / Remitos de compra)
    Route::prefix('comprobantes')->name('comprobantes.')->group(function () {
        Route::get('/', [PurchaseController::class, 'index'])->name('index');
        Route::get('/create', [PurchaseController::class, 'create'])->name('create')->middleware('permission:purchases.create');
        Route::post('/', [PurchaseController::class, 'store'])->name('store')->middleware('permission:purchases.create');
        Route::get('/{purchase}', [PurchaseController::class, 'show'])->name('show');
        Route::get('/{purchase}/edit', [PurchaseController::class, 'edit'])->name('edit')->middleware('permission:purchases.edit');
        Route::put('/{purchase}', [PurchaseController::class, 'update'])->name('update')->middleware('permission:purchases.edit');
        Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])->name('destroy')->middleware('permission:purchases.delete');
    });

    // Pagos a proveedores
    Route::prefix('pagos')->name('pagos.')->group(function () {
        Route::get('/', [VendorPaymentController::class, 'index'])->name('index');
        Route::get('/create', [VendorPaymentController::class, 'create'])->name('create')->middleware('permission:purchases.create');
        Route::post('/', [VendorPaymentController::class, 'store'])->name('store')->middleware('permission:purchases.create');
        Route::delete('/{vendorPayment}', [VendorPaymentController::class, 'destroy'])->name('destroy')->middleware('permission:purchases.delete');
    });

    // Cuentas corrientes
    Route::prefix('ctacte')->name('ctacte.')->group(function () {
        Route::get('/', [VendorAccountController::class, 'index'])->name('index');
        Route::get('/{vendor}', [VendorAccountController::class, 'show'])->name('show');
    });
});

// taxs/invoice-types: catálogos de configuración, mismo criterio que
// payment-methods (línea de abajo). invoices: documentos financieros
// reales, mismo permiso que ya gatea la sección "Contable" del sidebar.
Route::resource('taxs', TaxController::class)->middleware('permission:settings.edit');
Route::resource('payment-methods', PaymentMethodController::class)->except(['create', 'show', 'edit'])->middleware('permission:settings.edit');

Route::resource('invoices', InvoiceController::class)->middleware('permission:accounting.view');
Route::resource('invoice-types', InvoiceTypeController::class)->middleware('permission:settings.edit');

// ── AFIP / ARCA ─────────────────────────────────────────────────────────────
use App\Http\Controllers\AfipController;

Route::prefix('afip')->name('afip.')->group(function () {
    // Genera comprobante de forma síncrona (respuesta inmediata)
    Route::post('sales/{sale}/generate', [AfipController::class, 'generate'])->name('sales.generate')->middleware('permission:accounting.create');
    // Despacha job en cola (asíncrono)
    Route::post('sales/{sale}/dispatch', [AfipController::class, 'dispatch'])->name('sales.dispatch')->middleware('permission:accounting.create');
    // Sube certificado o clave privada de la empresa
    Route::post('upload-cert', [AfipController::class, 'uploadCert'])->name('upload-cert')->middleware('permission:settings.edit');
    // Guarda configuración AFIP (entorno, auto-invoice, punto de venta)
    Route::post('settings', [AfipController::class, 'saveSettings'])->name('settings')->middleware('permission:settings.edit');
    // Valida archivos y consulta último comprobante autorizado
    Route::get('test-connection', [AfipController::class, 'testConnection'])->name('test-connection')->middleware('permission:settings.edit');
    // Genera clave privada RSA + CSR para registrar en portal ARCA
    Route::post('generate-csr', [AfipController::class, 'generateCsr'])->name('generate-csr')->middleware('permission:settings.edit');
    // Puntos de venta (multi-PV por empresa)
    Route::get('points-of-sale', [AfipController::class, 'pointsOfSale'])->name('points-of-sale.index')->middleware('permission:settings.edit');
    Route::post('points-of-sale', [AfipController::class, 'storePointOfSale'])->name('points-of-sale.store')->middleware('permission:settings.edit');
    Route::put('points-of-sale/{pointOfSale}', [AfipController::class, 'updatePointOfSale'])->name('points-of-sale.update')->middleware('permission:settings.edit');
    Route::delete('points-of-sale/{pointOfSale}', [AfipController::class, 'destroyPointOfSale'])->name('points-of-sale.destroy')->middleware('permission:settings.edit');
});

// ── Padrón ARCA ──────────────────────────────────────────────────────────────
use App\Http\Controllers\PadronController;

Route::prefix('padron')->name('padron.')->group(function () {
    Route::get('{cuit}', [PadronController::class, 'lookup'])->name('lookup');
    Route::delete('{cuit}/cache', [PadronController::class, 'invalidate'])->name('invalidate')->middleware('permission:settings.edit');
});

// Acceso Kiosk — IPs permitidas + Tokens API
use App\Http\Controllers\KioskAccessController;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware(['module:laboratorio|rrhh', 'permission:settings.edit'])->group(function () {
        Route::get('kiosk-access', [KioskAccessController::class, 'index'])->name('kiosk-access.index');
        Route::post('kiosk-access/ips', [KioskAccessController::class, 'storeIp'])->name('kiosk-access.ips.store');
        Route::patch('kiosk-access/ips/{ip}/toggle', [KioskAccessController::class, 'toggleIp'])->name('kiosk-access.ips.toggle');
        Route::delete('kiosk-access/ips/{ip}', [KioskAccessController::class, 'destroyIp'])->name('kiosk-access.ips.destroy');
        Route::post('kiosk-access/tokens', [KioskAccessController::class, 'storeToken'])->name('kiosk-access.tokens.store');
        Route::delete('kiosk-access/tokens/{token}', [KioskAccessController::class, 'destroyToken'])->name('kiosk-access.tokens.destroy');
        Route::post('kiosk-access/device-tokens', [KioskAccessController::class, 'storeDeviceToken'])->name('kiosk-access.device-tokens.store');
        Route::patch('kiosk-access/device-tokens/{network}/toggle', [KioskAccessController::class, 'toggleDeviceToken'])->name('kiosk-access.device-tokens.toggle');
        Route::delete('kiosk-access/device-tokens/{network}', [KioskAccessController::class, 'destroyDeviceToken'])->name('kiosk-access.device-tokens.destroy');
    });

    // Crear symlink storage en producción — antes cualquier usuario
    // autenticado del tenant podía ejecutar un comando Artisan del
    // servidor sin ningún permiso.
    Route::post('storage-link', function () {
        try {
            \Artisan::call('storage:link', ['--force' => true]);
            $output = trim(\Artisan::output());

            return back()->with('success', 'Symlink creado correctamente. '.$output);
        } catch (\Throwable $e) {
            return back()->with('error', 'Error al crear symlink: '.$e->getMessage());
        }
    })->name('storage-link')->middleware('permission:settings.edit');
});
