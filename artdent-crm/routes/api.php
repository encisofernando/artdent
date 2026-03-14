<?php

/**
 * routes/api.php
 * Rutas API puras (sin middleware web/session).
 * Usan Sanctum Bearer token para autenticación.
 */

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\CollaboratorAssignController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| E-commerce: Auth pública
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->name('api.auth.')->group(function (): void {
    Route::post('login', [AuthApiController::class, 'login'])->name('login');
    Route::post('register', [AuthApiController::class, 'register'])->name('register');

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
    Route::post('checkout', [CatalogController::class, 'checkout'])->name('checkout');
    Route::get('orders/{code}', [CatalogController::class, 'order'])->name('orders.show');
});

/*
|--------------------------------------------------------------------------
| Stock por producto
|--------------------------------------------------------------------------
*/
Route::get('products/{id}/stock', [CatalogController::class, 'productStock'])->name('api.products.stock');

/*
|--------------------------------------------------------------------------
| Panel de Asignación de Órdenes
|--------------------------------------------------------------------------
| Endpoints consumidos por artdent-panel/index.html
| Autenticados con: Authorization: Bearer <token>
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
