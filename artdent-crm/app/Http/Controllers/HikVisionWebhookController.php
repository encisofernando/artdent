<?php

namespace App\Http\Controllers;

use App\Events\AttendanceRecordedEvent;
use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\HikVisionDevice;
use App\Models\HikVisionEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Recibe eventos push del terminal HikVision DS-K1T320MFWX.
 *
 * El terminal envía POST a /hikvision/webhook con:
 *   - Content-Type: application/json (o text/xml)
 *   - Body: AccessControllerEvent en JSON o XML
 *
 * Configuración en el terminal:
 *   Red → Acceso a plataforma → HTTP → Dirección del servidor = IP del servidor
 *   Puerto = 80 (o 443), URL = /hikvision/webhook
 *
 * También acepta heartbeats de ISUP 5.0 (keepalive).
 *
 * El terminal sirve tanto a Collaborators como a Employees (un mismo employeeNo se busca
 * primero entre colaboradores y, si no aparece, entre empleados) — el fichaje resultante se
 * guarda en la tabla de asistencia que corresponda a cada tipo de personal.
 */
class HikVisionWebhookController extends Controller
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
    ];

    public function receive(Request $request): Response
    {
        $sourceIp = $request->ip();
        $raw = $this->parsePayload($request);

        // Identificar dispositivo por IP
        $device = HikVisionDevice::where('ip_address', $sourceIp)
            ->where('is_active', true)
            ->first();

        // Si no encontramos por IP exacta, buscar por serial en el payload
        if (! $device && ! empty($raw['deviceID'])) {
            $device = HikVisionDevice::where('serial_no', $raw['deviceID'])->first();
        }

        $eventType = $raw['eventType'] ?? ($raw['Events'][0]['eventType'] ?? 'unknown');

        // ── Heartbeat / keepalive ─────────────────────────────────────────
        if (in_array($eventType, ['heartbeat', 'isupEvent'], true) || isset($raw['heartbeat'])) {
            if ($device) {
                $device->update(['last_heartbeat_at' => now()]);
            }

            return response('OK', 200);
        }

        // ── Evento de acceso / asistencia ────────────────────────────────
        $acEvent = $raw['AccessControllerEvent'] ?? null;

        if (! $acEvent) {
            // Algunos firmware envuelven en Events
            $acEvent = $raw['Events'][0]['AccessControllerEvent'] ?? null;
        }

        // Loguear evento sin importar si podemos procesar
        $hikEvent = HikVisionEvent::create([
            'device_id' => $device?->id,
            'source_ip' => $sourceIp,
            'event_type' => $eventType,
            'employee_no' => $acEvent['employeeNo'] ?? null,
            'attendance_status' => $acEvent['attendanceStatus'] ?? null,
            'verify_mode' => $acEvent['currentVerifyMode'] ?? $acEvent['verifyMode'] ?? null,
            'event_time' => $this->parseEventTime($raw['dateTime'] ?? $acEvent['time'] ?? null),
            'raw_payload' => $raw,
            'processed' => false,
        ]);

        if (! $acEvent) {
            return response('OK', 200); // evento desconocido, logueado, ignorado
        }

        // ── Resolver colaborador o empleado ────────────────────────────────
        $employeeNo = $acEvent['employeeNo'] ?? null;

        if (! $employeeNo) {
            $hikEvent->update(['error' => 'employeeNo vacío en el evento']);

            return response('OK', 200);
        }

        $person = $this->resolvePerson($employeeNo, $device?->company_id);

        if (! $person) {
            $hikEvent->update(['error' => "No se encontró colaborador ni empleado para employeeNo={$employeeNo}"]);
            Log::warning('HikVision webhook: persona no encontrada', ['employeeNo' => $employeeNo]);

            return response('OK', 200);
        }

        $hikEvent->update($person['type'] === 'collaborator'
            ? ['collaborator_id' => $person['model']->id]
            : ['employee_id' => $person['model']->id]);

        // ── Registrar asistencia ──────────────────────────────────────────
        $attendanceStatus = $acEvent['attendanceStatus'] ?? 'checkIn';
        $verifyMode = $acEvent['currentVerifyMode'] ?? $acEvent['verifyMode'] ?? 'unknown';
        $method = self::VERIFY_MODE_MAP[$verifyMode] ?? 'hikvision';
        $eventTime = $hikEvent->event_time ?? now();

        try {
            $result = $person['type'] === 'collaborator'
                ? $this->recordCollaboratorAttendance($person['model'], $attendanceStatus, $method, $eventTime, $sourceIp, "HikVision {$device?->name}")
                : $this->recordEmployeeAttendance($person['model'], $attendanceStatus, $method, $eventTime, $sourceIp, "HikVision {$device?->name}");

            $hikEvent->update(['attendance_id' => $result['id'], 'processed' => true]);

            // Notifica en tiempo real al kiosk de producción (cartel de bienvenida) — solo si
            // el evento efectivamente cambió el fichaje (entrada o salida nueva), no en el caso
            // "ya registró entrada y salida hoy" (acción null). Se guarda en un try/catch propio:
            // si Reverb no está corriendo, el fichaje ya quedó bien registrado arriba y no debe
            // reportarse como error solo porque falló la notificación en tiempo real.
            if ($result['action'] && $device?->company_id) {
                try {
                    AttendanceRecordedEvent::dispatch(
                        $device->company_id,
                        $person['model']->name ?? ($person['model']->user?->name ?? 'Empleado'),
                        $person['type'],
                        $result['action'],
                        $eventTime->format('H:i'),
                        $method,
                    );
                } catch (\Throwable $broadcastError) {
                    Log::warning('HikVision webhook: no se pudo emitir la notificación en tiempo real (¿Reverb corriendo?)', [
                        'error' => $broadcastError->getMessage(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            $hikEvent->update(['error' => $e->getMessage()]);
            Log::error('HikVision webhook: error al registrar asistencia', [
                'person_type' => $person['type'],
                'person_id' => $person['model']->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response('OK', 200);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function parsePayload(Request $request): array
    {
        $contentType = $request->header('Content-Type', '');

        // XML
        if (str_contains($contentType, 'xml')) {
            try {
                $xml = simplexml_load_string($request->getContent());
                $json = json_encode($xml);

                return json_decode($json, true) ?? [];
            } catch (\Throwable) {
                return [];
            }
        }

        // JSON (default)
        return $request->json()->all() ?: [];
    }

    private function parseEventTime(?string $rawTime): ?Carbon
    {
        if (! $rawTime) {
            return null;
        }

        try {
            return Carbon::parse($rawTime);
        } catch (\Throwable) {
            return null;
        }
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
        string $attendanceStatus,
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

        $isEntry = in_array($attendanceStatus, ['checkIn', 'breakIn', 'overtimeIn'], true);
        $isExit = in_array($attendanceStatus, ['checkOut', 'breakOut', 'overtimeOut'], true);

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
            $hours = round($eventTime->diffInMinutes($timeIn) / 60, 2);
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
        string $attendanceStatus,
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

        $isEntry = in_array($attendanceStatus, ['checkIn', 'breakIn', 'overtimeIn'], true);
        $isExit = in_array($attendanceStatus, ['checkOut', 'breakOut', 'overtimeOut'], true);

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
            $hours = round($eventTime->diffInMinutes($timeIn) / 60, 2);

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
