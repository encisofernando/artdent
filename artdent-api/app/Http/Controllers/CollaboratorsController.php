<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use Illuminate\Http\Request;

class CollaboratorsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $q = Collaborator::query();

        $companyId = optional($request->user())->company_id;
        if ($companyId) $q->where('company_id', $companyId);

        if ($request->filled('active')) {
            $active = filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
            if ($active !== null) $q->where('is_active', $active);
        }

        if ($request->filled('search')) {
            $s = trim($request->query('search'));
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%{$s}%")
                   ->orWhere('document', 'like', "%{$s}%");
            });
        }

        return response()->json($q->orderBy('name')->get());
    }

    public function show(Request $request, $id)
    {
        $collab = Collaborator::findOrFail($id);
        $this->authorizeCompany($request, $collab);
        return response()->json($collab);
    }

    public function store(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'document' => ['nullable','string','max:100'],
            'hourly_rate' => ['required','numeric','min:0'],
            'is_active' => ['nullable','boolean'],
            'notes' => ['nullable','string'],
        ]);

        $data['company_id'] = optional($request->user())->company_id;
        $collab = Collaborator::create($data);

        return response()->json($collab, 201);
    }

    public function update(Request $request, $id)
    {
        $collab = Collaborator::findOrFail($id);
        $this->authorizeCompany($request, $collab);

        $data = $request->validate([
            'name' => ['sometimes','required','string','max:255'],
            'document' => ['nullable','string','max:100'],
            'hourly_rate' => ['sometimes','required','numeric','min:0'],
            'is_active' => ['nullable','boolean'],
            'notes' => ['nullable','string'],
        ]);

        $collab->fill($data)->save();

        return response()->json($collab);
    }

    public function destroy(Request $request, $id)
    {
        $collab = Collaborator::findOrFail($id);
        $this->authorizeCompany($request, $collab);
        $collab->delete();
        return response()->json(['ok' => true]);
    }

     private function authorizeCompany(Request $request, Collaborator $collab): void
    {
        if (!$request->user()) {
            abort(401, 'Unauthenticated.');
        }
        $companyId = optional($request->user())->company_id;
        if ($companyId && (int)$collab->company_id !== (int)$companyId) {
            abort(403, 'No autorizado.');
        }
    }
}
