<?php

use App\Http\Controllers\AttendanceKioskController;
use App\Http\Controllers\CollaboratorAttendanceController;
use App\Http\Controllers\CollaboratorController;
use App\Http\Controllers\CollaboratorDiscountController;
use App\Http\Controllers\CollaboratorExtraController;
use App\Http\Controllers\CollaboratorReceiptController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\WebAuthnKioskController;
use Illuminate\Support\Facades\Route;

Route::resource('collaborators', CollaboratorController::class);
Route::resource('collaborator-attendances', CollaboratorAttendanceController::class);
Route::resource('collaborator-discounts', CollaboratorDiscountController::class);
Route::resource('collaborator-extras', CollaboratorExtraController::class);
Route::resource('collaborator-receipts', CollaboratorReceiptController::class);

Route::resource('employees', EmployeeController::class);

// Face enrollment (requires auth)
Route::post('/collaborators/{collaborator}/enroll-face', [AttendanceKioskController::class, 'enroll'])->name('collaborators.enroll-face');

// WebAuthn registration (requires auth)
Route::get('/collaborators/{collaborator}/webauthn/registration-options', [WebAuthnKioskController::class, 'registrationOptions'])->name('collaborators.webauthn.registration-options');
Route::post('/collaborators/{collaborator}/webauthn/register', [WebAuthnKioskController::class, 'register'])->name('collaborators.webauthn.register');
