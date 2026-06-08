<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductAttributeController;
use App\Http\Controllers\ProductAttributeValueController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProductVariantController;
use Illuminate\Support\Facades\Route;

// Etiquetas de código de barras
Route::get('barcode-labels', [ProductController::class, 'barcodeLabels'])->name('products.barcode-labels')->middleware('permission:products.view');

// Productos y Catálogo
Route::get('products', [ProductController::class, 'index'])->name('products.index')->middleware('permission:products.view');
Route::get('products/create', [ProductController::class, 'create'])->name('products.create')->middleware('permission:products.create');
Route::post('products', [ProductController::class, 'store'])->name('products.store')->middleware('permission:products.create');
Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('permission:products.edit');
Route::match(['post', 'put'], 'products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware('permission:products.edit');
Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('permission:products.delete');

// Importaciones
Route::post('products/import-csv', [ProductController::class, 'importCsv'])->name('products.import-csv')->middleware('permission:products.create');
Route::post('products/import-sql', [ProductController::class, 'importSql'])->name('products.import-sql')->middleware('permission:products.create');

// Categorías
Route::get('categorys', [CategoryController::class, 'index'])->name('categorys.index')->middleware('permission:products.view');
Route::get('categorys/create', [CategoryController::class, 'create'])->name('categorys.create')->middleware('permission:products.create');
Route::post('categorys', [CategoryController::class, 'store'])->name('categorys.store')->middleware('permission:products.create');
Route::get('categorys/{category}/edit', [CategoryController::class, 'edit'])->name('categorys.edit')->middleware('permission:products.edit');
Route::put('categorys/{category}', [CategoryController::class, 'update'])->name('categorys.update')->middleware('permission:products.edit');
Route::delete('categorys/{category}', [CategoryController::class, 'destroy'])->name('categorys.destroy')->middleware('permission:products.delete');

// Sub-recursos (simplificados con el mismo permiso de productos por ahora)
Route::resource('product-attributes', ProductAttributeController::class)->middleware('permission:products.edit');
Route::resource('product-attribute-values', ProductAttributeValueController::class)->middleware('permission:products.edit');
Route::resource('product-images', ProductImageController::class)->middleware('permission:products.edit');
Route::resource('product-variants', ProductVariantController::class)->middleware('permission:products.edit');
