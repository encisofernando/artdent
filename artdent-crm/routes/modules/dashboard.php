<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReportExportController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard')
    ->middleware('permission:products.view|customers.view|orders.view|ecommerce.view|reports.view|settings.edit|staff.view');

Route::resource('dashboards', DashboardController::class)->middleware('permission:reports.view');
Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index')->middleware('permission:reports.view');
Route::get('/reportes/export-pdf', [ReportesController::class, 'exportPdf'])->name('reportes.export-pdf')->middleware('permission:reports.view');

// CSV / Excel exports
Route::prefix('export')->name('export.')->middleware('permission:reports.view|accounting.view')->group(function () {
    Route::get('sales', [ReportExportController::class, 'sales'])->name('sales');
    Route::get('customers', [ReportExportController::class, 'customers'])->name('customers');
    Route::get('quotes', [ReportExportController::class, 'quotes'])->name('quotes');
    Route::get('expenses', [ReportExportController::class, 'expenses'])->name('expenses');
    Route::get('iva-ventas', [ReportExportController::class, 'ivaVentas'])->name('iva-ventas');
    Route::get('iva-compras', [ReportExportController::class, 'ivaCompras'])->name('iva-compras');
    Route::get('income-statement', [ReportExportController::class, 'incomeStatement'])->name('income-statement');
    // Lab exports
    Route::get('jobs', [ReportExportController::class, 'exportJobs'])->name('jobs');
    Route::get('dentists', [ReportExportController::class, 'exportDentists'])->name('dentists');
    Route::get('tariffs', [ReportExportController::class, 'exportTariffs'])->name('tariffs');
});
