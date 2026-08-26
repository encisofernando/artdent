<?php

/**
 * routes/modules/assign-panel.php
 * Rutas API para el Panel de Asignación de Órdenes.
 * Usa auth:sanctum: acepta Bearer token (panel externo) Y sesión web (CRM interno).
 * Se excluye el middleware de sesión 'auth' heredado de web.php para usar Sanctum.
 */

use App\Http\Controllers\CollaboratorAssignController;
use Illuminate\Support\Facades\Route;

Route::withoutMiddleware('auth')
    ->middleware(['auth:sanctum'])
    ->prefix('api/assign')
    ->name('assign.')
    ->group(function () {

        // Órdenes sin colaboradores asignados
        Route::get('jobs/unassigned', [CollaboratorAssignController::class, 'unassignedJobs'])
            ->name('jobs.unassigned');

        // Órdenes que ya tienen colaboradores
        Route::get('jobs/assigned', [CollaboratorAssignController::class, 'assignedJobs'])
            ->name('jobs.assigned');

        // Colaboradores presentes hoy (time_in != null, time_out = null)
        Route::get('collaborators/present', [CollaboratorAssignController::class, 'presentCollaborators'])
            ->name('collaborators.present');

        // Asignar un colaborador a una orden
        Route::post('jobs/{job}/assign', [CollaboratorAssignController::class, 'assign'])
            ->name('jobs.assign')
            ->middleware('permission:orders.edit');

        // Desasignar un colaborador de una orden
        Route::post('jobs/{job}/unassign', [CollaboratorAssignController::class, 'unassign'])
            ->name('jobs.unassign')
            ->middleware('permission:orders.edit');
    });
