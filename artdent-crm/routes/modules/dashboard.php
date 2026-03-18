<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportesController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('dashboards', DashboardController::class);
Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index');
Route::get('/reportes/export-pdf', [ReportesController::class, 'exportPdf'])->name('reportes.export-pdf');
