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

// Colaboradores y Personal
Route::get('collaborators', [CollaboratorController::class, 'index'])->name('collaborators.index')->middleware('permission:staff.view');
Route::get('collaborators/create', [CollaboratorController::class, 'create'])->name('collaborators.create')->middleware('permission:staff.create');
Route::post('collaborators', [CollaboratorController::class, 'store'])->name('collaborators.store')->middleware('permission:staff.create');
Route::get('collaborators/{collaborator}/edit', [CollaboratorController::class, 'edit'])->name('collaborators.edit')->middleware('permission:staff.edit');
Route::put('collaborators/{collaborator}', [CollaboratorController::class, 'update'])->name('collaborators.update')->middleware('permission:staff.edit');
Route::delete('collaborators/{collaborator}', [CollaboratorController::class, 'destroy'])->name('collaborators.destroy')->middleware('permission:staff.delete');

// Asistencia y Recibos
Route::get('collaborator-attendances', [CollaboratorAttendanceController::class, 'index'])->name('collaborator-attendances.index')->middleware('permission:staff.view');
Route::post('collaborator-attendances', [CollaboratorAttendanceController::class, 'store'])->name('collaborator-attendances.store')->middleware('permission:staff.edit');
Route::put('collaborator-attendances/{collaboratorAttendance}', [CollaboratorAttendanceController::class, 'update'])->name('collaborator-attendances.update')->middleware('permission:staff.edit');
Route::delete('collaborator-attendances/{collaboratorAttendance}', [CollaboratorAttendanceController::class, 'destroy'])->name('collaborator-attendances.destroy')->middleware('permission:staff.delete');
Route::get('collaborator-discounts', [CollaboratorDiscountController::class, 'index'])->name('collaborator-discounts.index')->middleware('permission:staff.view');
Route::post('collaborator-discounts', [CollaboratorDiscountController::class, 'store'])->name('collaborator-discounts.store')->middleware('permission:staff.edit');
Route::put('collaborator-discounts/{collaboratorDiscount}', [CollaboratorDiscountController::class, 'update'])->name('collaborator-discounts.update')->middleware('permission:staff.edit');
Route::delete('collaborator-discounts/{collaboratorDiscount}', [CollaboratorDiscountController::class, 'destroy'])->name('collaborator-discounts.destroy')->middleware('permission:staff.delete');
Route::get('collaborator-extras', [CollaboratorExtraController::class, 'index'])->name('collaborator-extras.index')->middleware('permission:staff.view');
Route::post('collaborator-extras', [CollaboratorExtraController::class, 'store'])->name('collaborator-extras.store')->middleware('permission:staff.edit');
Route::put('collaborator-extras/{collaboratorExtra}', [CollaboratorExtraController::class, 'update'])->name('collaborator-extras.update')->middleware('permission:staff.edit');
Route::delete('collaborator-extras/{collaboratorExtra}', [CollaboratorExtraController::class, 'destroy'])->name('collaborator-extras.destroy')->middleware('permission:staff.delete');
Route::get('collaborator-receipts', [CollaboratorReceiptController::class, 'index'])->name('collaborator-receipts.index')->middleware('permission:staff.edit');
Route::post('collaborator-receipts', [CollaboratorReceiptController::class, 'store'])->name('collaborator-receipts.store')->middleware('permission:staff.edit');
Route::get('collaborator-receipts/{collaboratorReceipt}', [CollaboratorReceiptController::class, 'show'])->name('collaborator-receipts.show')->middleware('permission:staff.edit');
Route::put('collaborator-receipts/{collaboratorReceipt}', [CollaboratorReceiptController::class, 'update'])->name('collaborator-receipts.update')->middleware('permission:staff.edit');
Route::delete('collaborator-receipts/{collaboratorReceipt}', [CollaboratorReceiptController::class, 'destroy'])->name('collaborator-receipts.destroy')->middleware('permission:staff.delete');
Route::resource('employees', EmployeeController::class)->middleware('permission:staff.view');

// Kiosk Face & Auth
Route::post('/collaborators/{collaborator}/enroll-face', [AttendanceKioskController::class, 'enroll'])->name('collaborators.enroll-face')->middleware('permission:staff.edit');
Route::get('/collaborators/{collaborator}/webauthn/registration-options', [WebAuthnKioskController::class, 'registrationOptions'])->name('collaborators.webauthn.registration-options')->middleware('permission:staff.edit');
Route::post('/collaborators/{collaborator}/webauthn/register', [WebAuthnKioskController::class, 'register'])->name('collaborators.webauthn.register')->middleware('permission:staff.edit');
