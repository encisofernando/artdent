<?php

namespace App\Services;

use App\Events\AttendanceRecordedEvent;
use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\HikVisionDevice;
use App\Models\HikVisionEvent;
use App\Support\CrmMode;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Procesa un evento de acceso/asistencia ya identificado (dispositivo resuelto,
 * payload ya normalizado a la forma AccessControllerEvent), sin importar por qué
 * transporte llegó al backend. Lo usan tanto el webhook HTTP de ISAPI push
 * (HikVisionWebhookController) como el ingest del listener ISUP
 * (IsupIngestController) — la lógica de negocio (mapeo de método de
 * verificación, resolución de colaborador/empleado, inferencia de entrada/
 * salida, cálculo de horas) vive acá una sola vez.
 */
class HikVisionEventProcessor
{
    // map verify_mode del terminal → método legible
    private const VERIFY_MODE_MAP = [
        'face' => 'biometric',
        'fingerprint' => 'fingerprint',
        'card' => 'card',
        'cardOrFace' => 'biometric',
        'fingerprintOrFace' => 'biometric',
        'cardOrFingerprint' => 'fingerprint',
        'pin' => 'pin',
        'cardOrPwd' => 'pin',
        'cardOrfaceOrPw' => 'biometric',
    ];

    /**
     * Decodifica un payload crudo de evento HikVision (XML o JSON) a array —
     * la misma forma AccessControllerEvent sin importar el transporte que lo
     * trajo. La usan tanto HikVisionWebhookController (ya sabe si vino XML o
     * JSON por el Content-Type HTTP) como IsupIngestController (el listener
     * ISUP manda el byDataType de NET_EHOME_ALARM_ISAPI_INFO, que es
     * exactamente el mismo dato ISAPI viajando por dentro de la sesión ISUP).
     */
    public static function decodePayload(string $raw, string $format): array
    {
        if ($format === 'xml') {
            try {
                $xml = simplexml_load_string($raw);

                return json_decode(json_encode($xml), true) ?? [];
            } catch (Throwable) {
                return [];
            }
        }

        return json_decode($raw, true) ?? [];
    }

