<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductAttributeController;
use App\Http\Controllers\ProductAttributeValueController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductosController;
use App\Http\Controllers\CategoryController;

// Rutas especiales ANTES del resource (evita que {product} capture estos segmentos)
Route::post('products/import-csv', [ProductController::class, 'importCsv'])->name('products.import-csv');
Route::post('products/import-sql', [ProductController::class, 'importSql'])->name('products.import-sql');

// Update vía multipart/form-data (imágenes) — también antes del resource
Route::post('products/{product}', [ProductController::class, 'update'])->name('products.update.multipart');

Route::resource('products', ProductController::class)->except(['update']);

Route::resource('product-attributes', ProductAttributeController::class);
Route::resource('product-attribute-values', ProductAttributeValueController::class);
Route::resource('product-images', ProductImageController::class);
Route::resource('product-variants', ProductVariantController::class);
Route::resource('productos', ProductosController::class);
Route::resource('categorys', CategoryController::class);
