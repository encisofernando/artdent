<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportesController;

Route::get('/dashboard', [HomeController::class,'index'])->name('dashboard');

Route::resource('dashboards', DashboardController::class);
Route::resource('reportes', ReportesController::class);