    /**
     * @param  array<string, mixed>  $raw  Payload completo, para el log de auditoría (hikvision_events.raw_payload)
     * @param  array<string, mixed>|null  $acEvent  AccessControllerEvent ya extraído del payload, o null si el evento no trae uno reconocible (ej. heartbeat ya filtrado antes de llegar acá)
     */
    public function process(
        ?HikVisionDevice $device,
        string $sourceIp,
        string $eventType,
        array $raw,
        ?array $acEvent,
        ?Carbon $eventTime,
    ): HikVisionEvent {
        $hikEvent = HikVisionEvent::create([
            'device_id' => $device?->id,
            'source_ip' => $sourceIp,
            'event_type' => $eventType,
            'employee_no' => $acEvent['employeeNo'] ?? null,
            'attendance_status' => $acEvent['attendanceStatus'] ?? null,
            'verify_mode' => $acEvent['currentVerifyMode'] ?? $acEvent['verifyMode'] ?? null,
            'event_time' => $eventTime,
            'raw_payload' => $raw,
            'processed' => false,
        ]);

        if (! $acEvent) {
            return $hikEvent; // evento desconocido, logueado, ignorado
        }

        // El DS-K1T320MX manda el legajo como employeeNoString en los eventos
        // de autenticación (subEventType 75 = "Authenticated via Face", etc.);
        // employeeNo sin sufijo no viene poblado en este firmware.
        $employeeNo = $acEvent['employeeNoString'] ?? $acEvent['employeeNo'] ?? null;

        if (! $employeeNo) {
            $hikEvent->update(['error' => 'employeeNo vacío en el evento']);

            return $hikEvent;
        }

        $person = $this->resolvePerson($employeeNo, $device?->company_id);

        if (! $person) {
            $hikEvent->update(['error' => "No se encontró colaborador ni empleado para employeeNo={$employeeNo}"]);
            Log::warning('HikVision: persona no encontrada', ['employeeNo' => $employeeNo]);

            return $hikEvent;
        }

        $hikEvent->update($person['type'] === 'collaborator'
            ? ['collaborator_id' => $person['model']->id]
            : ['employee_id' => $person['model']->id]);

        // Este firmware no completa attendanceStatus (llega el string literal
        // "undefined"): en ese caso se infiere entrada/salida dentro de
        // record*Attendance() según si ya hay un fichaje abierto hoy.
        $attendanceStatus = $acEvent['attendanceStatus'] ?? 'checkIn';
        if ($attendanceStatus === 'undefined') {
            $attendanceStatus = null;
        }
        $verifyMode = $acEvent['currentVerifyMode'] ?? $acEvent['verifyMode'] ?? 'unknown';
        // Fallback a 'biometric' (no 'hikvision': el enum method de las tablas de
        // asistencia no admite ese valor) para cualquier verifyMode no mapeado.
        $method = self::VERIFY_MODE_MAP[$verifyMode] ?? 'biometric';
        $resolvedEventTime = $hikEvent->event_time ?? now();

        try {
            $result = $person['type'] === 'collaborator'
                ? $this->recordCollaboratorAttendance($person['model'], $attendanceStatus, $method, $resolvedEventTime, $sourceIp, "HikVision {$device?->name}")
                : $this->recordEmployeeAttendance($person['model'], $attendanceStatus, $method, $resolvedEventTime, $sourceIp, "HikVision {$device?->name}");

            $hikEvent->update(['attendance_id' => $result['id'], 'processed' => true]);

            // Notifica en tiempo real al kiosk de producción (cartel de bienvenida) — solo si
            // el evento efectivamente cambió el fichaje (entrada o salida nueva), no en el caso
            // "ya registró entrada y salida hoy" (acción null). Se guarda en un try/catch propio:
            // si Reverb no está corriendo, el fichaje ya quedó bien registrado arriba y no debe
            // reportarse como error solo porque falló la notificación en tiempo real.
            if ($result['action'] && $device?->company_id) {
                try {
                    AttendanceRecordedEvent::dispatch(
                        (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
                        $device->company_id,
                        $person['model']->name ?? ($person['model']->user?->name ?? 'Empleado'),
                        $person['type'],
                        $result['action'],
                        $resolvedEventTime->format('H:i'),
                        $method,
                    );
                } catch (Throwable $broadcastError) {
                    Log::warning('HikVision: no se pudo emitir la notificación en tiempo real (¿Reverb corriendo?)', [
                        'error' => $broadcastError->getMessage(),
                    ]);
                }
            }
        } catch (Throwable $e) {
            $hikEvent->update(['error' => $e->getMessage()]);
            Log::error('HikVision: error al registrar asistencia', [
                'person_type' => $person['type'],
                'person_id' => $person['model']->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $hikEvent;
    }

    /**
     * Busca la persona (colaborador o empleado) por su employeeNo en el dispositivo.
     * Primero colaboradores (por hik_employee_no, luego por ID con padding), y si no
     * aparece ninguno, empleados con el mismo criterio.
     *
     * @return array{type: 'collaborator'|'employee', model: Collaborator|Employee}|null
     */
    private function resolvePerson(string $employeeNo, ?int $companyId): ?array
    {
        $numericId = (int) (ltrim($employeeNo, '0') ?: '0');

        $collaboratorQuery = Collaborator::where('is_active', true);
        if ($companyId) {
            $collaboratorQuery->where('company_id', $companyId);
        }

        $collaborator = (clone $collaboratorQuery)->where('hik_employee_no', $employeeNo)->first()
            ?? (clone $collaboratorQuery)->where('id', $numericId)->first();

        if ($collaborator) {
            return ['type' => 'collaborator', 'model' => $collaborator];
        }

        $employeeQuery = Employee::where('is_active', true);
        if ($companyId) {
            $employeeQuery->where('company_id', $companyId);
        }

        $employee = (clone $employeeQuery)->where('hik_employee_no', $employeeNo)->first()
            ?? (clone $employeeQuery)->where('id', $numericId)->first();

        if ($employee) {
            return ['type' => 'employee', 'model' => $employee];
        }

        return null;
    }

    /**
     * Registra entrada o salida de un colaborador según el estado del evento.
     *
     * @return array{id: ?int, action: 'in'|'out'|null}
     */
    private function recordCollaboratorAttendance(
        Collaborator $collaborator,
        ?string $attendanceStatus,
        string $method,
        Carbon $eventTime,
        string $sourceIp,
        string $deviceInfo,
    ): array {
        $workDate = $eventTime->toDateString();
        $timeStr = $eventTime->toTimeString();

        $attendance = CollaboratorAttendance::where('collaborator_id', $collaborator->id)
            ->where('work_date', $workDate)
            ->first();

        if ($attendanceStatus === null) {
            // Firmware sin attendanceStatus: entrada si no hay fichaje hoy, salida si hay uno abierto.
            $isEntry = ! $attendance;
            $isExit = $attendance && ! $attendance->time_out;
        } else {
            $isEntry = in_array($attendanceStatus, ['checkIn', 'breakIn', 'overtimeIn'], true);
            $isExit = in_array($attendanceStatus, ['checkOut', 'breakOut', 'overtimeOut'], true);
        }

        if (! $attendance && $isEntry) {
            $created = CollaboratorAttendance::create([
                'company_id' => $collaborator->company_id,
                'collaborator_id' => $collaborator->id,
                'work_date' => $workDate,
                'time_in' => $timeStr,
                'hourly_rate_snap' => $collaborator->hourly_rate,
                'method' => $method,
                'ip_address' => $sourceIp,
                'device_info' => $deviceInfo,
            ]);

            return ['id' => $created->id, 'action' => 'in'];
        }

        if ($attendance && ! $attendance->time_out && $isExit) {
            $timeIn = Carbon::parse("{$workDate} {$attendance->getRawOriginal('time_in')}");
            // abs(): en Carbon 3 diffInMinutes() devuelve el signo según el orden
            // de los operandos, y $eventTime (salida) es posterior a $timeIn.
            $hours = round(abs($eventTime->diffInMinutes($timeIn)) / 60, 2);
            $amount = round($hours * ($attendance->hourly_rate_snap ?? 0), 2);

            $attendance->update([
                'time_out' => $timeStr,
                'hours' => $hours,
                'amount' => $amount,
                'ip_address' => $sourceIp,
                'device_info' => $deviceInfo,
            ]);

            return ['id' => $attendance->id, 'action' => 'out'];
        }

        // Ya registró entrada y salida hoy — sin cambios
        return ['id' => $attendance?->id, 'action' => null];
    }

    /**
     * Registra entrada o salida de un empleado según el estado del evento. Sin monto
     * (Employee no tiene tarifa horaria) — solo horas, disponibles para el motor de fórmulas.
     *
     * @return array{id: ?int, action: 'in'|'out'|null}
     */
    private function recordEmployeeAttendance(
        Employee $employee,
        ?string $attendanceStatus,
        string $method,
        Carbon $eventTime,
        string $sourceIp,
        string $deviceInfo,
    ): array {
        $workDate = $eventTime->toDateString();
        $timeStr = $eventTime->toTimeString();

        $attendance = EmployeeAttendance::where('employee_id', $employee->id)
            ->where('work_date', $workDate)
            ->first();

        if ($attendanceStatus === null) {
            // Firmware sin attendanceStatus: entrada si no hay fichaje hoy, salida si hay uno abierto.
            $isEntry = ! $attendance;
            $isExit = $attendance && ! $attendance->time_out;
        } else {
            $isEntry = in_array($attendanceStatus, ['checkIn', 'breakIn', 'overtimeIn'], true);
            $isExit = in_array($attendanceStatus, ['checkOut', 'breakOut', 'overtimeOut'], true);
        }

        if (! $attendance && $isEntry) {
            $created = EmployeeAttendance::create([
                'company_id' => $employee->company_id,
                'employee_id' => $employee->id,
                'work_date' => $workDate,
                'time_in' => $timeStr,
                'method' => $method,
                'ip_address' => $sourceIp,
                'device_info' => $deviceInfo,
            ]);

            return ['id' => $created->id, 'action' => 'in'];
        }

        if ($attendance && ! $attendance->time_out && $isExit) {
            $timeIn = Carbon::parse("{$workDate} {$attendance->getRawOriginal('time_in')}");
            // abs(): en Carbon 3 diffInMinutes() devuelve el signo según el orden
            // de los operandos, y $eventTime (salida) es posterior a $timeIn.
            $hours = round(abs($eventTime->diffInMinutes($timeIn)) / 60, 2);

            $attendance->update([
                'time_out' => $timeStr,
                'hours' => $hours,
                'ip_address' => $sourceIp,
                'device_info' => $deviceInfo,
            ]);

            return ['id' => $attendance->id, 'action' => 'out'];
        }

        // Ya registró entrada y salida hoy — sin cambios
        return ['id' => $attendance?->id, 'action' => null];
    }
}
