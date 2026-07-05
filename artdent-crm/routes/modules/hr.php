<?php

use App\Http\Controllers\ArtAccidentController;
use App\Http\Controllers\ArtProviderController;
use App\Http\Controllers\CapacitacionesController;
use App\Http\Controllers\CollaboratorAttendanceController;
use App\Http\Controllers\CollaboratorController;
use App\Http\Controllers\CollaboratorDiscountController;
use App\Http\Controllers\CollaboratorExtraController;
use App\Http\Controllers\CollaboratorReceiptController;
use App\Http\Controllers\ConceptosController;
use App\Http\Controllers\ConveniosController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeAttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDiscountController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\EmployeeExtraController;
use App\Http\Controllers\EmployeeFamilyMemberController;
use App\Http\Controllers\EmployeePortalController;
use App\Http\Controllers\EmployeeReceiptController;
use App\Http\Controllers\EvaluacionesController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationCriterionController;
use App\Http\Controllers\EvaluationCycleController;
use App\Http\Controllers\LaborAgreementCategoryController;
use App\Http\Controllers\LaborAgreementController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\MedicalExamController;
use App\Http\Controllers\MedicinaLaboralController;
use App\Http\Controllers\ObjectiveController;
use App\Http\Controllers\OrganigramaController;
use App\Http\Controllers\PayrollBookSubmissionController;
use App\Http\Controllers\PayrollConceptController;
use App\Http\Controllers\PayrollConceptVersionController;
use App\Http\Controllers\PayrollRunController;
use App\Http\Controllers\PayrollVariableController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ReportesRrhhController;
use App\Http\Controllers\SalaryScaleController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\TrainingEnrollmentController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\VacacionesController;
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
// Personal / Insumos
Route::resource('employees', EmployeeController::class)
    ->only(['index', 'show', 'store', 'update', 'destroy'])
    ->middleware('permission:staff.view');

Route::put('employees/{employee}/legajo', [EmployeeController::class, 'legajo'])->name('employees.legajo')->middleware('permission:staff.edit');

Route::get('employee-extras', [EmployeeExtraController::class, 'index'])->name('employee-extras.index')->middleware('permission:staff.view');
Route::post('employee-extras', [EmployeeExtraController::class, 'store'])->name('employee-extras.store')->middleware('permission:staff.edit');
Route::put('employee-extras/{employeeExtra}', [EmployeeExtraController::class, 'update'])->name('employee-extras.update')->middleware('permission:staff.edit');
Route::delete('employee-extras/{employeeExtra}', [EmployeeExtraController::class, 'destroy'])->name('employee-extras.destroy')->middleware('permission:staff.delete');

Route::get('employee-discounts', [EmployeeDiscountController::class, 'index'])->name('employee-discounts.index')->middleware('permission:staff.view');
Route::post('employee-discounts', [EmployeeDiscountController::class, 'store'])->name('employee-discounts.store')->middleware('permission:staff.edit');
Route::put('employee-discounts/{employeeDiscount}', [EmployeeDiscountController::class, 'update'])->name('employee-discounts.update')->middleware('permission:staff.edit');
Route::delete('employee-discounts/{employeeDiscount}', [EmployeeDiscountController::class, 'destroy'])->name('employee-discounts.destroy')->middleware('permission:staff.delete');

Route::get('employee-receipts', [EmployeeReceiptController::class, 'index'])->name('employee-receipts.index')->middleware('permission:staff.edit');
Route::post('employee-receipts', [EmployeeReceiptController::class, 'store'])->name('employee-receipts.store')->middleware('permission:staff.edit');
Route::get('employee-receipts/{employeeReceipt}', [EmployeeReceiptController::class, 'show'])->name('employee-receipts.show')->middleware('permission:staff.edit');
Route::get('employee-receipts/{employeeReceipt}/pdf', [EmployeeReceiptController::class, 'pdf'])->name('employee-receipts.pdf')->middleware('permission:staff.edit');
Route::put('employee-receipts/{employeeReceipt}', [EmployeeReceiptController::class, 'update'])->name('employee-receipts.update')->middleware('permission:staff.edit');
Route::delete('employee-receipts/{employeeReceipt}', [EmployeeReceiptController::class, 'destroy'])->name('employee-receipts.destroy')->middleware('permission:staff.delete');

