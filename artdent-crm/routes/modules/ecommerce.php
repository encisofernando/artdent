<?php

use App\Http\Controllers\ClientesController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponUsageController;
use App\Http\Controllers\CrmClientController;
use App\Http\Controllers\CustomerAccountController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EcommerceOrderController;
use App\Http\Controllers\EcommerceOrderItemController;
use App\Http\Controllers\EcommercePaymentConfigController;
use App\Http\Controllers\HeroSlideController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShippingMotoCompanyController;
use App\Http\Controllers\ShippingPickupPointController;
use App\Http\Controllers\SidebarBannerController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

// Clientes
Route::get('customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('permission:customers.view');
Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create')->middleware('permission:customers.create');
Route::post('customers', [CustomerController::class, 'store'])->name('customers.store')->middleware('permission:customers.create');
Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit')->middleware('permission:customers.edit');
Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update')->middleware('permission:customers.edit');
Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy')->middleware('permission:customers.delete');

Route::get('customers-accounts', [CustomerAccountController::class, 'index'])->name('customers.accounts')->middleware('permission:customers.view');
Route::get('customers/{customer}/account', [CustomerAccountController::class, 'show'])->name('customers.account')->middleware('permission:customers.view');
Route::post('customers/{customer}/account/payments', [CustomerAccountController::class, 'storePayment'])->name('customers.account.payments')->middleware('permission:customers.view');
Route::post('customers/{customer}/account/adjustments', [CustomerAccountController::class, 'storeAdjustment'])->name('customers.account.adjustments')->middleware('permission:customers.edit');
Route::post('customers/{customer}/account/send-statement', [CustomerAccountController::class, 'sendStatement'])->name('customers.account.send-statement')->middleware('permission:customers.view');
Route::resource('customer-address', CustomerAddressController::class)->middleware('permission:customers.edit');
Route::resource('clientes', ClientesController::class)->middleware('permission:customers.view');
Route::resource('crm-clients', CrmClientController::class)->middleware('permission:customers.view');

// Órdenes E-commerce
Route::get('ecommerce-orders', [EcommerceOrderController::class, 'index'])->name('ecommerce-orders.index')->middleware('permission:ecommerce.view');
Route::get('ecommerce-orders/{ecommerce_order}', [EcommerceOrderController::class, 'show'])->name('ecommerce-orders.show')->middleware('permission:ecommerce.view');
Route::delete('ecommerce-orders/{ecommerce_order}', [EcommerceOrderController::class, 'destroy'])->name('ecommerce-orders.destroy')->middleware('permission:ecommerce.delete');
Route::resource('ecommerce-order-items', EcommerceOrderItemController::class)->middleware('permission:ecommerce.view');

// Cupones y Ofertas
Route::resource('coupons', CouponController::class)->middleware('permission:ecommerce.edit');
Route::resource('coupon-usages', CouponUsageController::class)->middleware('permission:ecommerce.view');
Route::resource('offers', OfferController::class)->except(['show'])->middleware('permission:ecommerce.edit');

// Marketing y Social
Route::resource('wishlists', WishlistController::class)->middleware('permission:ecommerce.view');
Route::resource('reviews', ReviewController::class)->middleware('permission:ecommerce.view');
Route::resource('sidebar-banners', SidebarBannerController::class)->only(['index', 'store', 'update', 'destroy'])->middleware('permission:ecommerce.edit');
Route::resource('hero-slides', HeroSlideController::class)->only(['index', 'store', 'update', 'destroy'])->middleware('permission:ecommerce.edit');

// Configuraciones y Logística E-commerce
Route::resource('shipping-pickup-points', ShippingPickupPointController::class)->except(['show'])->middleware('permission:ecommerce.edit');
Route::resource('shipping-moto-companies', ShippingMotoCompanyController::class)->except(['show'])->middleware('permission:ecommerce.edit');
Route::get('ecommerce-payment-configs', [EcommercePaymentConfigController::class, 'index'])->name('ecommerce-payment-configs.index')->middleware('permission:settings.edit');
Route::put('ecommerce-payment-configs/{type}', [EcommercePaymentConfigController::class, 'update'])->name('ecommerce-payment-configs.update')->middleware('permission:settings.edit');

// Reportes Financieros / Mercado Pago
Route::prefix('ecommerce-reports')->name('ecommerce-reports.')->group(function () {
    Route::get('/', [\App\Http\Controllers\MercadoPagoReportController::class, 'index'])->name('index');
    Route::post('generate', [\App\Http\Controllers\MercadoPagoReportController::class, 'generate'])->name('generate');
    Route::get('{fileName}/download', [\App\Http\Controllers\MercadoPagoReportController::class, 'download'])
        ->name('download')
        ->where('fileName', '.*');
})->middleware('permission:reports.view');
