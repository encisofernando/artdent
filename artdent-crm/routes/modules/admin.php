<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ShippingMethodController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\NewsletterSubscriberController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceItemController;
use App\Http\Controllers\InvoiceTypeController;
use App\Http\Controllers\VariantAttributeValueController;

Route::resource('users', UserController::class);
Route::resource('roles', RoleController::class);

Route::resource('companys', CompanyController::class);
Route::resource('branchs', BranchController::class);

Route::resource('vendors', VendorController::class);

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