// Legajo — documentos y familiares
Route::post('employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])->name('employee-documents.store')->middleware('permission:staff.edit');
Route::delete('employee-documents/{employeeDocument}', [EmployeeDocumentController::class, 'destroy'])->name('employee-documents.destroy')->middleware('permission:staff.delete');

Route::post('employees/{employee}/family-members', [EmployeeFamilyMemberController::class, 'store'])->name('employee-family-members.store')->middleware('permission:staff.edit');
Route::put('employee-family-members/{employeeFamilyMember}', [EmployeeFamilyMemberController::class, 'update'])->name('employee-family-members.update')->middleware('permission:staff.edit');
Route::delete('employee-family-members/{employeeFamilyMember}', [EmployeeFamilyMemberController::class, 'destroy'])->name('employee-family-members.destroy')->middleware('permission:staff.delete');

// Organigrama
Route::get('organigrama', [OrganigramaController::class, 'index'])->name('organigrama.index')->middleware('permission:staff.view');
Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store')->middleware('permission:rrhh.organigrama.manage');
Route::put('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update')->middleware('permission:rrhh.organigrama.manage');
Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy')->middleware('permission:rrhh.organigrama.manage');
Route::post('positions', [PositionController::class, 'store'])->name('positions.store')->middleware('permission:rrhh.organigrama.manage');
Route::put('positions/{position}', [PositionController::class, 'update'])->name('positions.update')->middleware('permission:rrhh.organigrama.manage');
Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy')->middleware('permission:rrhh.organigrama.manage');

// Convenios Colectivos y Escalas Salariales
Route::get('convenios', [ConveniosController::class, 'index'])->name('convenios.index')->middleware('permission:staff.view');
Route::post('labor-agreements', [LaborAgreementController::class, 'store'])->name('labor-agreements.store')->middleware('permission:rrhh.convenios.manage');
Route::put('labor-agreements/{laborAgreement}', [LaborAgreementController::class, 'update'])->name('labor-agreements.update')->middleware('permission:rrhh.convenios.manage');
Route::delete('labor-agreements/{laborAgreement}', [LaborAgreementController::class, 'destroy'])->name('labor-agreements.destroy')->middleware('permission:rrhh.convenios.manage');
Route::post('labor-agreement-categories', [LaborAgreementCategoryController::class, 'store'])->name('labor-agreement-categories.store')->middleware('permission:rrhh.convenios.manage');
Route::put('labor-agreement-categories/{laborAgreementCategory}', [LaborAgreementCategoryController::class, 'update'])->name('labor-agreement-categories.update')->middleware('permission:rrhh.convenios.manage');
Route::delete('labor-agreement-categories/{laborAgreementCategory}', [LaborAgreementCategoryController::class, 'destroy'])->name('labor-agreement-categories.destroy')->middleware('permission:rrhh.convenios.manage');
Route::post('salary-scales', [SalaryScaleController::class, 'store'])->name('salary-scales.store')->middleware('permission:rrhh.convenios.manage');
Route::delete('salary-scales/{salaryScale}', [SalaryScaleController::class, 'destroy'])->name('salary-scales.destroy')->middleware('permission:rrhh.convenios.manage');

// Vacaciones y Licencias
Route::get('vacaciones', [VacacionesController::class, 'index'])->name('vacaciones.index')->middleware('permission:staff.view');
Route::post('leave-types', [LeaveTypeController::class, 'store'])->name('leave-types.store')->middleware('permission:rrhh.leaves.approve');
Route::put('leave-types/{leaveType}', [LeaveTypeController::class, 'update'])->name('leave-types.update')->middleware('permission:rrhh.leaves.approve');
Route::delete('leave-types/{leaveType}', [LeaveTypeController::class, 'destroy'])->name('leave-types.destroy')->middleware('permission:rrhh.leaves.approve');
Route::post('leave-requests', [LeaveRequestController::class, 'store'])->name('leave-requests.store')->middleware('permission:staff.edit');
Route::put('leave-requests/{leaveRequest}', [LeaveRequestController::class, 'update'])->name('leave-requests.update')->middleware('permission:rrhh.leaves.approve');
Route::delete('leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy'])->name('leave-requests.destroy')->middleware('permission:staff.edit');

