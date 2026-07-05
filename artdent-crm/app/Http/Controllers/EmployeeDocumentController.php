<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentController extends Controller
{
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'type' => ['required', 'string', 'max:50'],
            'file' => ['required', 'file', 'max:10240'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $path = $request->file('file')->store("employee-documents/{$employee->id}", 'public');

        EmployeeDocument::create([
            'company_id' => $companyId,
            'employee_id' => $employee->id,
            'uploaded_by' => $request->user()->id,
            'type' => $validated['type'],
            'file_path' => $path,
            'expires_at' => $validated['expires_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Documento cargado.');
    }

    public function destroy(EmployeeDocument $employeeDocument): RedirectResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        abort_unless((int) $employeeDocument->company_id === $companyId, 404);

        if (Storage::disk('public')->exists($employeeDocument->file_path)) {
            Storage::disk('public')->delete($employeeDocument->file_path);
        }

        $employeeDocument->delete();

        return back()->with('success', 'Documento eliminado.');
    }
}
