<?php

use App\Http\Controllers\AccountingController;
use Illuminate\Support\Facades\Route;

Route::get('contable', [AccountingController::class, 'index'])
    ->name('accounting.index')
    ->middleware(['module:contabilidad', 'permission:accounting.view']);
