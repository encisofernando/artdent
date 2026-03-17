<?php

/**
 * routes/api.php
 * Rutas API puras (sin middleware web/session).
 * Usan Sanctum Bearer token para autenticación.
 */

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\NewsletterApiController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\CollaboratorAssignController;
use App\Http\Controllers\HeroSlideController;
use App\Http\Controllers\SidebarBannerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| E-commerce: Auth pública
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->name('api.auth.')->group(function (): void {
    Route::post('login', [AuthApiController::class, 'login'])->name('login');
    Route::post('register', [AuthApiController::class, 'register'])->name('register');
    Route::post('password/forgot', [AuthApiController::class, 'forgotPassword'])->name('password.forgot');
    Route::post('password/reset', [AuthApiController::class, 'resetPassword'])->name('password.reset');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthApiController::class, 'me'])->name('me');
        Route::post('logout', [AuthApiController::class, 'logout'])->name('logout');
    });
});

/*
|--------------------------------------------------------------------------
| E-commerce: Catálogo público
|--------------------------------------------------------------------------
*/
Route::prefix('catalog')->name('api.catalog.')->group(function (): void {
    Route::get('products', [CatalogController::class, 'products'])->name('products');
    Route::get('products/{id}', [CatalogController::class, 'product'])->name('products.show');
    Route::get('categories', [CatalogController::class, 'categories'])->name('categories');
    Route::get('brands', [CatalogController::class, 'brands'])->name('brands');
    Route::get('offers', [CatalogController::class, 'offers'])->name('offers');
    Route::post('checkout', [CatalogController::class, 'checkout'])->name('checkout');
    Route::get('orders/{code}', [CatalogController::class, 'order'])->name('orders.show');
});

/*
|--------------------------------------------------------------------------
| E-commerce: Panel del cliente (requiere auth)
|--------------------------------------------------------------------------
*/
Route::prefix('customer')->name('api.customer.')->middleware('auth:sanctum')->group(function (): void {
    Route::get('profile', [CustomerController::class, 'profile'])->name('profile');
    Route::put('profile', [CustomerController::class, 'updateProfile'])->name('profile.update');
    Route::post('password', [CustomerController::class, 'changePassword'])->name('password');

    Route::get('orders', [CustomerController::class, 'orders'])->name('orders');
    Route::get('orders/{code}', [CustomerController::class, 'orderDetail'])->name('orders.show');

    Route::get('addresses', [CustomerController::class, 'addresses'])->name('addresses');
    Route::post('addresses', [CustomerController::class, 'storeAddress'])->name('addresses.store');
    Route::put('addresses/{id}', [CustomerController::class, 'updateAddress'])->name('addresses.update');
    Route::delete('addresses/{id}', [CustomerController::class, 'destroyAddress'])->name('addresses.destroy');
});

/*
|--------------------------------------------------------------------------
| Pagos: MercadoPago
|--------------------------------------------------------------------------
*/
Route::prefix('payment')->name('api.payment.')->group(function (): void {
    Route::post('mp/create', [PaymentController::class, 'createPreference'])->name('mp.create');
    Route::post('mp/webhook', [PaymentController::class, 'webhook'])->name('mp.webhook');
});

/*
|--------------------------------------------------------------------------
| Newsletter
|--------------------------------------------------------------------------
*/
Route::post('newsletter/subscribe', [NewsletterApiController::class, 'subscribe'])->name('api.newsletter.subscribe');

/*
|--------------------------------------------------------------------------
| Sidebar banners del e-commerce (público)
|--------------------------------------------------------------------------
*/
Route::get('sidebar-banners', [SidebarBannerController::class, 'apiIndex'])->name('api.sidebar-banners.index');
Route::get('hero-slides', [HeroSlideController::class, 'apiIndex'])->name('api.hero-slides.index');

/*
|--------------------------------------------------------------------------
| Reviews de productos
|--------------------------------------------------------------------------
*/
Route::get('products/{productId}/reviews', [ReviewController::class, 'index'])->name('api.reviews.index');
Route::post('products/{productId}/reviews', [ReviewController::class, 'store'])->name('api.reviews.store')->middleware('auth:sanctum');
Route::post('reviews/{reviewId}/helpful', [ReviewController::class, 'markHelpful'])->name('api.reviews.helpful');
Route::post('reviews/{reviewId}/not-helpful', [ReviewController::class, 'markNotHelpful'])->name('api.reviews.not-helpful');

/*
|--------------------------------------------------------------------------
| Wishlist (requiere auth)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('wishlist')->name('api.wishlist.')->group(function (): void {
    Route::get('/', [WishlistController::class, 'index'])->name('index');
    Route::post('/', [WishlistController::class, 'store'])->name('store');
    Route::delete('/{id}', [WishlistController::class, 'destroy'])->name('destroy');
    Route::get('/check/{productId}', [WishlistController::class, 'check'])->name('check');
});

/*
|--------------------------------------------------------------------------
| Cupones: validación pública
|--------------------------------------------------------------------------
*/
Route::post('coupons/validate', [CatalogController::class, 'validateCoupon'])->name('api.coupons.validate');

/*
|--------------------------------------------------------------------------
| Envíos
|--------------------------------------------------------------------------
*/
Route::get('shipping/options', [ShippingController::class, 'options'])->name('api.shipping.options');

/*
|--------------------------------------------------------------------------
| Stock por producto
|--------------------------------------------------------------------------
*/
Route::get('products/{id}/stock', [CatalogController::class, 'productStock'])->name('api.products.stock');

/*
|--------------------------------------------------------------------------
| Search (búsquedas populares / sugerencias / tracking)
|--------------------------------------------------------------------------
*/
Route::prefix('search')->name('api.search.')->group(function (): void {
    Route::get('popular', fn () => response()->json([]))->name('popular');
    Route::get('suggestions', function (\Illuminate\Http\Request $request) {
        $q = $request->string('q')->toString();
        if (strlen($q) < 2) {
            return response()->json([]);
        }
        $results = \App\Models\Product::query()
            ->where('is_active', true)
            ->where('name', 'like', "%{$q}%")
            ->limit(8)
            ->pluck('name')
            ->map(fn ($name) => ['suggestion' => $name]);

        return response()->json($results);
    })->name('suggestions');
    Route::post('track', fn () => response()->json(['ok' => true]))->name('track');
});

/*
|--------------------------------------------------------------------------
| Panel de Asignación de Órdenes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('assign')->name('assign.')->group(function (): void {

    Route::get('jobs/unassigned', [CollaboratorAssignController::class, 'unassignedJobs'])
        ->name('jobs.unassigned');

    Route::get('jobs/assigned', [CollaboratorAssignController::class, 'assignedJobs'])
        ->name('jobs.assigned');

    Route::get('collaborators/present', [CollaboratorAssignController::class, 'presentCollaborators'])
        ->name('collaborators.present');

    Route::post('jobs/{job}/assign', [CollaboratorAssignController::class, 'assign'])
        ->name('jobs.assign');

    Route::post('jobs/{job}/unassign', [CollaboratorAssignController::class, 'unassign'])
        ->name('jobs.unassign');
});
