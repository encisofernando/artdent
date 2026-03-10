<?php

/**
 * routes/api.php
 * Rutas API puras (sin middleware web/session).
 * Usan Sanctum Bearer token para autenticación.
 */

use App\Http\Controllers\CollaboratorAssignController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Panel de Asignación de Órdenes
|--------------------------------------------------------------------------
| Endpoints consumidos por artdent-panel/index.html
| Autenticados con: Authorization: Bearer <token>
*/
Route::middleware(['auth:sanctum'])->prefix('assign')->name('assign.')->group(function () {

    Route::get('jobs/unassigned',       [CollaboratorAssignController::class, 'unassignedJobs'])
        ->name('jobs.unassigned');

    Route::get('jobs/assigned',         [CollaboratorAssignController::class, 'assignedJobs'])
        ->name('jobs.assigned');

    Route::get('collaborators/present', [CollaboratorAssignController::class, 'presentCollaborators'])
        ->name('collaborators.present');

    Route::post('jobs/{job}/assign',    [CollaboratorAssignController::class, 'assign'])
        ->name('jobs.assign');

    Route::post('jobs/{job}/unassign',  [CollaboratorAssignController::class, 'unassign'])
        ->name('jobs.unassign');
});
