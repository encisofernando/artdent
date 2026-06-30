<?php

namespace App\Services;

use App\Models\Collaborator;
use App\Models\HikVisionDevice;
use Carbon\Carbon;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente ISAPI para terminales HikVision DS-K1T320MFWX.
 *
 * Usa HTTP Digest Authentication (requerido por ISAPI).
 * Referencia: HikVision Access Control ISAPI v2.6
 */
class HikVisionIsapiService
{
    // Modos de verificación que soporta el DS-K1T320MFWX
    public const VERIFY_MODES = ['face', 'fingerprint', 'card', 'pin'];

    // subEventType de AccessControllerEvent: fichaje de entrada/salida
    public const SUB_EVENT_ACCESS = 1;     // Acceso normal

    public const SUB_EVENT_ACCESS_DENIED = 2;

    // attendanceStatus
    public const STATUS_CHECK_IN = 'checkIn';

    public const STATUS_CHECK_OUT = 'checkOut';

    public const STATUS_BREAK_IN = 'breakIn';

    public const STATUS_BREAK_OUT = 'breakOut';

    // ── ISAPI endpoints ───────────────────────────────────────────────────────

    private function client(HikVisionDevice $device, int $timeoutSeconds = 10): PendingRequest
    {
        return Http::withDigestAuth($device->username, $device->password)
            ->timeout($timeoutSeconds)
            ->baseUrl($device->baseUrl())
            ->withHeaders(['Content-Type' => 'application/json']);
    }

    // ── Conexión y diagnóstico ─────────────────────────────────────────────

