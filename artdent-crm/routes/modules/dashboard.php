<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReportExportController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('dashboards', DashboardController::class);
Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index');
Route::get('/reportes/export-pdf', [ReportesController::class, 'exportPdf'])->name('reportes.export-pdf');

// CSV / Excel exports
Route::prefix('export')->name('export.')->group(function () {
    Route::get('sales', [ReportExportController::class, 'sales'])->name('sales');
    Route::get('customers', [ReportExportController::class, 'customers'])->name('customers');
    Route::get('quotes', [ReportExportController::class, 'quotes'])->name('quotes');
    Route::get('expenses', [ReportExportController::class, 'expenses'])->name('expenses');
    Route::get('iva-ventas', [ReportExportController::class, 'ivaVentas'])->name('iva-ventas');
    Route::get('income-statement', [ReportExportController::class, 'incomeStatement'])->name('income-statement');
    // Lab exports
    Route::get('jobs', [ReportExportController::class, 'exportJobs'])->name('jobs');
    Route::get('dentists', [ReportExportController::class, 'exportDentists'])->name('dentists');
    Route::get('tariffs', [ReportExportController::class, 'exportTariffs'])->name('tariffs');
});
