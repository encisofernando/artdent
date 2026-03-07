<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobItem;
use App\Models\Dentist;
use App\Models\Patient;
use App\Models\JobType;
use App\Models\Tariff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $companyId = auth()->user()->company_id ?? 1;

        $query = Job::with(['dentist', 'patient', 'jobType'])
            ->where('company_id', $companyId)
            ->whereNull('deleted_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('job_number', 'like', "%{$search}%")
                  ->orWhereHas('dentist', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('patient', fn($q) => $q->where('name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%"));
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('received_at')->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('Job/Index', [
            'items'   => $items,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function create()
    {
        $companyId = auth()->user()->company_id ?? 1;

        return Inertia::render('Job/Create', [
            'dentists' => Dentist::where('company_id', $companyId)->orderBy('name')->get(['id', 'name', 'contact_name']),
            'patients' => Patient::whereHas('dentist', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })->orderBy('name')->get(['id', 'name', 'dentist_id']),
            'jobTypes' => JobType::where('company_id', $companyId)->orderBy('name')->get(['id', 'name', 'color']),
            'users' => User::where('company_id', $companyId)->orderBy('name')->get(['id', 'name']),
            'tariffs' => \App\Models\Tariff::where('company_id', $companyId)->where('is_active', true)->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dentist_id'       => 'required|integer|exists:dentists,id',
            'patient_name'     => 'nullable|string|max:191',
            'job_type_id'      => 'nullable|integer|exists:job_types,id',
            'assigned_user_id' => 'nullable|integer|exists:users,id',
            'status'           => 'nullable|string',
            'priority'         => 'nullable|string',
            'description'      => 'nullable|string',
            'clinical_notes'   => 'nullable|string',
            'shade'            => 'nullable|string|max:30',
            'received_at'      => 'nullable|date',
            'due_date'         => 'nullable|date',
            'discount_amount'  => 'nullable|numeric|min:0',
            'items'            => 'nullable|array',
            'items.*.tariff_id'  => 'nullable|integer|exists:tariffs,id',
            'items.*.description'=> 'required_with:items|string|max:255',
            'items.*.quantity'   => 'required_with:items|numeric|min:0',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        $companyId = auth()->user()->company_id ?? 1;

        // ── Número de orden: TRB-0001, TRB-0002, ... TRB-1031 ────────────────
        $lastJob = Job::where('company_id', $companyId)->orderBy('id', 'desc')->first();
        $nextId = $lastJob ? $lastJob->id + 1 : 1;
        $jobNumber = 'TRB-' . (1000 + $nextId);

        // Calcular totales
        $items          = $request->items ?? [];
        $subtotal       = collect($items)->sum(fn($i) => (float)$i['quantity'] * (float)$i['unit_price']);
        $discountAmount = (float)($request->discount_amount ?? 0);
        $total          = max(0, $subtotal - $discountAmount);

        // Resolver patient_id a partir del nombre (si se pasó uno existente)
        $patientId = null;
        if ($request->patient_name) {
            $dentistId = $request->dentist_id;
            $patient = Patient::where('company_id', $companyId)
                ->where('dentist_id', $dentistId)
                ->where(function ($q) use ($request) {
                    $q->whereRaw("CONCAT(name, ' ', COALESCE(last_name,'')) LIKE ?", ['%' . trim($request->patient_name) . '%'])
                      ->orWhere('name', 'like', '%' . $request->patient_name . '%');
                })
                ->first();
            $patientId = $patient?->id;
        }

        DB::beginTransaction();
        try {
            $job = Job::create([
                'company_id'       => $companyId,
                'dentist_id'       => $request->dentist_id,
                'patient_id'       => $patientId,
                'job_type_id'      => $request->job_type_id ?: null,
                'assigned_user_id' => $request->assigned_user_id ?: null,
                'job_number'       => $jobNumber,
                'status'           => $request->status     ?? 'received',
                'priority'         => $request->priority   ?? 'normal',
                'description'      => $request->description,
                'clinical_notes'   => $request->clinical_notes,
                'shade'            => $request->shade,
                'received_at'      => $request->received_at ?? now()->toDateString(),
                'due_date'         => $request->due_date,
                'subtotal'         => $subtotal,
                'discount_amount'  => $discountAmount,
                'total'            => $total,
            ]);

            foreach ($items as $item) {
                $lineTotal = (float)$item['quantity'] * (float)$item['unit_price'];
                JobItem::create([
                    'job_id'      => $job->id,
                    'tariff_id'   => $item['tariff_id'] ?: null,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'discount'    => 0,
                    'total'       => $lineTotal,
                ]);
            }

            DB::commit();

            return redirect()
                ->route('jobs.show', $job->id)
                ->with('success', "Orden {$jobNumber} registrada correctamente.");

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('JobController@store: ' . $e->getMessage());
            throw $e;
        }
    }

    public function show(Job $job)
    {
        $job->load([
            'dentist',
            'patient',
            'jobType',
            'user',         // técnico — relation via assigned_user_id
            'items',        // job_items table
        ]);

        return Inertia::render('Job/Show', [
            'item' => array_merge($job->toArray(), [
                // Renombrar para consistencia con el frontend
                'job_type'  => $job->jobType,
                'job_items' => $job->items,
                'user'      => $job->user,
            ]),
        ]);
    }

    public function ticket(Job $job)
    {
        if ($job->company_id !== (auth()->user()->company_id ?? 1)) {
            abort(403);
        }
        $job->load(['dentist', 'patient', 'jobType', 'user', 'items']);
        return Inertia::render('Job/Ticket', [
            'item' => array_merge($job->toArray(), [
                'job_type'  => $job->jobType,
                'job_items' => $job->items,
                'user'      => $job->user,
            ]),
        ]);
    }

    public function edit(Job $job)
    {
        $companyId = auth()->user()->company_id ?? 1;

        $job->load(['dentist', 'patient', 'jobType', 'items']);

        return Inertia::render('Job/Edit', [
            'item'     => array_merge($job->toArray(), [
                'job_items' => $job->items,
            ]),
            'dentists' => Dentist::where('company_id', $companyId)->orderBy('name')->get(['id', 'name', 'type', 'address', 'cuit']),
            'patients' => Patient::orderBy('name')->get(['id', 'name']),
            'jobTypes' => JobType::where('company_id', $companyId)->orderBy('name')->get(['id', 'name']),
            'users'    => User::where('company_id', $companyId)->where('is_active', 1)->orderBy('name')->get(['id', 'name']),
            'tariffs'  => Tariff::where('company_id', $companyId)->where('is_active', 1)->orderBy('name')->get(['id', 'name', 'price']),
        ]);
    }

    public function update(Request $request, Job $job)
    {
        $request->validate([
            'dentist_id'       => 'required|integer|exists:dentists,id',
            'patient_name'     => 'nullable|string|max:191',
            'job_type_id'      => 'nullable|integer|exists:job_types,id',
            'assigned_user_id' => 'nullable|integer|exists:users,id',
            'status'           => 'nullable|string',
            'priority'         => 'nullable|string',
            'description'      => 'nullable|string',
            'clinical_notes'   => 'nullable|string',
            'shade'            => 'nullable|string|max:30',
            'received_at'      => 'nullable|date',
            'due_date'         => 'nullable|date',
            'discount_amount'  => 'nullable|numeric|min:0',
            'items'            => 'nullable|array',
            'items.*.description'=> 'required_with:items|string',
            'items.*.quantity'   => 'required_with:items|numeric|min:0',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        $items          = $request->items ?? [];
        $subtotal       = collect($items)->sum(fn($i) => (float)$i['quantity'] * (float)$i['unit_price']);
        $discountAmount = (float)($request->discount_amount ?? 0);
        $total          = max(0, $subtotal - $discountAmount);

        DB::beginTransaction();
        try {
            $job->update([
                'dentist_id'       => $request->dentist_id,
                'job_type_id'      => $request->job_type_id ?: null,
                'assigned_user_id' => $request->assigned_user_id ?: null,
                'status'           => $request->status   ?? $job->status,
                'priority'         => $request->priority ?? $job->priority,
                'description'      => $request->description,
                'clinical_notes'   => $request->clinical_notes,
                'shade'            => $request->shade,
                'received_at'      => $request->received_at ?? $job->received_at,
                'due_date'         => $request->due_date,
                'subtotal'         => $subtotal,
                'discount_amount'  => $discountAmount,
                'total'            => $total,
            ]);

            // Reemplazar ítems si se envían
            if (!empty($items)) {
                $job->items()->delete();
                foreach ($items as $item) {
                    $lineTotal = (float)$item['quantity'] * (float)$item['unit_price'];
                    JobItem::create([
                        'job_id'      => $job->id,
                        'tariff_id'   => $item['tariff_id'] ?: null,
                        'description' => $item['description'],
                        'quantity'    => $item['quantity'],
                        'unit_price'  => $item['unit_price'],
                        'discount'    => 0,
                        'total'       => $lineTotal,
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('jobs.show', $job->id)
                ->with('success', "Orden {$job->job_number} actualizada.");

        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function destroy(Job $job)
    {
        $job->delete();

        return redirect()
            ->route('jobs.index')
            ->with('success', "Orden {$job->job_number} eliminada.");
    }

    /**
     * Charge the lab account if the job is delivered and hasn't been billed yet.
     */
    protected function chargeAccountIfNeeded(Job $job)
    {
        // Solo cargamos a la cuenta si está entregado (delivered) o listo (ready) y no ha sido cobrado (billed)
        if ($job->billed || $job->total <= 0) {
            return;
        }

        if (!in_array($job->status, ['delivered', 'ready'])) {
            return;
        }

        DB::transaction(function () use ($job) {
            $account = LabAccount::firstOrCreate(
                ['dentist_id' => $job->dentist_id],
                ['balance'    => 0]
            );

            $newBalance = $account->balance + $job->total;
            $account->update(['balance' => $newBalance]);

            LabAccountMove::create([
                'lab_account_id' => $account->id,
                'user_id'        => auth()->id() ?? 1,
                'type'           => 'debit', // Cargo a la cuenta (Aumenta la deuda del doctor/clínica)
                'amount'         => $job->total,
                'balance_after'  => $newBalance,
                'description'    => "Cargo por Trabajo Terminado / Entregado: {$job->job_number}",
                'reference_type' => Job::class,
                'reference_id'   => $job->id,
                'move_date'      => now()->toDateString(),
            ]);

            $job->update(['billed' => true]);
        });
    }
}