<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\Dentist;
use App\Models\Job;
use App\Models\JobAttachment;
use App\Models\JobItem;
use App\Models\JobRequest;
use App\Models\JobTeeth;
use App\Models\JobType;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use App\Models\Patient;
use App\Models\Tariff;
use App\Services\JobPhaseService;
use App\Support\TenantStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobController extends Controller
{
    public function __construct(private readonly JobPhaseService $phaseService) {}

    public function index(Request $request)
    {
        $relations = ['dentist', 'patient'];

        if ($this->hasJobTypesTable()) {
            $relations[] = 'jobType';
        }

        $query = Job::with($relations);

        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('job_number', 'like', "%$search%")
                    ->orWhereHas('dentist', function ($d) use ($search) {
                        $d->where('name', 'like', "%$search%");
                    })
                    ->orWhereHas('patient', function ($p) use ($search) {
                        $p->where('name', 'like', "%$search%");
                    });
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $items = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Job/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(Request $request)
    {
        $jobRequest = null;

        if ($request->filled('job_request_id')) {
            $found = JobRequest::where('id', $request->integer('job_request_id'))
                ->where('status', JobRequest::STATUS_PENDING)
                ->first();

            if ($found) {
                $jobRequest = [
                    'id' => $found->id,
                    'dentist_id' => $found->dentist_id,
                    'patient_name' => $found->patient_name,
                    'job_type_label' => $found->job_type_label,
                    'due_date_requested' => $found->due_date_requested?->format('Y-m-d'),
                    'notes' => $found->notes,
                ];
            }
        }

        return Inertia::render('Job/Create', [
            'dentists' => Dentist::orderBy('name')->get(),
            'patients' => Patient::orderBy('name')->get(),
            'jobTypes' => $this->jobTypesForForm(),
            'collaborators' => Collaborator::where('is_active', true)->orderBy('name')->get(),
            'tariffs' => Tariff::orderBy('name')->get(),
            'jobRequest' => $jobRequest,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'patient_name' => 'nullable|string|max:255',
            'job_type_id' => $this->jobTypeValidationRule(),

            'assigned_user_id' => 'nullable|exists:collaborators,id',

            'status' => 'required|string',
            'priority' => 'required|string',

            'clinical_notes' => 'nullable|string',
            'shade' => 'nullable|string',

            'received_at' => 'required|date',
            'due_date' => 'required|date',

            'discount_amount' => 'nullable|numeric',

            'items' => 'required|array|min:1',
            'items.*.tariff_id' => 'required|exists:tariffs,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',

            'teeth' => 'nullable|array',
            'teeth.*.tooth' => 'required_with:teeth|string|max:10',
            'teeth.*.note' => 'nullable|string|max:191',

            'job_request_id' => 'nullable|exists:job_requests,id',
        ]);

        if (! $this->hasJobTypesTable()) {
            $data['job_type_id'] = null;
        }

        DB::transaction(function () use ($data) {

            $patient = null;

            if (! empty($data['patient_name'])) {

                $patient = Patient::firstOrCreate([
                    'name' => $data['patient_name'],
                    'dentist_id' => $data['dentist_id'],
                ]);
            }

            $subtotal = 0;

            foreach ($data['items'] as $item) {

                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $discount = $data['discount_amount'] ?? 0;

            $total = $subtotal - $discount;

            $companyId = (int) auth()->user()->company_id;
            $jobNumber = $this->generateJobNumber($companyId);

            $job = Job::create([
                'company_id' => $companyId,
                'job_number' => $jobNumber,
                'dentist_id' => $data['dentist_id'],
                'patient_id' => $patient?->id,
                'job_type_id' => $data['job_type_id'] ?? null,
                'assigned_user_id' => $data['assigned_user_id'] ?? null,
                'received_by_user_id' => auth()->id(),
                'status' => $data['status'],
                'priority' => $data['priority'],
                'clinical_notes' => $data['clinical_notes'] ?? null,
                'shade' => $data['shade'] ?? null,
                'received_at' => $data['received_at'],
                'due_date' => $data['due_date'],
                'discount_amount' => $discount,
                'subtotal' => $subtotal,
                'total' => $total,
            ]);

            foreach ($data['items'] as $item) {

                JobItem::create([
                    'job_id' => $job->id,
                    'tariff_id' => $item['tariff_id'],
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            foreach ($data['teeth'] ?? [] as $tooth) {
                JobTeeth::create([
                    'job_id' => $job->id,
                    'tooth' => $tooth['tooth'],
                    'note' => $tooth['note'] ?? null,
                ]);
            }

            // Inicializar fases sin colaborador si el arancel principal las tiene configuradas
            $this->initializePhasesForJob($job);

            $this->chargeAccountIfNeeded($job);

            // El formulario permite crear el trabajo con cualquier estado,
            // incluido "entregado" directamente — mismo caso que en update().
            if ($data['status'] === 'delivered') {
                $this->phaseService->billOutstandingForManualDelivery($job);
            }

            if (! empty($data['job_request_id'])) {
                $this->linkJobRequest($job, (int) $data['job_request_id']);
            }
        });

        return redirect()
            ->route('jobs.index')
            ->with('success', 'Trabajo registrado correctamente');
    }

    /**
     * Vincula un Job recién creado a la solicitud del portal que lo originó:
     * copia los adjuntos ya subidos por el odontólogo a job_attachments (el
     * Job real, no la solicitud) y marca la solicitud como aprobada.
     */
    protected function linkJobRequest(Job $job, int $jobRequestId): void
    {
        $jobRequest = JobRequest::with('attachments')->find($jobRequestId);

        if (! $jobRequest || $jobRequest->company_id !== $job->company_id) {
            return;
        }

        foreach ($jobRequest->attachments as $attachment) {
            $sourcePath = TenantStorageUrl::relativePath($attachment->url);
            $destPath = 'job-attachments/'.$job->id.'/'.basename($sourcePath);

            if (Storage::disk('public')->exists($sourcePath)) {
                Storage::disk('public')->copy($sourcePath, $destPath);
            }

            JobAttachment::create([
                'job_id' => $job->id,
                'user_id' => null,
                'filename' => $attachment->filename,
                'url' => TenantStorageUrl::publicUrl($destPath),
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
                'note' => 'Subido por el odontólogo con la solicitud original.',
            ]);
        }

        $jobRequest->update([
            'status' => JobRequest::STATUS_APPROVED,
            'job_id' => $job->id,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);
    }

    protected function generateJobNumber(int $companyId): string
    {
        $latestJobNumber = Job::withTrashed()
            ->where('company_id', $companyId)
            ->where('job_number', 'like', 'ORD-%')
            ->lockForUpdate()
            ->orderByRaw('CAST(SUBSTRING(job_number, 5) AS UNSIGNED) DESC')
            ->value('job_number');

        $nextSeq = $latestJobNumber
            ? ((int) substr($latestJobNumber, 4)) + 1
            : 1;

        return 'ORD-'.str_pad($nextSeq, 5, '0', STR_PAD_LEFT);
    }

    protected function initializePhasesForJob(Job $job): void
    {
        $primaryTariffId = $job->job_items()->whereNotNull('tariff_id')->value('tariff_id');

        if (! $primaryTariffId) {
            return;
        }

        $phases = \App\Models\TariffPhase::where('tariff_id', $primaryTariffId)
            ->orderBy('sort_order')
            ->get();

        if ($phases->isEmpty()) {
            return;
        }

        foreach ($phases as $tariffPhase) {
            \App\Models\JobPhaseProgress::create([
                'job_id' => $job->id,
                'tariff_phase_id' => $tariffPhase->id,
                'collaborator_id' => null,
                'status' => \App\Models\JobPhaseProgress::STATUS_PENDING,
            ]);
        }

        // A diferencia de JobPhaseService::initializePhases() (usada por el
        // kiosco), este método no sacaba a la orden de "received" al crear
        // las fases — una orden podía terminar con una fase "completed" y
        // ya facturada mientras seguía figurando como "Pendiente" en el
        // estado. Alinear con el mismo comportamiento acá.
        if ($job->status === 'received') {
            $job->update(['status' => 'in_progress']);
        }
    }

    protected function chargeAccountIfNeeded(Job $job)
    {
        if ($job->total <= 0) {
            return;
        }

        // Los trabajos con fases (Rodete → Enfilado → Producto terminado, etc.)
        // se cobran progresivamente a medida que se completa cada fase — ver
        // JobPhaseService::billPhaseIfNeeded(), que ya ajusta la última fase
        // para que la suma cierre exacto con job.total. Si acá también se
        // cargara el total completo al recibir la orden, quedaría cobrado dos
        // veces (una vez entero al recibir + de nuevo por cada fase). Sólo
        // cobrar de una acá los trabajos sin fases configuradas.
        if ($job->phaseProgress()->exists()) {
            return;
        }

        $alreadyCharged = LabAccountMove::where('reference_type', Job::class)
            ->where('reference_id', $job->id)
            ->where('type', LabAccountMove::TYPE_CHARGE)
            ->exists();

        if ($alreadyCharged) {
            return;
        }

        $account = LabAccount::firstOrCreate(
            ['dentist_id' => $job->dentist_id],
            ['balance' => 0]
        );

        $account->balance += $job->total;
        $account->save();

        LabAccountMove::create([
            'lab_account_id' => $account->id,
            'user_id' => auth()->id(),
            'type' => LabAccountMove::TYPE_CHARGE,
            'amount' => $job->total,
            'balance_after' => $account->balance,
            'description' => 'Cargo por orden '.$job->job_number,
            'reference_type' => Job::class,
            'reference_id' => $job->id,
            'move_date' => now(),
        ]);
    }

    public function show(Job $job)
    {
        $relations = ['company', 'dentist', 'patient', 'job_items.tariff.phases', 'job_teeths', 'collaborators',
            'phaseProgress.tariffPhase', 'phaseProgress.collaborator', 'phaseProgress.ticket',
            'phaseProgress.phaseCollaborators.collaborator', 'receivedBy.employee', 'job_attachments'];

        if ($this->hasJobTypesTable()) {
            $relations[] = 'job_type';
        }

        $job->load($relations);

        return Inertia::render('Job/Show', [
            'item' => $job,
        ]);
    }

    public function edit(Job $job)
    {
        $relations = ['dentist', 'patient', 'job_items', 'job_teeths'];

        if ($this->hasJobTypesTable()) {
            $relations[] = 'job_type';
        }

        $job->load($relations);

        return Inertia::render('Job/Edit', [
            'item' => $job,
            'dentists' => Dentist::orderBy('name')->get(),
            'patients' => Patient::orderBy('name')->get(),
            'jobTypes' => $this->jobTypesForForm(),
            'collaborators' => Collaborator::where('is_active', true)->orderBy('name')->get(),
            'tariffs' => Tariff::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Job $job)
    {
        $data = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'patient_name' => 'nullable|string|max:255',
            'job_type_id' => $this->jobTypeValidationRule(),
            'assigned_user_id' => 'nullable|exists:collaborators,id',
            'status' => 'required|string',
            'priority' => 'required|string',
            'clinical_notes' => 'nullable|string',
            'shade' => 'nullable|string',
            'received_at' => 'required|date',
            'due_date' => 'required|date',
            'delivered_at' => 'nullable|date',
            'discount_amount' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.tariff_id' => 'required|exists:tariffs,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'teeth' => 'nullable|array',
            'teeth.*.tooth' => 'required_with:teeth|string|max:10',
            'teeth.*.note' => 'nullable|string|max:191',
        ]);

        if (! $this->hasJobTypesTable()) {
            $data['job_type_id'] = null;
        }

        DB::transaction(function () use ($data, $job) {

            $patient = null;

            if (! empty($data['patient_name'])) {
                $patient = Patient::firstOrCreate([
                    'name' => $data['patient_name'],
                    'dentist_id' => $data['dentist_id'],
                ]);
            }

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $discount = $data['discount_amount'] ?? 0;
            $newTotal = $subtotal - $discount;
            $oldTotal = (float) $job->total;

            $job->update([
                'dentist_id' => $data['dentist_id'],
                'patient_id' => $patient?->id,
                'job_type_id' => $data['job_type_id'] ?? null,
                'assigned_user_id' => $data['assigned_user_id'] ?? null,
                'status' => $data['status'],
                'priority' => $data['priority'],
                'clinical_notes' => $data['clinical_notes'] ?? null,
                'shade' => $data['shade'] ?? null,
                'received_at' => $data['received_at'],
                'due_date' => $data['due_date'],
                'delivered_at' => $data['delivered_at'] ?? null,
                'discount_amount' => $discount,
                'subtotal' => $subtotal,
                'total' => $newTotal,
                'notes' => $data['notes'] ?? null,
            ]);

            $job->job_items()->delete();

            foreach ($data['items'] as $item) {
                JobItem::create([
                    'job_id' => $job->id,
                    'tariff_id' => $item['tariff_id'],
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            $job->job_teeths()->delete();

            foreach ($data['teeth'] ?? [] as $tooth) {
                JobTeeth::create([
                    'job_id' => $job->id,
                    'tooth' => $tooth['tooth'],
                    'note' => $tooth['note'] ?? null,
                ]);
            }

            $this->adjustAccountCharge($job, $oldTotal, $newTotal);

            // Esta pantalla permite fijar el estado libremente, sin pasar por
            // el Kiosk — si se guarda como "entregado" y el trabajo tiene
            // fases, hay que asegurar que quedó facturado igual que si
            // hubiera pasado por completePhase()/registerDelivery() ahí. Sin
            // esto, un trabajo con fases nunca tocadas en el Kiosk puede
            // quedar "entregado" sin haber generado un peso de deuda.
            if ($data['status'] === 'delivered') {
                $this->phaseService->billOutstandingForManualDelivery($job);
            }
        });

        return redirect()
            ->route('jobs.show', $job)
            ->with('success', 'Trabajo actualizado correctamente.');
    }

    public function ticket(Job $job)
    {
        $relations = ['dentist', 'patient', 'job_items', 'company'];

        if ($this->hasJobTypesTable()) {
            $relations[] = 'job_type';
        }

        $job->load($relations);

        return Inertia::render('Job/Ticket', [
            'item' => $job,
        ]);
    }

    private function hasJobTypesTable(): bool
    {
        return Schema::hasTable('job_types');
    }

    private function jobTypesForForm()
    {
        if (! $this->hasJobTypesTable()) {
            return collect();
        }

        return JobType::orderBy('name')->get();
    }

    private function jobTypeValidationRule(): string
    {
        return $this->hasJobTypesTable()
            ? 'nullable|exists:job_types,id'
            : 'nullable';
    }

    protected function adjustAccountCharge(Job $job, float $oldTotal, float $newTotal): void
    {
        if ($oldTotal == $newTotal) {
            return;
        }

        // Igual que en chargeAccountIfNeeded(): los trabajos con fases se
        // cobran progresivamente por JobPhaseService::billPhaseIfNeeded(),
        // que ya recalcula contra el job.total actual en la última fase — acá
        // no hay ningún cargo Job::class que ajustar (nunca se creó uno para
        // trabajos con fases) y crear uno nuevo duplicaría el cobro.
        if ($job->phaseProgress()->exists()) {
            return;
        }

        $move = LabAccountMove::where('reference_type', Job::class)
            ->where('reference_id', $job->id)
            ->where('type', LabAccountMove::TYPE_CHARGE)
            ->first();

        $account = LabAccount::firstOrCreate(
            ['dentist_id' => $job->dentist_id],
            ['balance' => 0]
        );

        if ($move) {
            $account->balance = $account->balance - $move->amount + $newTotal;
            $account->save();

            $move->update([
                'amount' => $newTotal,
                'balance_after' => $account->balance,
            ]);
        } elseif ($newTotal > 0) {
            $account->balance += $newTotal;
            $account->save();

            LabAccountMove::create([
                'lab_account_id' => $account->id,
                'user_id' => auth()->id(),
                'type' => LabAccountMove::TYPE_CHARGE,
                'amount' => $newTotal,
                'balance_after' => $account->balance,
                'description' => 'Cargo por orden '.$job->job_number,
                'reference_type' => Job::class,
                'reference_id' => $job->id,
                'move_date' => now(),
            ]);
        }
    }

    public function destroy(Job $job)
    {
        DB::transaction(function () use ($job) {

            $move = LabAccountMove::where('reference_type', Job::class)
                ->where('reference_id', $job->id)
                ->where('type', LabAccountMove::TYPE_CHARGE)
                ->first();

            if ($move) {

                $account = $move->account;

                $account->balance -= $move->amount;
                $account->save();

                $move->delete();
            }

            $job->delete();
        });

        return back()->with('success', 'Trabajo eliminado');
    }
}
