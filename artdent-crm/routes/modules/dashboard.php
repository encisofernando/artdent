<?php

use App\Http\Controllers\CostProfitReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReportExportController;
use App\Http\Controllers\SalesReportController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard')
    ->middleware('permission:products.view|customers.view|orders.view|ecommerce.view|reports.view|settings.edit|staff.view');

Route::middleware('module:reportes')->group(function () {
    Route::resource('dashboards', DashboardController::class)->only(['index'])->middleware('permission:reports.view');
    Route::redirect('/estadisticas', '/reportes/ventas-por-periodo');
    Route::redirect('/operaciones', '/audit-logs');
    Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index')->middleware('permission:reports.view');
    Route::get('/reportes/export-pdf', [ReportesController::class, 'exportPdf'])->name('reportes.export-pdf')->middleware('permission:reports.view');
    Route::get('/reportes/costos-ganancias', [CostProfitReportController::class, 'index'])->name('reportes.costos-ganancias')->middleware('permission:reports.view');
    Route::get('/reportes/costos-ganancias/export', [CostProfitReportController::class, 'exportCsv'])->name('reportes.costos-ganancias.export')->middleware('permission:reports.view');
    Route::get('/reportes/ventas-por-periodo', [SalesReportController::class, 'index'])->name('reportes.ventas-por-periodo')->middleware('permission:reports.view');
    Route::get('/reportes/ventas-por-periodo/export', [SalesReportController::class, 'exportCsv'])->name('reportes.ventas-por-periodo.export')->middleware('permission:reports.view');
    // CSV / Excel exports — reportes de negocio en general
    Route::prefix('export')->name('export.')->middleware('permission:reports.view|accounting.view')->group(function () {
        Route::get('sales', [ReportExportController::class, 'sales'])->name('sales');
        Route::get('customers', [ReportExportController::class, 'customers'])->name('customers');
        Route::get('quotes', [ReportExportController::class, 'quotes'])->name('quotes');
        Route::get('expenses', [ReportExportController::class, 'expenses'])->name('expenses');
    });

    // Lab exports — restringidos al módulo de laboratorio
    Route::prefix('export')->name('export.')->middleware(['module:laboratorio', 'permission:reports.view|accounting.view'])->group(function () {
        Route::get('jobs', [ReportExportController::class, 'exportJobs'])->name('jobs');
        Route::get('dentists', [ReportExportController::class, 'exportDentists'])->name('dentists');
        Route::get('tariffs', [ReportExportController::class, 'exportTariffs'])->name('tariffs');
    });
});

// Libros fiscales / contables — van con módulo:contabilidad, no reportes,
// porque son salidas contables (IVA, resultados), no reportes de negocio genéricos.
Route::prefix('export')->name('export.')->middleware(['module:contabilidad', 'permission:reports.view|accounting.view'])->group(function () {
    Route::get('iva-ventas', [ReportExportController::class, 'ivaVentas'])->name('iva-ventas');
    Route::get('iva-digital', [ReportExportController::class, 'ivaDigitalTxt'])->name('iva-digital');
    Route::get('iva-compras', [ReportExportController::class, 'ivaCompras'])->name('iva-compras');
    Route::get('income-statement', [ReportExportController::class, 'incomeStatement'])->name('income-statement');
});