    /**
     * Verifica conectividad y devuelve info del dispositivo.
     *
     * @return array{ok: bool, model: string|null, serial: string|null, firmware: string|null, error: string|null}
     */
    public function testConnection(HikVisionDevice $device): array
    {
        try {
            $response = $this->client($device)
                ->get('/ISAPI/System/deviceInfo');

            if (! $response->successful()) {
                return ['ok' => false, 'error' => "HTTP {$response->status()}: {$response->body()}"];
            }

            $data = $response->json() ?? [];

            return [
                'ok' => true,
                'model' => $data['DeviceInfo']['model'] ?? null,
                'serial' => $data['DeviceInfo']['serialNumber'] ?? null,
                'firmware' => $data['DeviceInfo']['firmwareVersion'] ?? null,
                'error' => null,
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // ── Gestión de usuarios ────────────────────────────────────────────────

    /**
     * Devuelve el employeeNo a usar para un colaborador.
     * Usa hik_employee_no si está configurado, o el ID con padding de 10 dígitos.
     */
    public function employeeNo(Collaborator $collaborator): string
    {
        return $collaborator->hik_employee_no
            ?? str_pad((string) $collaborator->id, 10, '0', STR_PAD_LEFT);
    }

    /**
     * Agrega o actualiza un usuario en el terminal.
     * La biometría (huella/rostro) se registra directamente en el dispositivo.
     */
    public function addUser(HikVisionDevice $device, Collaborator $collaborator): array
    {
        $employeeNo = $this->employeeNo($collaborator);

        $payload = [
            'UserInfo' => [
                'employeeNo' => $employeeNo,
                'name' => mb_substr($collaborator->name, 0, 32), // límite del firmware
                'userType' => 'normal',
                'Valid' => [
                    'enable' => (bool) $collaborator->is_active,
                    'beginTime' => '2000-01-01T00:00:00',
                    'endTime' => '2038-01-01T00:00:00',
                ],
                'doorRight' => '1',
                'RightPlan' => [
                    ['doorNo' => 1, 'planTemplateNo' => '1'],
                ],
            ],
        ];

        try {
            $response = $this->client($device)
                ->put('/ISAPI/AccessControl/UserInfo/Record', $payload);

            if ($response->successful()) {
                return ['ok' => true, 'employeeNo' => $employeeNo];
            }

            $error = $response->json('statusString') ?? $response->body();

            return ['ok' => false, 'error' => $error];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Elimina un usuario del terminal por su employeeNo.
     */
    public function deleteUser(HikVisionDevice $device, string $employeeNo): array
    {
        $payload = [
            'UserInfoDelCond' => [
                'EmployeeNoList' => [['employeeNo' => $employeeNo]],
            ],
        ];

        try {
            $response = $this->client($device)
                ->put('/ISAPI/AccessControl/UserInfo/Delete', $payload);

            return [
                'ok' => $response->successful(),
                'error' => $response->successful() ? null : $response->body(),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Lista todos los usuarios registrados en el terminal.
     */
    public function getUserList(HikVisionDevice $device, int $offset = 0, int $limit = 50): array
    {
        $payload = [
            'UserInfoSearchCond' => [
                'searchID' => '1',
                'searchResultPosition' => $offset,
                'maxResults' => $limit,
            ],
        ];

        try {
            $response = $this->client($device)
                ->post('/ISAPI/AccessControl/UserInfo/Search', $payload);

            if (! $response->successful()) {
                return ['ok' => false, 'users' => [], 'error' => $response->body()];
            }

            $data = $response->json('UserInfoSearch', []);

            return [
                'ok' => true,
                'total' => $data['totalMatches'] ?? 0,
                'users' => $data['UserInfo'] ?? [],
                'error' => null,
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'users' => [], 'error' => $e->getMessage()];
        }
    }

    /**
     * Sincroniza todos los colaboradores activos al terminal.
     * Devuelve un resumen con OK/error por colaborador.
     */
    public function syncCollaborators(HikVisionDevice $device): array
    {
        $collaborators = Collaborator::where('company_id', $device->company_id)
            ->where('is_active', true)
            ->get();

        $results = ['ok' => 0, 'error' => 0, 'details' => []];

        foreach ($collaborators as $collaborator) {
            $result = $this->addUser($device, $collaborator);

            if ($result['ok']) {
                $results['ok']++;
            } else {
                $results['error']++;
            }

            $results['details'][] = [
                'collaborator' => $collaborator->name,
                'employeeNo' => $this->employeeNo($collaborator),
                'ok' => $result['ok'],
                'error' => $result['error'] ?? null,
            ];
        }

        return $results;
    }

    // ── Registros de asistencia (pull manual) ─────────────────────────────

    /**
     * Obtiene registros de control de acceso del terminal para un rango de fechas.
     * Usar como fallback cuando los eventos en tiempo real no llegaron.
     */
    public function pullAttendanceRecords(HikVisionDevice $device, Carbon $from, Carbon $to): array
    {
        $payload = [
            'AcsEventCond' => [
                'searchID' => '1',
                'searchResultPosition' => 0,
                'maxResults' => 500,
                'major' => 5,             // 5 = Access Control Events
                'minor' => 0,             // 0 = todos
                'startTime' => $from->toIso8601String(),
                'endTime' => $to->toIso8601String(),
            ],
        ];

        try {
            $response = $this->client($device, 30)
                ->post('/ISAPI/AccessControl/AcsEvent', $payload);

            if (! $response->successful()) {
                return ['ok' => false, 'records' => [], 'error' => $response->body()];
            }

            $data = $response->json('AcsEvent', []);

            return [
                'ok' => true,
                'total' => $data['totalMatches'] ?? 0,
                'records' => $data['InfoList'] ?? [],
                'error' => null,
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'records' => [], 'error' => $e->getMessage()];
        }
    }

    // ── Suscripción a eventos HTTP (ISAPI alarm push) ──────────────────────

    /**
     * Configura el terminal para hacer push de eventos de acceso/asistencia
     * a nuestro endpoint HTTP.
     *
     * El terminal enviará POST requests en XML a $webhookUrl cada vez que
     * se produzca un evento de acceso.
     */
    public function subscribeEventPush(HikVisionDevice $device, string $webhookUrl): array
    {
        // Parsear URL del webhook para extraer host, puerto y path
        $parsed = parse_url($webhookUrl);
        $host = $parsed['host'] ?? '';
        $port = $parsed['port'] ?? ($parsed['scheme'] === 'https' ? 443 : 80);
        $path = $parsed['path'] ?? '/hikvision/webhook';

        $payload = [
            'HttpHostNotificationList' => [
                'HttpHostNotification' => [
                    'id' => '1',
                    'url' => $path,
                    'protocolType' => 'HTTP',
                    'parameterFormatType' => 'JSON',
                    'addressingFormatType' => 'ipaddress',
                    'ipAddress' => $host,
                    'portNo' => $port,
                    'httpAuthenticationMethod' => 'none',
                ],
            ],
        ];

        try {
            $response = $this->client($device)
                ->put('/ISAPI/Event/notification/httpHosts', $payload);

            if (! $response->successful()) {
                return ['ok' => false, 'error' => $response->body()];
            }

            // Habilitar tipos de evento: Access Control
            $this->enableAccessControlEvents($device);

            return ['ok' => true, 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Habilita los eventos de control de acceso en el terminal.
     */
    private function enableAccessControlEvents(HikVisionDevice $device): void
    {
        try {
            $this->client($device)->put('/ISAPI/Event/triggers/AccessControllerEvent-1', [
                'EventTrigger' => [
                    'id' => 'AccessControllerEvent-1',
                    'eventType' => 'AccessControllerEvent',
                    'eventTypeInputList' => [
                        ['eventTypeInput' => ['id' => '1', 'resourceType' => 'Event', 'resouceID' => '1']],
                    ],
                    'notificationList' => [
                        ['notification' => ['id' => '1', 'notificationMethod' => 'HTTP', 'notificationRecurrence' => 'beginning']],
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning("HikVision: no se pudieron habilitar eventos de acceso: {$e->getMessage()}");
        }
    }

    // ── Configuración de modo de verificación ─────────────────────────────

    /**
     * Obtiene el modo de verificación actual del terminal.
     */
    public function getVerifyMode(HikVisionDevice $device): array
    {
        try {
            $response = $this->client($device)->get('/ISAPI/AccessControl/AttendanceStatus/AccessMode');

            return [
                'ok' => $response->successful(),
                'mode' => $response->json('AccessMode.mode') ?? null,
                'error' => $response->successful() ? null : $response->body(),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'mode' => null, 'error' => $e->getMessage()];
        }
    }

    // ── Hora del sistema ───────────────────────────────────────────────────

    /**
     * Sincroniza la hora del terminal con el servidor.
     */
    public function syncTime(HikVisionDevice $device): array
    {
        $payload = [
            'Time' => [
                'timeMode' => 'manual',
                'localTime' => now()->toIso8601String(),
                'timeZone' => 'CST-3:00:00',
            ],
        ];

        try {
            $response = $this->client($device)->put('/ISAPI/System/time', $payload);

            return [
                'ok' => $response->successful(),
                'error' => $response->successful() ? null : $response->body(),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
