<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobAttachment;
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
            'job_id' => ['required', 'integer', 'exists:jobs,id'],
            'file' => ['required', 'file', 'max:51200', 'extensions:stl,ply,jpg,jpeg,png,webp,pdf'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

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
        Storage::disk('public')->delete(TenantStorageUrl::relativePath($jobAttachment->url));
        $jobAttachment->delete();

        return response()->json(['success' => true]);
    }
}
