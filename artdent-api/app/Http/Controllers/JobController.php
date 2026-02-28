<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class JobController extends Controller
{
    /**
     * GET /api/jobs
     * Params: company_id, status, priority, clinic_id, patient_id, search, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Job::with(['clinic', 'patient', 'jobType', 'dentist'])
            ->when($request->company_id,  fn($q) => $q->where('company_id',  $request->company_id))
            ->when($request->status,      fn($q) => $q->where('status',      $request->status))
            ->when($request->priority,    fn($q) => $q->where('priority',    $request->priority))
            ->when($request->clinic_id,   fn($q) => $q->where('clinic_id',   $request->clinic_id))
            ->when($request->patient_id,  fn($q) => $q->where('patient_id',  $request->patient_id))
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('ticket_number', 'like', $term)
                      ->orWhere('notes',        'like', $term);
                });
            })
            ->orderByDesc('entry_date')
            ->orderByDesc('id');

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 20)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/jobs
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'clinic_id'      => 'nullable|exists:clinics,id',
            'dentist_id'     => 'nullable|exists:dentists,id',
            'patient_id'     => 'nullable|exists:patients,id',
            'job_type_id'    => 'nullable|exists:job_types,id',
            'entry_date'     => 'required|date',
            'promised_date'  => 'nullable|date',
            'delivery_date'  => 'nullable|date',
            'work_type'      => 'in:ticket,budget',
            'status'         => 'in:pending,in_progress,completed,delivered,cancelled',
            'priority'       => 'in:low,normal,high,urgent',
            'subtotal'       => 'nullable|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'tax'            => 'nullable|numeric|min:0',
            'total'          => 'nullable|numeric|min:0',
            'specifications' => 'nullable|string',
            'notes'          => 'nullable|string',
            'internal_notes' => 'nullable|string',
        ]);

        // Genera ticket_number único
        $validated['ticket_number'] = $validated['ticket_number']
            ?? 'LAB-' . strtoupper(Str::random(8));

        // Por defecto entry_date = hoy
        $validated['entry_date'] = $validated['entry_date'] ?? now()->toDateString();

        // Auditoría
        $validated['created_by'] = auth()->user()?->id;
        $validated['updated_by'] = auth()->user()?->id;

        $job = Job::create($validated);

        return response()->json($job->load(['clinic', 'patient', 'jobType']), 201);
    }

    /**
     * GET /api/jobs/{job}
     */
    public function show(Job $job): JsonResponse
    {
        return response()->json(
            $job->load(['clinic', 'patient', 'jobType', 'dentist', 'costs'])
        );
    }

    /**
     * PUT /api/jobs/{job}
     */
    public function update(Request $request, Job $job): JsonResponse
    {
        $validated = $request->validate([
            'clinic_id'      => 'nullable|exists:clinics,id',
            'dentist_id'     => 'nullable|exists:dentists,id',
            'patient_id'     => 'nullable|exists:patients,id',
            'job_type_id'    => 'nullable|exists:job_types,id',
            'promised_date'  => 'nullable|date',
            'delivery_date'  => 'nullable|date',
            'work_type'      => 'in:ticket,budget',
            'status'         => 'in:pending,in_progress,completed,delivered,cancelled',
            'priority'       => 'in:low,normal,high,urgent',
            'subtotal'       => 'nullable|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'tax'            => 'nullable|numeric|min:0',
            'total'          => 'nullable|numeric|min:0',
            'specifications' => 'nullable|string',
            'notes'          => 'nullable|string',
            'internal_notes' => 'nullable|string',
        ]);

        $validated['updated_by'] = auth()->user()?->id;

        $job->update($validated);

        return response()->json($job->load(['clinic', 'patient', 'jobType']));
    }

    /**
     * DELETE /api/jobs/{job}
     */
    public function destroy(Job $job): JsonResponse
    {
        $job->delete();

        return response()->json(null, 204);
    }
}
