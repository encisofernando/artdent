<?php

use App\Http\Controllers\AccountingController;
use Illuminate\Support\Facades\Route;

Route::get('contable', [AccountingController::class, 'index'])
    ->name('accounting.index')
    ->middleware('permission:accounting.view');
