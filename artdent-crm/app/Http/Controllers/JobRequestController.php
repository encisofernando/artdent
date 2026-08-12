<?php

namespace App\Http\Controllers;

use App\Models\JobRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobRequestController extends Controller
{
    public function index(): Response
    {
        $companyId = auth()->user()->company_id;

        $requests = JobRequest::where('company_id', $companyId)
            ->where('status', JobRequest::STATUS_PENDING)
            ->with(['dentist:id,name', 'attachments'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (JobRequest $r) => [
                'id' => $r->id,
                'dentist' => $r->dentist?->name,
                'patient_name' => $r->patient_name,
                'job_type_label' => $r->job_type_label,
                'due_date_requested' => $r->due_date_requested?->format('d/m/Y'),
                'notes' => $r->notes,
                'created_at' => $r->created_at->format('d/m/Y H:i'),
                'attachments' => $r->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'filename' => $a->filename,
                    'url' => $a->url,
                ]),
            ]);

        return Inertia::render('JobRequest/Index', [
            'requests' => $requests,
        ]);
    }

    public function reject(Request $request, JobRequest $jobRequest): RedirectResponse
    {
        abort_unless($jobRequest->company_id === auth()->user()->company_id, 404);

        $jobRequest->update([
            'status' => JobRequest::STATUS_REJECTED,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Solicitud rechazada.');
    }
}
