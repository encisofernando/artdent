<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Dentist;
use App\Models\Patient;
use App\Models\Job;
use App\Models\JobType;
use App\Models\JobStatusHistory;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use App\Models\Tariff;
use App\Models\PaymentMethod;
use App\Models\Collaborator;
use App\Models\Tenant;
use App\Http\Controllers\JobController;
use App\Http\Controllers\LabAccountMoveController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerifyFlowCommand extends Command
{
    protected $signature = 'verify:flow';
    protected $description = 'Verifica el flujo de creacion de jobs, deudas, estados y pagos';

    public function handle()
    {
        $this->info("--- Iniciando verificación de flujo del CRM (Job + Finanzas) ---");

        $tenant = Tenant::first();
        if (!$tenant) {
            $this->error("Error: No hay tenants configurados.");
            return;
        }
        tenancy()->initialize($tenant);

        $user = User::first();
        if (!$user) {
            $this->error("Error: No hay usuarios en el sistema para realizar las pruebas.");
            return;
        }
        auth()->login($user);

        // Setup mock data
        $dentist = Dentist::firstOrCreate(['company_id' => $user->company_id, 'name' => 'Dr. Test', 'last_name' => 'Finanzas']);
        $patient = Patient::firstOrCreate(['company_id' => $user->company_id, 'dentist_id' => $dentist->id, 'name' => 'Paciente de Prueba']);
        $jobType = JobType::firstOrCreate(['company_id' => $user->company_id, 'name' => 'Corona de Prueba']);
        $collaborator = Collaborator::firstOrCreate(['company_id' => $user->company_id, 'name' => 'Colaborador Prueba']);
        $tariff = Tariff::firstOrCreate(['company_id' => $user->company_id, 'name' => 'Tarifa de Prueba', 'price' => 15000]);
        $paymentMethod = PaymentMethod::where('is_active', true)->first();

        if (!$paymentMethod) {
            $this->error("Error: No hay métodos de pago activos.");
            return;
        }

        $this->info("\n1. Creando Job a través de validación manual igual que JobController...");
        
        $jobController = app(JobController::class);
        $requestData = [
            'dentist_id' => $dentist->id,
            'patient_name' => $patient->name,
            'job_type_id' => $jobType->id,
            'assigned_user_id' => $collaborator->id,
            'status' => 'RECIBIDO',
            'priority' => 'Normal',
            'received_at' => now()->toDateString(),
            'due_date' => now()->addDays(5)->toDateString(),
            'items' => [
                [
                    'tariff_id' => $tariff->id,
                    'description' => 'Unidad de corona',
                    'quantity' => 2,
                    'unit_price' => $tariff->price
                ]
            ]
        ];

        // Create Request explicitly matching what controller expects
        $request = Request::create('/jobs', 'POST', $requestData);
        $request->setUserResolver(function () use ($user) { return $user; });
        
        $this->info("Enviando petición store a JobController...");
        try {
            DB::beginTransaction();
            $response = $jobController->store($request);
            DB::commit();
            $this->info("Petición store completada. Respuesta: " . get_class($response));
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $this->error("Validation failed: " . json_encode($e->errors()));
            return;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error inesperado en store: " . $e->getMessage());
            return;
        }

        $job = Job::latest('id')->first();
        $this->info("✓ Job creado. ID: {$job->id}, Número: {$job->job_number}, Total: {$job->total}");

        $account = LabAccount::where('dentist_id', $dentist->id)->first();
        $this->info("✓ Deuda registrada (Balance actual de {$dentist->name}): {$account->balance}");

        $historyCount = JobStatusHistory::where('job_id', $job->id)->count();
        if ($historyCount === 0) {
            $this->error("✗ FALLO: El JobObserver no registró el historial de creación.");
        } else {
            $this->info("✓ Status tracking activo (Creación). Registros: {$historyCount}");
        }

        $this->info("\n2. Editando Job a través de JobController@update...");

        $requestData['status'] = 'EN_PROCESO';
        $requestData['items'][0]['quantity'] = 1; // Bajando cantidad para ajustar deuda
        $updateRequest = Request::create("/jobs/{$job->id}", 'PUT', $requestData);
        $updateRequest->setUserResolver(function () use ($user) { return $user; });
        
        try {
            $jobController->update($updateRequest, $job);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->error("Validation failed on update: " . json_encode($e->errors()));
            return;
        }

        $job->refresh();
        $account->refresh();

        $this->info("✓ Job actualizado. Nuevo estado: {$job->status}, Nuevo total: {$job->total}");
        $this->info("✓ Nuevo balance de {$dentist->name} ajustado: {$account->balance}");

        $historyCount2 = JobStatusHistory::where('job_id', $job->id)->count();
        if ($historyCount2 > $historyCount) {
            $this->info("✓ Status tracking activo (Actualización). Registros: {$historyCount2}");
        } else {
            $this->error("✗ FALLO: El JobObserver no registró el historial de actualización.");
        }

        $this->info("\n3. Registrando pago a través de LabAccountMoveController@store...");

        $paymentController = app(LabAccountMoveController::class);
        $paymentRequest = Request::create("/lab-account-moves", 'POST', [
            'dentist_id' => $dentist->id,
            'amount' => $job->total,
            'payment_method_id' => $paymentMethod->id,
            'description' => 'Pago de prueba automatizada',
            'move_date' => now()->toDateString()
        ]);
        $paymentRequest->setUserResolver(function () use ($user) { return $user; });
        
        try {
            $paymentController->store($paymentRequest);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->error("Validation failed on payment: " . json_encode($e->errors()));
            return;
        }

        $account->refresh();
        $this->info("✓ Pago registrado. Balance final de {$dentist->name}: {$account->balance}");
        
        if ($account->balance == 0) {
            $this->info("\n✅ TODAS LAS PRUEBAS PASADAS CORRECTAMENTE ✅");
        } else {
            $this->error("\n⚠️ EL BALANCE NO CUADRA A 0 AL FINAL DE LA PRUEBA ⚠️");
        }
    }
}
