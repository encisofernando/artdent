<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado cuando el terminal HikVision resuelve un fichaje (entrada/salida) de un
 * colaborador o empleado. Pensado para el kiosk de producción: al recibirlo, la pantalla
 * muestra un cartel de bienvenida "Bienvenido/a {nombre}" con la acción y la hora.
 */
class AttendanceRecordedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  'in'|'out'  $action
     */
    public function __construct(
        public int $companyId,
        public string $personName,
        public string $personType,
        public string $action,
        public string $time,
        public string $method,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("company.{$this->companyId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'attendance-recorded';
    }

    public function broadcastWith(): array
    {
        return [
            'name' => $this->personName,
            'person_type' => $this->personType,
            'action' => $this->action,
            'time' => $this->time,
            'method' => $this->method,
        ];
    }
}
