<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\ClientesController;
use App\Http\Controllers\CrmClientController;
use App\Http\Controllers\EcommerceOrderController;
use App\Http\Controllers\EcommerceOrderItemController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponUsageController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;

Route::resource('customers', CustomerController::class);
Route::resource('customer-address', CustomerAddressController::class);
Route::resource('clientes', ClientesController::class);
Route::resource('crm-clients', CrmClientController::class);

Route::resource('ecommerce-orders', EcommerceOrderController::class);
Route::resource('ecommerce-order-items', EcommerceOrderItemController::class);

Route::resource('coupons', CouponController::class);
Route::resource('coupon-usages', CouponUsageController::class);

Route::resource('wishlists', WishlistController::class);
Route::resource('reviews', ReviewController::class);
