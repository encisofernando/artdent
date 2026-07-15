<?php

namespace App\Http\Controllers;

use App\Models\Dentist;
use App\Models\Job;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryNoteController extends Controller
{
    public function create(Request $request): Response
    {
        $companyId = auth()->user()->company_id;

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $jobs = [];
        if ($request->filled('dentist_id')) {
            $jobs = Job::where('company_id', $companyId)
                ->where('dentist_id', $request->integer('dentist_id'))
                ->where('status', 'ready')
                ->with(['patient:id,name', 'job_type:id,name'])
                ->orderBy('due_date')
                ->get(['id', 'job_number', 'patient_id', 'job_type_id', 'description', 'shade', 'due_date']);
        }

        return Inertia::render('Laboratory/DeliveryNote', [
            'dentists' => $dentists,
            'selectedDentistId' => $request->integer('dentist_id') ?: null,
            'jobs' => $jobs,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'dentist_id' => ['required', 'integer', 'exists:dentists,id'],
            'job_ids' => ['required', 'array', 'min:1'],
            'job_ids.*' => ['integer'],
        ]);

        $dentist = Dentist::where('company_id', $companyId)->findOrFail($validated['dentist_id']);

        $jobs = Job::where('company_id', $companyId)
            ->where('dentist_id', $dentist->id)
            ->where('status', 'ready')
            ->whereIn('id', $validated['job_ids'])
            ->get();

        if ($jobs->isEmpty()) {
            return response()->json(['message' => 'Ninguna de las órdenes seleccionadas está lista para entregar.'], 422);
        }

        $jobs->each(fn (Job $job) => $job->update(['status' => 'delivered', 'delivered_at' => now()]));

        return response()->json([
            'pdf_url' => route('remitos.pdf', [
                'dentist_id' => $dentist->id,
                'job_ids' => $jobs->pluck('id')->all(),
            ]),
        ]);
    }

    public function pdf(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'dentist_id' => ['required', 'integer', 'exists:dentists,id'],
            'job_ids' => ['required', 'array', 'min:1'],
            'job_ids.*' => ['integer'],
        ]);

        $dentist = Dentist::where('company_id', $companyId)->findOrFail($validated['dentist_id']);
        $company = $dentist->company;

        $jobs = Job::where('company_id', $companyId)
            ->where('dentist_id', $dentist->id)
            ->whereIn('id', $validated['job_ids'])
            ->with(['patient:id,name', 'job_type:id,name'])
            ->orderBy('due_date')
            ->get();

        abort_if($jobs->isEmpty(), 404);

        $pdf = Pdf::loadView('pdf.delivery_note', [
            'company' => $company,
            'dentist' => $dentist,
            'jobs' => $jobs,
            'remitoNumero' => str_pad((string) $jobs->max('id'), 8, '0', STR_PAD_LEFT),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('remito-'.$dentist->id.'-'.now()->format('Ymd-His').'.pdf');
    }
}