// Medicina Laboral
Route::get('medicina-laboral', [MedicinaLaboralController::class, 'index'])->name('medicina-laboral.index')->middleware('permission:staff.view');
Route::post('art-providers', [ArtProviderController::class, 'store'])->name('art-providers.store')->middleware('permission:rrhh.medical.manage');
Route::put('art-providers/{artProvider}', [ArtProviderController::class, 'update'])->name('art-providers.update')->middleware('permission:rrhh.medical.manage');
Route::delete('art-providers/{artProvider}', [ArtProviderController::class, 'destroy'])->name('art-providers.destroy')->middleware('permission:rrhh.medical.manage');
Route::post('medical-exams', [MedicalExamController::class, 'store'])->name('medical-exams.store')->middleware('permission:rrhh.medical.manage');
Route::put('medical-exams/{medicalExam}', [MedicalExamController::class, 'update'])->name('medical-exams.update')->middleware('permission:rrhh.medical.manage');
Route::delete('medical-exams/{medicalExam}', [MedicalExamController::class, 'destroy'])->name('medical-exams.destroy')->middleware('permission:rrhh.medical.manage');
Route::post('art-accidents', [ArtAccidentController::class, 'store'])->name('art-accidents.store')->middleware('permission:rrhh.medical.manage');
Route::put('art-accidents/{artAccident}', [ArtAccidentController::class, 'update'])->name('art-accidents.update')->middleware('permission:rrhh.medical.manage');
Route::delete('art-accidents/{artAccident}', [ArtAccidentController::class, 'destroy'])->name('art-accidents.destroy')->middleware('permission:rrhh.medical.manage');

// Evaluaciones de Desempeño y Objetivos
Route::get('evaluaciones', [EvaluacionesController::class, 'index'])->name('evaluaciones.index')->middleware('permission:staff.view');
Route::post('evaluation-cycles', [EvaluationCycleController::class, 'store'])->name('evaluation-cycles.store')->middleware('permission:rrhh.evaluations.manage');
Route::put('evaluation-cycles/{evaluationCycle}', [EvaluationCycleController::class, 'update'])->name('evaluation-cycles.update')->middleware('permission:rrhh.evaluations.manage');
Route::delete('evaluation-cycles/{evaluationCycle}', [EvaluationCycleController::class, 'destroy'])->name('evaluation-cycles.destroy')->middleware('permission:rrhh.evaluations.manage');
Route::post('evaluation-criteria', [EvaluationCriterionController::class, 'store'])->name('evaluation-criteria.store')->middleware('permission:rrhh.evaluations.manage');
Route::put('evaluation-criteria/{evaluationCriterion}', [EvaluationCriterionController::class, 'update'])->name('evaluation-criteria.update')->middleware('permission:rrhh.evaluations.manage');
Route::delete('evaluation-criteria/{evaluationCriterion}', [EvaluationCriterionController::class, 'destroy'])->name('evaluation-criteria.destroy')->middleware('permission:rrhh.evaluations.manage');
Route::post('evaluations', [EvaluationController::class, 'store'])->name('evaluations.store')->middleware('permission:rrhh.evaluations.manage');
Route::put('evaluations/{evaluation}', [EvaluationController::class, 'update'])->name('evaluations.update')->middleware('permission:rrhh.evaluations.manage');
Route::delete('evaluations/{evaluation}', [EvaluationController::class, 'destroy'])->name('evaluations.destroy')->middleware('permission:rrhh.evaluations.manage');
Route::post('objectives', [ObjectiveController::class, 'store'])->name('objectives.store')->middleware('permission:rrhh.evaluations.manage');
Route::put('objectives/{objective}', [ObjectiveController::class, 'update'])->name('objectives.update')->middleware('permission:rrhh.evaluations.manage');
Route::delete('objectives/{objective}', [ObjectiveController::class, 'destroy'])->name('objectives.destroy')->middleware('permission:rrhh.evaluations.manage');

