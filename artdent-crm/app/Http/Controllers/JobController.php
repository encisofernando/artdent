<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Dentist;
use App\Models\Patient;
use App\Models\JobType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Job::with(['dentist', 'patient', 'job_type', 'user']);

        if ($search) {
            $query->where('job_number', 'like', "%{$search}%")
                  ->orWhereHas('dentist', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Job/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Job/Create', [
            'dentists' => Dentist::orderBy('name')->get(['id', 'name', 'last_name']),
            'patients' => Patient::orderBy('name')->get(['id', 'name', 'last_name']),
            'jobTypes' => JobType::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'patient_id' => 'nullable|exists:patients,id',
            'job_type_id' => 'nullable|exists:job_types,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status' => 'required|string|max:50',
            'priority' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'clinical_notes' => 'nullable|string',
            'shade' => 'nullable|string|max:50',
            'received_at' => 'nullable|date',
            'due_date' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'subtotal' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = auth()->user()->company_id ?? 1;
        
        // Generate a random job number if not provided by logic, normally this might be an auto-increment or specific format.
        $validated['job_number'] = 'TRB-' . strtoupper(uniqid());

        Job::create($validated);

        return redirect()->route('jobs.index')->with('success', 'Trabajo registrado exitosamente.');
    }

    public function show(Job $job)
    {
        $job->load(['dentist', 'patient', 'job_type', 'user', 'collaborators', 'job_items', 'job_teeths']);
        return Inertia::render('Job/Show', [
            'item' => $job
        ]);
    }

    public function edit(Job $job)
    {
        return Inertia::render('Job/Edit', [
            'item' => $job,
            'dentists' => Dentist::orderBy('name')->get(['id', 'name', 'last_name']),
            'patients' => Patient::orderBy('name')->get(['id', 'name', 'last_name']),
            'jobTypes' => JobType::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'patient_id' => 'nullable|exists:patients,id',
            'job_type_id' => 'nullable|exists:job_types,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status' => 'required|string|max:50',
            'priority' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'clinical_notes' => 'nullable|string',
            'shade' => 'nullable|string|max:50',
            'received_at' => 'nullable|date',
            'due_date' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'subtotal' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $job->update($validated);

        return redirect()->route('jobs.index')->with('success', 'Trabajo actualizado exitosamente.');
    }

    public function destroy(Job $job)
    {
        $job->delete();
        return redirect()->route('jobs.index')->with('success', 'Trabajo eliminado exitosamente.');
    }
}
