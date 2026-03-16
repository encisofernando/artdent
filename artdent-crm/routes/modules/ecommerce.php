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
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShippingMotoCompanyController;
use App\Http\Controllers\ShippingPickupPointController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::resource('customers', CustomerController::class);
Route::get('customers/{customer}/account', [CustomerAccountController::class, 'show'])->name('customers.account');
Route::post('customers/{customer}/account/payments', [CustomerAccountController::class, 'storePayment'])->name('customers.account.payments');
Route::resource('customer-address', CustomerAddressController::class);
Route::resource('clientes', ClientesController::class);
Route::resource('crm-clients', CrmClientController::class);

Route::resource('ecommerce-orders', EcommerceOrderController::class);
Route::resource('ecommerce-order-items', EcommerceOrderItemController::class);

Route::resource('coupons', CouponController::class);
Route::resource('coupon-usages', CouponUsageController::class);

Route::resource('wishlists', WishlistController::class);
Route::resource('reviews', ReviewController::class);

Route::resource('shipping-pickup-points', ShippingPickupPointController::class)->except(['show']);
Route::resource('shipping-moto-companies', ShippingMotoCompanyController::class)->except(['show']);
