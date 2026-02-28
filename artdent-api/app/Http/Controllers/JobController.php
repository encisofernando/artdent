<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobItem;
use App\Models\Movement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobController extends Controller
{
    /**
     * GET /api/jobs
     * Params: company_id, status, priority, clinic_id, patient_id, search, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Job::with([
                'clinic',
                'patient',
                'dentist',
                'items.tariff',
            ])
            ->when($request->company_id, fn($q) => $q->where('company_id', $request->company_id))
            ->when($request->status,     fn($q) => $q->where('status', $request->status))
            ->when($request->priority,   fn($q) => $q->where('priority', $request->priority))
            ->when($request->clinic_id,  fn($q) => $q->where('clinic_id', $request->clinic_id))
            ->when($request->patient_id, fn($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('ticket_number', 'like', $term)
                      ->orWhere('notes', 'like', $term);
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
            'company_id'    => 'required|exists:companies,id',
            'clinic_id'     => 'nullable|exists:clinics,id',
            'dentist_id'    => 'nullable|exists:dentists,id',
            'patient_id'    => 'nullable|exists:patients,id',

            'entry_date'    => 'nullable|date',
            'promised_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',

            'work_type'     => 'nullable|in:ticket,budget',
            'status'        => 'nullable|in:pending,in_progress,completed,delivered,cancelled',
            'priority'      => 'nullable|in:low,normal,high,urgent',

            'discount'      => 'nullable|numeric|min:0',
            'tax'           => 'nullable|numeric|min:0',
            'specifications'=> 'nullable|string',
            'notes'         => 'nullable|string',
            'internal_notes'=> 'nullable|string',

            // Items
            'items'             => 'required|array|min:1',
            'items.*.tariff_id' => 'required|exists:tariffs,id',
            'items.*.name'      => 'nullable|string',
            'items.*.qty'       => 'required|numeric|min:1',
            'items.*.price'     => 'required|numeric|min:0',
            'items.*.pieces'    => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // ticket_number único
            $ticketNumber = $validated['ticket_number']
                ?? 'LAB-' . strtoupper(Str::random(8));

            $entryDate = $validated['entry_date'] ?? now()->toDateString();

            // Totales
            $subtotal = 0.0;
            foreach ($validated['items'] as $it) {
                $subtotal += (float)$it['qty'] * (float)$it['price'];
            }

            $discount = (float)($validated['discount'] ?? 0);
            $tax      = (float)($validated['tax'] ?? 0);
            $total    = max(0, $subtotal - $discount + $tax);

            $job = Job::create([
                'company_id'     => $validated['company_id'],
                'ticket_number'  => $ticketNumber,
                'clinic_id'      => $validated['clinic_id'] ?? null,
                'dentist_id'     => $validated['dentist_id'] ?? null,
                'patient_id'     => $validated['patient_id'] ?? null,

                'entry_date'     => $entryDate,
                'promised_date'  => $validated['promised_date'] ?? null,
                'delivery_date'  => $validated['delivery_date'] ?? null,

                'work_type'      => $validated['work_type'] ?? 'ticket',
                'status'         => $validated['status'] ?? 'pending',
                'priority'       => $validated['priority'] ?? 'normal',

                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'tax'            => $tax,
                'total'          => $total,

                'specifications' => $validated['specifications'] ?? null,
                'notes'          => $validated['notes'] ?? null,
                'internal_notes' => $validated['internal_notes'] ?? null,

                'created_by'     => auth()->user()?->id,
                'updated_by'     => auth()->user()?->id,
            ]);

            foreach ($validated['items'] as $it) {
                $lineTotal = (float)$it['qty'] * (float)$it['price'];

                JobItem::create([
                    'job_id'     => $job->id,
                    'tariff_id'  => $it['tariff_id'],
                    'name'       => $it['name'] ?? null,
                    'qty'        => $it['qty'],
                    'price'      => $it['price'],
                    'pieces'     => $it['pieces'] ?? null,
                    'line_total' => $lineTotal,
                ]);
            }

            // ✅ Crear movimiento de cuenta corriente (cargo) SOLO si hay cliente (clinic_id)
            if (!empty($job->clinic_id) && $job->total > 0) {
                Movement::create([
                    'company_id'  => $job->company_id,
                    'client_id'   => $job->clinic_id,   // debe existir para cuenta corriente
                    'date'        => $job->entry_date,
                    'type'        => 'charge',
                    'amount'      => $job->total,
                    'description' => 'Orden de trabajo ' . $job->ticket_number,
                    'reference'   => $job->ticket_number,
                    'job_id'      => $job->id,
                ]);
            }

            return response()->json(
                $job->load(['clinic', 'patient', 'dentist', 'items.tariff']),
                201
            );
        });
    }

    /**
     * GET /api/jobs/{job}
     */
    public function show(Job $job): JsonResponse
    {
        return response()->json(
            $job->load(['clinic', 'patient', 'dentist', 'items.tariff'])
        );
    }

    /**
     * PUT /api/jobs/{job}
     */
    public function update(Request $request, Job $job): JsonResponse
    {
        $validated = $request->validate([
            'clinic_id'     => 'nullable|exists:clinics,id',
            'dentist_id'    => 'nullable|exists:dentists,id',
            'patient_id'    => 'nullable|exists:patients,id',

            'entry_date'    => 'nullable|date',
            'promised_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',

            'work_type'     => 'nullable|in:ticket,budget',
            'status'        => 'nullable|in:pending,in_progress,completed,delivered,cancelled',
            'priority'      => 'nullable|in:low,normal,high,urgent',

            'discount'      => 'nullable|numeric|min:0',
            'tax'           => 'nullable|numeric|min:0',
            'specifications'=> 'nullable|string',
            'notes'         => 'nullable|string',
            'internal_notes'=> 'nullable|string',

            // si mandás items, reemplaza
            'items'             => 'nullable|array|min:1',
            'items.*.tariff_id' => 'required_with:items|exists:tariffs,id',
            'items.*.name'      => 'nullable|string',
            'items.*.qty'       => 'required_with:items|numeric|min:1',
            'items.*.price'     => 'required_with:items|numeric|min:0',
            'items.*.pieces'    => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $job) {
            // Guardar estado previo para detectar cambios en movimiento
            $prevClinicId = $job->clinic_id;
            $prevTotal    = (float)($job->total ?? 0);
            $prevDate     = $job->entry_date;

            // Campos simples
            if (array_key_exists('clinic_id', $validated))  $job->clinic_id = $validated['clinic_id'];
            if (array_key_exists('dentist_id', $validated)) $job->dentist_id = $validated['dentist_id'];
            if (array_key_exists('patient_id', $validated)) $job->patient_id = $validated['patient_id'];

            if (array_key_exists('entry_date', $validated))    $job->entry_date = $validated['entry_date'] ?? $job->entry_date;
            if (array_key_exists('promised_date', $validated)) $job->promised_date = $validated['promised_date'] ?? null;
            if (array_key_exists('delivery_date', $validated)) $job->delivery_date = $validated['delivery_date'] ?? null;

            if (array_key_exists('work_type', $validated)) $job->work_type = $validated['work_type'] ?? $job->work_type;
            if (array_key_exists('status', $validated))    $job->status = $validated['status'] ?? $job->status;
            if (array_key_exists('priority', $validated))  $job->priority = $validated['priority'] ?? $job->priority;

            if (array_key_exists('discount', $validated)) $job->discount = (float)($validated['discount'] ?? 0);
            if (array_key_exists('tax', $validated))      $job->tax = (float)($validated['tax'] ?? 0);

            if (array_key_exists('specifications', $validated)) $job->specifications = $validated['specifications'];
            if (array_key_exists('notes', $validated))          $job->notes = $validated['notes'];
            if (array_key_exists('internal_notes', $validated)) $job->internal_notes = $validated['internal_notes'];

            $job->updated_by = auth()->user()?->id;

            // Si llegan items => reemplazamos y recalculamos totales
            if (!empty($validated['items'])) {
                $job->items()->delete();

                $subtotal = 0.0;

                foreach ($validated['items'] as $it) {
                    $lineTotal = (float)$it['qty'] * (float)$it['price'];
                    $subtotal += $lineTotal;

                    JobItem::create([
                        'job_id'     => $job->id,
                        'tariff_id'  => $it['tariff_id'],
                        'name'       => $it['name'] ?? null,
                        'qty'        => $it['qty'],
                        'price'      => $it['price'],
                        'pieces'     => $it['pieces'] ?? null,
                        'line_total' => $lineTotal,
                    ]);
                }

                $discount = (float)($job->discount ?? 0);
                $tax      = (float)($job->tax ?? 0);
                $total    = max(0, $subtotal - $discount + $tax);

                $job->subtotal = $subtotal;
                $job->total    = $total;
            }

            $job->save();

            // ✅ Mantener Movement de "charge" sincronizado con la orden
            // Regla: 1 cargo por job (type=charge, job_id)
            $movement = Movement::where('job_id', $job->id)
                ->where('type', 'charge')
                ->first();

            $shouldHaveCharge = !empty($job->clinic_id) && (float)$job->total > 0;

            if ($shouldHaveCharge) {
                if (!$movement) {
                    Movement::create([
                        'company_id'  => $job->company_id,
                        'client_id'   => $job->clinic_id,
                        'date'        => $job->entry_date,
                        'type'        => 'charge',
                        'amount'      => $job->total,
                        'description' => 'Orden de trabajo ' . $job->ticket_number,
                        'reference'   => $job->ticket_number,
                        'job_id'      => $job->id,
                    ]);
                } else {
                    $movement->update([
                        'company_id'  => $job->company_id,
                        'client_id'   => $job->clinic_id,
                        'date'        => $job->entry_date,
                        'amount'      => $job->total,
                        'description' => 'Orden de trabajo ' . $job->ticket_number,
                        'reference'   => $job->ticket_number,
                    ]);
                }
            } else {
                // Si ya no corresponde cargo (sin clinic o total=0) => eliminar cargo si existe
                if ($movement) {
                    $movement->delete();
                }
            }

            return response()->json(
                $job->load(['clinic', 'patient', 'dentist', 'items.tariff'])
            );
        });
    }

    /**
     * DELETE /api/jobs/{job}
     */
    public function destroy(Job $job): JsonResponse
    {
        return DB::transaction(function () use ($job) {
            // eliminar movement asociado (cargo)
            $movement = Movement::where('job_id', $job->id)->where('type', 'charge')->first();
            if ($movement) {
                $movement->delete();
            }

            $job->delete();

            return response()->json(null, 204);
        });
    }
}
