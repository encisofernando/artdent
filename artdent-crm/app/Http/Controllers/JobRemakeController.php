<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobRemake;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobRemakeController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $query = JobRemake::with([
            'job:id,job_number,dentist_id',
            'job.dentist:id,name',
            'original_job:id,job_number',
            'reported_by_user:id,name',
        ])->whereHas('job', fn ($q) => $q->where('company_id', $companyId));

        if ($request->filled('responsibility')) {
            $query->where('responsibility', $request->responsibility);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('reason_category', 'like', "%{$search}%");
            });
        }

        $items = $query->latest('created_at')->paginate(20)->withQueryString();

        return Inertia::render('JobRemake/Index', [
            'items' => $items,
            'filters' => $request->only(['responsibility', 'search']),
        ]);
    }

    public function create(Request $request): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $jobs = Job::where('company_id', $companyId)
            ->with('dentist:id,name')
            ->orderByDesc('id')
            ->get(['id', 'job_number', 'dentist_id']);

        $prefillJobId = $request->query('job_id');

        return Inertia::render('JobRemake/Create', [
            'jobs' => $jobs,
            'prefillJobId' => $prefillJobId ? (int) $prefillJobId : null,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'original_job_id' => 'required|exists:jobs,id|different:job_id',
            'responsibility' => 'required|in:lab,dentist,patient,material,unknown',
            'reason_category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'material_cost' => 'nullable|numeric|min:0',
            'labor_cost' => 'nullable|numeric|min:0',
            'charged_to' => 'required|in:lab,dentist,insurance',
        ]);

        // Ensure both jobs belong to the authenticated company
        $jobIds = [$validated['job_id'], $validated['original_job_id']];
        $count = Job::where('company_id', $companyId)->whereIn('id', $jobIds)->count();
        if ($count < 2) {
            abort(403);
        }

        JobRemake::create(array_merge($validated, [
            'reported_by' => auth()->id(),
        ]));

        return redirect()->route('job-remakes.index')
            ->with('success', 'Rehacimiento registrado exitosamente.');
    }

    public function show(JobRemake $jobRemake): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        // Job tiene BelongsToCompany: si el rehacimiento apunta a un job de
        // otra empresa, la relación devuelve null en vez de la fila ajena.
        // ?-> evita un 500 (null->company_id) donde debería ser 403.
        if ($jobRemake->job?->company_id !== $companyId) {
            abort(403);
        }

        $jobRemake->load([
            'job:id,job_number,dentist_id',
            'job.dentist:id,name',
            'original_job:id,job_number',
            'reported_by_user:id,name',
        ]);

        return Inertia::render('JobRemake/Show', [
            'item' => $jobRemake,
        ]);
    }

    public function destroy(JobRemake $jobRemake): \Illuminate\Http\RedirectResponse
    {
        $companyId = auth()->user()->company_id;

        // Ver comentario en show(): job->company_id puede ser null (Job
        // tiene BelongsToCompany) para un rehacimiento cross-empresa.
        if ($jobRemake->job?->company_id !== $companyId) {
            abort(403);
        }

        $jobRemake->delete();

        return redirect()->route('job-remakes.index')
            ->with('success', 'Rehacimiento eliminado.');
    }
}
