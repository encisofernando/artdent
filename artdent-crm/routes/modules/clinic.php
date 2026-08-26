<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CrmInteractionController;
use App\Http\Controllers\DeliveryNoteController;
use App\Http\Controllers\DentistController;
use App\Http\Controllers\DentistDeliveryRouteController;
use App\Http\Controllers\JobAttachmentController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobPhaseKioskController;
use App\Http\Controllers\JobRemakeController;
use App\Http\Controllers\JobRequestController;
use App\Http\Controllers\JobTeethController;
use App\Http\Controllers\JobTypeController;
use App\Http\Controllers\LabAccountPaymentReportController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PhaseTemplateController;
use App\Http\Controllers\TariffController;
use Illuminate\Support\Facades\Route;

Route::middleware('module:laboratorio')->group(function () {
    // Trabajos Clínicos (Mismo flujo que órdenes de laboratorio en cuanto a permisos)
    Route::get('jobs', [JobController::class, 'index'])->name('jobs.index')->middleware('permission:orders.view');
    Route::get('jobs/create', [JobController::class, 'create'])->name('jobs.create')->middleware('permission:orders.create');
    Route::post('jobs', [JobController::class, 'store'])->name('jobs.store')->middleware('permission:orders.create');
    Route::get('jobs/{job}', [JobController::class, 'show'])->name('jobs.show')->middleware('permission:orders.view');
    Route::get('jobs/{job}/edit', [JobController::class, 'edit'])->name('jobs.edit')->middleware('permission:orders.edit');
    Route::put('jobs/{job}', [JobController::class, 'update'])->name('jobs.update')->middleware('permission:orders.edit');
    Route::delete('jobs/{job}', [JobController::class, 'destroy'])->name('jobs.destroy')->middleware('permission:orders.delete');
    Route::get('jobs/{job}/ticket', [JobController::class, 'ticket'])->name('jobs.ticket')->middleware('permission:orders.view');

    // Solicitudes de trabajo enviadas desde el portal del odontólogo
    Route::get('job-requests', [JobRequestController::class, 'index'])->name('job-requests.index')->middleware('permission:orders.create');
    Route::post('job-requests/{jobRequest}/reject', [JobRequestController::class, 'reject'])->name('job-requests.reject')->middleware('permission:orders.create');

    // Comprobantes de pago informados desde el portal del odontólogo
    Route::get('lab-account-payment-reports', [LabAccountPaymentReportController::class, 'index'])->name('lab-account-payment-reports.index')->middleware('permission:orders.edit');
    Route::post('lab-account-payment-reports/{labAccountPaymentReport}/approve', [LabAccountPaymentReportController::class, 'approve'])->name('lab-account-payment-reports.approve')->middleware('permission:orders.edit');
    Route::post('lab-account-payment-reports/{labAccountPaymentReport}/reject', [LabAccountPaymentReportController::class, 'reject'])->name('lab-account-payment-reports.reject')->middleware('permission:orders.edit');

    // Sub-recursos de Trabajos
    Route::resource('job-attachments', JobAttachmentController::class)->only(['index', 'store', 'destroy'])->middleware('permission:orders.edit');
    Route::resource('job-teeths', JobTeethController::class)->middleware('permission:orders.edit');
    Route::resource('job-types', JobTypeController::class)->middleware('permission:orders.edit');
    Route::resource('job-remakes', JobRemakeController::class)->middleware('permission:orders.edit');

    // Fases de Órdenes — CRM (requiere autenticación)
    Route::post('jobs/{job}/initialize-phases', [JobPhaseKioskController::class, 'initializePhases'])->name('jobs.initialize-phases')->middleware('permission:orders.edit');
    Route::post('jobs/{job}/return-from-proof', [JobPhaseKioskController::class, 'returnFromProof'])->name('jobs.return-from-proof')->middleware('permission:orders.edit');
    Route::post('jobs/{job}/register-delivery', [JobPhaseKioskController::class, 'registerDelivery'])->name('jobs.register-delivery')->middleware('permission:orders.edit');

    // Dentistas y Clientes
    Route::resource('dentists', DentistController::class)->middleware('permission:customers.view');
    Route::resource('dentist-delivery-routes', DentistDeliveryRouteController::class)->middleware('permission:customers.edit');

    // Remitos de entrega (comprobante no fiscal que acompaña la entrega de trabajos al odontólogo)
    Route::get('remitos', [DeliveryNoteController::class, 'create'])->name('remitos.create')->middleware('permission:orders.edit');
    Route::post('remitos', [DeliveryNoteController::class, 'store'])->name('remitos.store')->middleware('permission:orders.edit');
    Route::get('remitos/pdf', [DeliveryNoteController::class, 'pdf'])->name('remitos.pdf')->middleware('permission:orders.edit');

    // Aranceles y CRM
    Route::get('tariffs/pdf', [TariffController::class, 'pdf'])->name('tariffs.pdf')->middleware('permission:products.view');
    Route::put('tariffs/notes', [TariffController::class, 'updateNotes'])->name('tariffs.notes.update')->middleware('permission:products.view');
    Route::resource('tariffs', TariffController::class)->middleware('permission:products.view');
    Route::resource('phase-templates', PhaseTemplateController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('permission:products.view');
    Route::get('crm/chatbot', function () {
        return inertia('Crm/Chatbot/Assistant');
    })->name('crm.chatbot')->middleware('permission:customers.view');

    Route::resource('crm-interactions', CrmInteractionController::class)->middleware('permission:customers.view');
});

// Pacientes — dominio de clínica/consultorio, independiente del laboratorio
Route::resource('patients', PatientController::class)->middleware(['module:clinica', 'permission:customers.view']);

// Analítica de Laboratorio — dato genuinamente de laboratorio (jobs/tarifas/
// dentistas), no reportes genéricos; estaba mal gateada a 'reportes'.
Route::get('analytics/lab', [AnalyticsController::class, 'lab'])->name('analytics.lab')->middleware(['module:laboratorio', 'permission:reports.view']);
