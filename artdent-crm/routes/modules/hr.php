<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CollaboratorController;
use App\Http\Controllers\CollaboratorAttendanceController;
use App\Http\Controllers\CollaboratorDiscountController;
use App\Http\Controllers\CollaboratorExtraController;
use App\Http\Controllers\CollaboratorReceiptController;
use App\Http\Controllers\EmployeeController;

Route::resource('collaborators', CollaboratorController::class);
Route::resource('collaborator-attendances', CollaboratorAttendanceController::class);
Route::resource('collaborator-discounts', CollaboratorDiscountController::class);
Route::resource('collaborator-extras', CollaboratorExtraController::class);
Route::resource('collaborator-receipts', CollaboratorReceiptController::class);

Route::resource('employees', EmployeeController::class);
