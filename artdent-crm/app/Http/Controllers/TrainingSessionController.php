<?php

namespace App\Http\Controllers;

use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingSessionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'training_id' => ['required', 'integer', 'exists:trainings,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'location' => ['nullable', 'string', 'max:191'],
            'capacity' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        TrainingSession::create($validated);

        return back()->with('success', 'Sesión creada.');
    }

    public function update(Request $request, TrainingSession $trainingSession): RedirectResponse
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'location' => ['nullable', 'string', 'max:191'],
            'capacity' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        $trainingSession->update($validated);

        return back()->with('success', 'Sesión actualizada.');
    }

    public function destroy(TrainingSession $trainingSession): RedirectResponse
    {
        abort_if($trainingSession->enrollments()->exists(), 422, 'No se puede eliminar: tiene inscriptos.');

        $trainingSession->delete();

        return back()->with('success', 'Sesión eliminada.');
    }
}
