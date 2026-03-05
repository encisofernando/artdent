<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboratorioController extends Controller
{
    public function index(Request $request)
    {
        // TODO: listado de trabajos (jobs) con estados (pendiente/en_proceso/terminado/entregado)
        return Inertia::render('Laboratorio/Index', [
            'jobs' => [],
        ]);
    }

    public function show($jobId)
    {
        return Inertia::render('Laboratorio/Show', [
            'job' => [
                'id' => (int)$jobId,
                'status' => 'pendiente',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => ['required','string','max:255'],
            'title' => ['required','string','max:255'],
            'note' => ['nullable','string'],
            'priority' => ['nullable','in:baja,normal,alta,urgente'],
        ]);

        return back()->with('success', 'Trabajo creado (stub).');
    }

    public function update(Request $request, $jobId)
    {
        $request->validate([
            'status' => ['required','in:pendiente,en_proceso,terminado,entregado,cancelado'],
            'note' => ['nullable','string'],
        ]);

        return back()->with('success', 'Trabajo actualizado (stub).');
    }
}
