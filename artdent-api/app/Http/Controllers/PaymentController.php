<?php

namespace App\Http\Controllers;

use App\Models\JobPayment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * PaymentController — Pagos de trabajos del laboratorio
 * Tabla: job_payments
 * Ruta:  /api/lab-payments
 */
class PaymentController extends Controller
{
    /**
     * GET /api/lab-payments
     * Params: company_id, job_id, clinic_id, search, date_from, date_to, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobPayment::with(['job.clinic', 'job.patient'])
            ->when($request->company_id, fn($q) => $q->where('job_payments.company_id', $request->company_id))
            ->when($request->job_id,     fn($q) => $q->where('job_id', $request->job_id))
            ->when($request->date_from,  fn($q) => $q->where('payment_date', '>=', $request->date_from))
            ->when($request->date_to,    fn($q) => $q->where('payment_date', '<=', $request->date_to))
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('reference', 'like', $term)
                      ->orWhere('notes',   'like', $term)
                      ->orWhereHas('job',  fn($q) => $q->where('ticket_number', 'like', $term));
                });
            })
            // Filtro por clinic_id a través de la relación job
            ->when($request->clinic_id, fn($q) =>
                $q->whereHas('job', fn($q) => $q->where('clinic_id', $request->clinic_id))
            )
            ->orderByDesc('payment_date')
            ->orderByDesc('id');

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 25)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/lab-payments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'job_id'         => 'nullable|exists:jobs,id',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,transfer,check,other',
            'payment_date'   => 'required|date',
            'reference'      => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->user()?->id;

        $payment = JobPayment::create($validated);

        return response()->json($payment->load('job.clinic'), 201);
    }

    /**
     * GET /api/lab-payments/{labPayment}
     */
    public function show(JobPayment $labPayment): JsonResponse
    {
        return response()->json($labPayment->load('job.clinic', 'job.patient', 'createdBy'));
    }

    /**
     * PUT /api/lab-payments/{labPayment}
     */
    public function update(Request $request, JobPayment $labPayment): JsonResponse
    {
        $validated = $request->validate([
            'job_id'         => 'nullable|exists:jobs,id',
            'amount'         => 'sometimes|numeric|min:0.01',
            'payment_method' => 'sometimes|in:cash,card,transfer,check,other',
            'payment_date'   => 'sometimes|date',
            'reference'      => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $labPayment->update($validated);

        return response()->json($labPayment->load('job.clinic'));
    }

    /**
     * DELETE /api/lab-payments/{labPayment}
     */
    public function destroy(JobPayment $labPayment): JsonResponse
    {
        $labPayment->delete();

        return response()->json(null, 204);
    }
}
