<?php

namespace Tests\Unit;

use App\Http\Controllers\JobController;
use App\Models\Job;
use App\Services\JobPhaseService;
use Tests\TestCase;

class JobPhaseServiceTest extends TestCase
{
    public function test_job_phase_service_can_be_resolved_and_method_exists(): void
    {
        $service = app(JobPhaseService::class);
        $this->assertInstanceOf(JobPhaseService::class, $service);
        $this->assertTrue(method_exists($service, 'billOutstandingForManualDelivery'));

        $job = new Job;
        // Should execute cleanly without error
        $service->billOutstandingForManualDelivery($job);
    }

    public function test_job_controller_can_be_resolved(): void
    {
        $controller = app(JobController::class);
        $this->assertInstanceOf(JobController::class, $controller);
    }
}
