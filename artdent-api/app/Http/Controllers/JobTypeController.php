<?php

namespace App\Http\Controllers;

use App\Models\JobType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobTypeController extends Controller
{
    /**
     * GET /api/job-types
     * Params opcionales: company_id, active (bool), search
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobType::query()
            ->when($request->company_id, fn($q) => $q->where('company_id', $request->company_id))
            ->when($request->boolean('active', true), fn($q) => $q->active())
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
            ->orderBy('name');

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 50)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/job-types
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'base_price'     => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:1',
            'color'          => 'nullable|string|max:7',
            'is_active'      => 'boolean',
        ]);

        $jobType = JobType::create($validated);

        return response()->json($jobType, 201);
    }

    /**
     * GET /api/job-types/{jobType}
     */
    public function show(JobType $jobType): JsonResponse
    {
        return response()->json($jobType);
    }

    /**
     * PUT /api/job-types/{jobType}
     */
    public function update(Request $request, JobType $jobType): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
            'base_price'     => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:1',
            'color'          => 'nullable|string|max:7',
            'is_active'      => 'boolean',
        ]);

        $jobType->update($validated);

        return response()->json($jobType);
    }

    /**
     * DELETE /api/job-types/{jobType}
     */
    public function destroy(JobType $jobType): JsonResponse
    {
        $jobType->delete(); // SoftDelete

        return response()->json(null, 204);
    }
}