// Capacitaciones
Route::get('capacitaciones', [CapacitacionesController::class, 'index'])->name('capacitaciones.index')->middleware('permission:staff.view');
Route::post('trainings', [TrainingController::class, 'store'])->name('trainings.store')->middleware('permission:rrhh.trainings.manage');
Route::put('trainings/{training}', [TrainingController::class, 'update'])->name('trainings.update')->middleware('permission:rrhh.trainings.manage');
Route::delete('trainings/{training}', [TrainingController::class, 'destroy'])->name('trainings.destroy')->middleware('permission:rrhh.trainings.manage');
Route::post('training-sessions', [TrainingSessionController::class, 'store'])->name('training-sessions.store')->middleware('permission:rrhh.trainings.manage');
Route::put('training-sessions/{trainingSession}', [TrainingSessionController::class, 'update'])->name('training-sessions.update')->middleware('permission:rrhh.trainings.manage');
Route::delete('training-sessions/{trainingSession}', [TrainingSessionController::class, 'destroy'])->name('training-sessions.destroy')->middleware('permission:rrhh.trainings.manage');
Route::post('training-enrollments', [TrainingEnrollmentController::class, 'store'])->name('training-enrollments.store')->middleware('permission:rrhh.trainings.manage');
Route::put('training-enrollments/{trainingEnrollment}', [TrainingEnrollmentController::class, 'update'])->name('training-enrollments.update')->middleware('permission:rrhh.trainings.manage');
Route::delete('training-enrollments/{trainingEnrollment}', [TrainingEnrollmentController::class, 'destroy'])->name('training-enrollments.destroy')->middleware('permission:rrhh.trainings.manage');

// Motor de Fórmulas — Conceptos y Variables de Liquidación
Route::get('conceptos', [ConceptosController::class, 'index'])->name('conceptos.index')->middleware('permission:staff.view');
Route::post('conceptos/simulate', [PayrollConceptController::class, 'simulate'])->name('payroll-concepts.simulate')->middleware('permission:rrhh.formulas.manage');
Route::post('payroll-variables', [PayrollVariableController::class, 'store'])->name('payroll-variables.store')->middleware('permission:rrhh.formulas.manage');
Route::put('payroll-variables/{payrollVariable}', [PayrollVariableController::class, 'update'])->name('payroll-variables.update')->middleware('permission:rrhh.formulas.manage');
Route::delete('payroll-variables/{payrollVariable}', [PayrollVariableController::class, 'destroy'])->name('payroll-variables.destroy')->middleware('permission:rrhh.formulas.manage');
Route::post('payroll-concepts', [PayrollConceptController::class, 'store'])->name('payroll-concepts.store')->middleware('permission:rrhh.formulas.manage');
Route::put('payroll-concepts/{payrollConcept}', [PayrollConceptController::class, 'update'])->name('payroll-concepts.update')->middleware('permission:rrhh.formulas.manage');
Route::delete('payroll-concepts/{payrollConcept}', [PayrollConceptController::class, 'destroy'])->name('payroll-concepts.destroy')->middleware('permission:rrhh.formulas.manage');
Route::post('payroll-concept-versions', [PayrollConceptVersionController::class, 'store'])->name('payroll-concept-versions.store')->middleware('permission:rrhh.formulas.manage');
Route::delete('payroll-concept-versions/{payrollConceptVersion}', [PayrollConceptVersionController::class, 'destroy'])->name('payroll-concept-versions.destroy')->middleware('permission:rrhh.formulas.manage');

