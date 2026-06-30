<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
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

        // ── Resolver colaborador ──────────────────────────────────────────
        $employeeNo = $acEvent['employeeNo'] ?? null;

        if (! $employeeNo) {
            $hikEvent->update(['error' => 'employeeNo vacío en el evento']);

            return response('OK', 200);
        }

        $collaborator = $this->resolveCollaborator($employeeNo, $device?->company_id);

        if (! $collaborator) {
            $hikEvent->update(['error' => "Colaborador no encontrado para employeeNo={$employeeNo}"]);
            Log::warning('HikVision webhook: colaborador no encontrado', ['employeeNo' => $employeeNo]);

            return response('OK', 200);
        }

        $hikEvent->update(['collaborator_id' => $collaborator->id]);

        // ── Registrar asistencia ──────────────────────────────────────────
        $attendanceStatus = $acEvent['attendanceStatus'] ?? 'checkIn';
        $verifyMode = $acEvent['currentVerifyMode'] ?? $acEvent['verifyMode'] ?? 'unknown';
        $method = self::VERIFY_MODE_MAP[$verifyMode] ?? 'hikvision';
        $eventTime = $hikEvent->event_time ?? now();

        try {
            $attendanceId = $this->recordAttendance(
                $collaborator,
                $attendanceStatus,
                $method,
                $eventTime,
                $sourceIp,
                "HikVision {$device?->name}",
            );

            $hikEvent->update(['attendance_id' => $attendanceId, 'processed' => true]);
        } catch (\Throwable $e) {
            $hikEvent->update(['error' => $e->getMessage()]);
            Log::error('HikVision webhook: error al registrar asistencia', [
                'collaborator' => $collaborator->id,
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
     * Busca el colaborador por su employeeNo en el dispositivo.
     * Primero por hik_employee_no, luego por ID con padding.
     */
    private function resolveCollaborator(string $employeeNo, ?int $companyId): ?Collaborator
    {
        $query = Collaborator::where('is_active', true);

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        // Buscar por campo explícito
        $collaborator = (clone $query)->where('hik_employee_no', $employeeNo)->first();

        if ($collaborator) {
            return $collaborator;
        }

        // Buscar por ID numérico (employeeNo = ID con padding)
        $numericId = ltrim($employeeNo, '0') ?: '0';

        return $query->where('id', (int) $numericId)->first();
    }

    /**
     * Registra entrada o salida según el estado del evento.
     */
    private function recordAttendance(
        Collaborator $collaborator,
        string $attendanceStatus,
        string $method,
        Carbon $eventTime,
        string $sourceIp,
        string $deviceInfo,
    ): ?int {
        $workDate = $eventTime->toDateString();
        $timeStr = $eventTime->toTimeString();

        $attendance = CollaboratorAttendance::where('collaborator_id', $collaborator->id)
            ->where('work_date', $workDate)
            ->first();

        // checkIn / breakIn → entrada
        $isEntry = in_array($attendanceStatus, ['checkIn', 'breakIn', 'overtimeIn'], true);
        // checkOut / breakOut → salida
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

            return $created->id;
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

            return $attendance->id;
        }

        // Ya registró entrada y salida hoy — sin cambios
        return $attendance?->id;
    }
}
