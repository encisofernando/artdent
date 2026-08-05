<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'branches' => Branch::where('company_id', CompanyContext::id())
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:32', \Illuminate\Validation\Rule::unique('branches')->where('company_id', $companyId)],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        Branch::create([...$validated, 'company_id' => $companyId]);

        return response()->json(['success' => true, 'message' => 'Sucursal creada.']);
    }

    public function show(Branch $branch)
    {
        //
    }

    public function edit(Branch $branch)
    {
        //
    }

    public function update(Request $request, Branch $branch): JsonResponse
    {
        abort_unless($branch->company_id === CompanyContext::id(), 404);

        $companyId = $branch->company_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:32', \Illuminate\Validation\Rule::unique('branches')->where('company_id', $companyId)->ignore($branch->id)],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $branch->update($validated);

        return response()->json(['success' => true, 'message' => 'Sucursal actualizada.']);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        abort_unless($branch->company_id === CompanyContext::id(), 404);

        if ($branch->afipPointsOfSale()->exists()) {
            return response()->json(['success' => false, 'error' => 'No se puede eliminar: hay puntos de venta AFIP asignados a esta sucursal.'], 422);
        }

        $branch->delete();

        return response()->json(['success' => true, 'message' => 'Sucursal eliminada.']);
    }
}
