<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CrmInteractionController;
use App\Http\Controllers\DentistController;
use App\Http\Controllers\DentistDeliveryRouteController;
use App\Http\Controllers\DentistTariffPriceController;
use App\Http\Controllers\JobAttachmentController;
use App\Http\Controllers\JobCollaboratorController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobItemController;
use App\Http\Controllers\JobRemakeController;
use App\Http\Controllers\JobStatusHistoryController;
use App\Http\Controllers\JobTeethController;
use App\Http\Controllers\JobTypeController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TariffController;
use Illuminate\Support\Facades\Route;

// Trabajos Clínicos (Mismo flujo que órdenes de laboratorio en cuanto a permisos)
Route::get('jobs', [JobController::class, 'index'])->name('jobs.index')->middleware('permission:orders.view');
Route::get('jobs/create', [JobController::class, 'create'])->name('jobs.create')->middleware('permission:orders.create');
Route::post('jobs', [JobController::class, 'store'])->name('jobs.store')->middleware('permission:orders.create');
Route::get('jobs/{job}/edit', [JobController::class, 'edit'])->name('jobs.edit')->middleware('permission:orders.edit');
Route::put('jobs/{job}', [JobController::class, 'update'])->name('jobs.update')->middleware('permission:orders.edit');
Route::delete('jobs/{job}', [JobController::class, 'destroy'])->name('jobs.destroy')->middleware('permission:orders.delete');
Route::get('jobs/{job}/ticket', [JobController::class, 'ticket'])->name('jobs.ticket')->middleware('permission:orders.view');

// Sub-recursos de Trabajos
Route::resource('job-attachments', JobAttachmentController::class)->middleware('permission:orders.edit');
Route::resource('job-collaborators', JobCollaboratorController::class)->middleware('permission:orders.edit');
Route::resource('job-items', JobItemController::class)->middleware('permission:orders.edit');
Route::resource('job-status-historys', JobStatusHistoryController::class)->middleware('permission:orders.view');
Route::resource('job-teeths', JobTeethController::class)->middleware('permission:orders.edit');
Route::resource('job-types', JobTypeController::class)->middleware('permission:orders.edit');
Route::resource('job-remakes', JobRemakeController::class)->middleware('permission:orders.edit');

// Dentistas y Clientes
Route::resource('dentists', DentistController::class)->middleware('permission:customers.view');
Route::resource('dentist-tariff-prices', DentistTariffPriceController::class)->middleware('permission:customers.edit');
Route::resource('dentist-delivery-routes', DentistDeliveryRouteController::class)->middleware('permission:customers.edit');
Route::resource('patients', PatientController::class)->middleware('permission:customers.view');

// Aranceles y CRM
Route::resource('tariffs', TariffController::class)->middleware('permission:products.view');
Route::get('crm/chatbot', function () {
    return inertia('Crm/Chatbot/Assistant');
})->name('crm.chatbot')->middleware('permission:customers.view');

Route::resource('crm-interactions', CrmInteractionController::class)->middleware('permission:customers.view');

// Analítica de Laboratorio
Route::get('analytics/lab', [AnalyticsController::class, 'lab'])->name('analytics.lab')->middleware('permission:reports.view');
