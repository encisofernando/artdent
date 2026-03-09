<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DentistController;
use App\Http\Controllers\DentistTariffPriceController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobAttachmentController;
use App\Http\Controllers\JobCollaboratorController;
use App\Http\Controllers\JobItemController;
use App\Http\Controllers\JobStatusHistoryController;
use App\Http\Controllers\JobTeethController;
use App\Http\Controllers\JobTypeController;

Route::get('jobs/{job}/ticket', [JobController::class,'ticket'])->name('jobs.ticket');

Route::resource('jobs', JobController::class);
Route::resource('job-attachments', JobAttachmentController::class);
Route::resource('job-collaborators', JobCollaboratorController::class);
Route::resource('job-items', JobItemController::class);
Route::resource('job-status-historys', JobStatusHistoryController::class);
Route::resource('job-teeths', JobTeethController::class);
Route::resource('job-types', JobTypeController::class);

Route::resource('dentists', DentistController::class);
Route::resource('dentist-tariff-prices', DentistTariffPriceController::class);

Route::resource('patients', PatientController::class);
Route::resource('tariffs', TariffController::class);
