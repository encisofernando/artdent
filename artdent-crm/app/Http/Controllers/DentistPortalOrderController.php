<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesCurrentDentist;
use App\Models\CrmNotification;
use App\Models\JobRequest;
use App\Models\JobRequestAttachment;
use App\Support\TenantStorageUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DentistPortalOrderController extends Controller
{
    use ResolvesCurrentDentist;

    public function create(): Response
    {
        return Inertia::render('DentistPortal/NewOrder');
    }

    public function store(Request $request): RedirectResponse
    {
        $dentist = $this->currentDentist($request);

        $data = $request->validate([
            'patient_name' => ['nullable', 'string', 'max:255'],
            'job_type_label' => ['nullable', 'string', 'max:255'],
            'due_date_requested' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'files' => ['nullable', 'array', 'max:10'],
            'files.*' => ['file', 'max:51200', 'extensions:stl,ply,jpg,jpeg,png,webp,pdf'],
        ]);

        $jobRequest = JobRequest::create([
            'company_id' => $dentist->company_id,
            'dentist_id' => $dentist->id,
            'patient_name' => $data['patient_name'] ?? null,
            'job_type_label' => $data['job_type_label'] ?? null,
            'due_date_requested' => $data['due_date_requested'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => JobRequest::STATUS_PENDING,
        ]);

        foreach ($request->file('files', []) as $file) {
            $path = $file->store('job-requests/'.$jobRequest->id, 'public');

            JobRequestAttachment::create([
                'job_request_id' => $jobRequest->id,
                'filename' => $file->getClientOriginalName(),
                'url' => TenantStorageUrl::publicUrl($path),
                'mime_type' => $file->getClientMimeType(),
                'size_bytes' => $file->getSize(),
            ]);
        }

        CrmNotification::create([
            'type' => 'portal_new_order',
            'title' => 'Nueva solicitud de trabajo',
            'body' => "{$dentist->name} envió una nueva solicitud".($jobRequest->patient_name ? " para {$jobRequest->patient_name}" : '').'.',
            'url' => '/job-requests',
            'order_code' => 'job_request_'.$jobRequest->id,
        ]);

        return redirect()->route('dentist-portal.show')->with('success', 'Enviamos tu solicitud al laboratorio. Te va a contactar cuando la revise.');
    }
}
