<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobAttachment;
use App\Rules\ScanOrDocumentFile;
use App\Support\TenantStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JobAttachmentController extends Controller
{
    public function index(Request $request)
    {
        $job = Job::findOrFail($request->query('job_id'));

        return response()->json(
            $job->job_attachments()->latest('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            // 'exists:jobs,id' consulta la tabla directo, sin pasar por el
            // scope de Job (Eloquent) — no alcanza para confirmar que el
            // job es de la empresa activa. findOrFail() unas líneas abajo
            // sí lo hace.
            'job_id' => ['required', 'integer', 'exists:jobs,id'],
            'file' => ['required', 'file', 'max:51200', new ScanOrDocumentFile],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        Job::findOrFail($data['job_id']);

        $file = $request->file('file');
        $path = $file->store('job-attachments/'.$data['job_id'], 'public');

        $attachment = JobAttachment::create([
            'job_id' => $data['job_id'],
            'user_id' => auth()->id(),
            'filename' => $file->getClientOriginalName(),
            'url' => TenantStorageUrl::publicUrl($path),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'note' => $data['note'] ?? null,
        ]);

        return response()->json($attachment);
    }

    public function destroy(JobAttachment $jobAttachment): JsonResponse
    {
        // JobAttachment no tiene company_id propio (cuelga de Job) — el
        // route-model-binding no lo filtra solo, hay que confirmar el
        // padre a mano.
        Job::findOrFail($jobAttachment->job_id);

        Storage::disk('public')->delete(TenantStorageUrl::relativePath($jobAttachment->url));
        $jobAttachment->delete();

        return response()->json(['success' => true]);
    }
}