// Liquidación de Sueldos (Payroll Runs)
Route::get('payroll-runs', [PayrollRunController::class, 'index'])->name('payroll-runs.index')->middleware('permission:staff.view');
Route::get('payroll-runs/create', [PayrollRunController::class, 'create'])->name('payroll-runs.create')->middleware('permission:rrhh.liquidaciones.run');
Route::post('payroll-runs', [PayrollRunController::class, 'store'])->name('payroll-runs.store')->middleware('permission:rrhh.liquidaciones.run');
Route::get('payroll-runs/{payrollRun}', [PayrollRunController::class, 'show'])->name('payroll-runs.show')->middleware('permission:staff.view');
Route::put('payroll-runs/{payrollRun}', [PayrollRunController::class, 'update'])->name('payroll-runs.update')->middleware('permission:rrhh.liquidaciones.approve');
Route::delete('payroll-runs/{payrollRun}', [PayrollRunController::class, 'destroy'])->name('payroll-runs.destroy')->middleware('permission:rrhh.liquidaciones.run');

// Asistencia de Empleados
Route::get('employee-attendances', [EmployeeAttendanceController::class, 'index'])->name('employee-attendances.index')->middleware('permission:staff.view');
Route::post('employee-attendances', [EmployeeAttendanceController::class, 'store'])->name('employee-attendances.store')->middleware('permission:staff.edit');
Route::put('employee-attendances/{employeeAttendance}', [EmployeeAttendanceController::class, 'update'])->name('employee-attendances.update')->middleware('permission:staff.edit');
Route::delete('employee-attendances/{employeeAttendance}', [EmployeeAttendanceController::class, 'destroy'])->name('employee-attendances.destroy')->middleware('permission:staff.delete');

// Kiosk Auth (WebAuthn) — enrolar huella/biometría de plataforma
Route::get('/collaborators/{collaborator}/webauthn/registration-options', [WebAuthnKioskController::class, 'registrationOptions'])->name('collaborators.webauthn.registration-options')->middleware('permission:staff.edit');
Route::post('/collaborators/{collaborator}/webauthn/register', [WebAuthnKioskController::class, 'register'])->name('collaborators.webauthn.register')->middleware('permission:staff.edit');
Route::get('/employees/{employee}/webauthn/registration-options', [WebAuthnKioskController::class, 'employeeRegistrationOptions'])->name('employees.webauthn.registration-options')->middleware('permission:staff.edit');
Route::post('/employees/{employee}/webauthn/register', [WebAuthnKioskController::class, 'registerEmployee'])->name('employees.webauthn.register')->middleware('permission:staff.edit');

// Portal del Empleado — autogestión. Sin middleware de permission: se habilita para cualquier
// usuario autenticado que tenga un Employee asociado (verificado dentro del controller).
Route::get('portal', [EmployeePortalController::class, 'index'])->name('portal.index');
Route::get('portal/recibos', [EmployeePortalController::class, 'misRecibos'])->name('portal.recibos');
Route::get('portal/recibos/{employeeReceipt}/pdf', [EmployeePortalController::class, 'reciboPdf'])->name('portal.recibos.pdf');
Route::get('portal/licencias', [EmployeePortalController::class, 'misLicencias'])->name('portal.licencias');
Route::post('portal/licencias', [EmployeePortalController::class, 'storeLicencia'])->name('portal.licencias.store');
Route::delete('portal/licencias/{leaveRequest}', [EmployeePortalController::class, 'cancelLicencia'])->name('portal.licencias.cancel');
Route::get('portal/legajo', [EmployeePortalController::class, 'miLegajo'])->name('portal.legajo');
Route::put('portal/legajo', [EmployeePortalController::class, 'updateLegajo'])->name('portal.legajo.update');

// Reportes RRHH
Route::get('reportes-rrhh', [ReportesRrhhController::class, 'index'])->name('reportes-rrhh.index')->middleware('permission:reports.view');

// Libro de Sueldos Digital / SICOSS — placeholder de arquitectura, sin envíos reales
// (ver LibroSueldosDigitalService). Bloqueado hasta confirmar la especificación legal vigente.
Route::get('libro-sueldos-digital', [PayrollBookSubmissionController::class, 'index'])->name('payroll-book-submissions.index')->middleware('permission:rrhh.liquidaciones.approve');
Route::post('libro-sueldos-digital', [PayrollBookSubmissionController::class, 'store'])->name('payroll-book-submissions.store')->middleware('permission:rrhh.liquidaciones.approve');
