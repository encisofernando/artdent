<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LaboratorioController;
use App\Http\Controllers\LabAccountController;
use App\Http\Controllers\LabAccountMoveController;

Route::resource('laboratorios', LaboratorioController::class);
Route::resource('lab-accounts', LabAccountController::class);
Route::resource('lab-account-moves', LabAccountMoveController::class);
