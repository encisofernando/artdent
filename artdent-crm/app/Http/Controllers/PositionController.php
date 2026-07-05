<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'reports_to_position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'name' => ['required', 'string', 'max:191'],
            'is_active' => ['boolean'],
        ]);

        Position::create(array_merge($validated, ['company_id' => $companyId]));

        return back()->with('success', 'Puesto creado.');
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $position->company_id === $companyId, 404);

        $validated = $request->validate([
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'reports_to_position_id' => ['nullable', 'integer', 'exists:positions,id', 'different:id'],
            'name' => ['required', 'string', 'max:191'],
            'is_active' => ['boolean'],
        ]);

        $position->update($validated);

        return back()->with('success', 'Puesto actualizado.');
    }

    public function destroy(Position $position): RedirectResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        abort_unless((int) $position->company_id === $companyId, 404);

        abort_if(
            $position->employees()->exists() || $position->subordinatePositions()->exists(),
            422,
            'No se puede eliminar: tiene empleados o puestos subordinados asociados.'
        );

        $position->delete();

        return back()->with('success', 'Puesto eliminado.');
    }
}
