<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado cuando cambia el status de un Job. Actualiza en tiempo real el
 * tablero del kiosk de producción (JobKiosk/Index.jsx) para que las acciones
 * de un técnico se reflejen al instante en las demás terminales.
 */
class JobStatusChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $tenantId,
        public int $companyId,
        public int $jobId,
        public string $status,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("tenant.{$this->tenantId}.company.{$this->companyId}.jobkiosk"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'job-status-changed';
    }

    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->jobId,
            'status' => $this->status,
        ];
    }
}
