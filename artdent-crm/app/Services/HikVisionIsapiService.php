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

    /**
     * El DS-K1T320MX es inconsistente entre familias de endpoints:
     * - System/* y Event/* (deviceInfo, time, notification/httpHosts,
     *   triggers/...) sólo aceptan XML, ignorando el Content-Type.
     * - AccessControl/UserInfo/* sí aceptan JSON, pero únicamente si se pide
     *   explícitamente con `?format=json` en la URL (no alcanza con el
     *   Content-Type del request).
     */
    private const XML_NAMESPACE = 'http://www.hikvision.com/ver10/XMLSchema';

    private function client(HikVisionDevice $device, int $timeoutSeconds = 10): PendingRequest
    {
        return Http::withDigestAuth($device->username, $device->password)
            ->timeout($timeoutSeconds)
            ->baseUrl($device->baseUrl());
    }

    /**
     * Convierte un array PHP (con una única clave raíz, ej. ['Time' => [...]])
     * al XML que espera el ISAPI de este dispositivo.
     */
    private function buildXml(array $payload): string
    {
        $rootTag = array_key_first($payload);
        $root = new \SimpleXMLElement(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?><{$rootTag} version=\"1.0\" xmlns=\"".self::XML_NAMESPACE.'"/>'
        );

        $this->fillXml($root, $payload[$rootTag]);

        return $root->asXML();
    }

    private function fillXml(\SimpleXMLElement $node, array $data): void
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                if (array_is_list($value)) {
                    foreach ($value as $item) {
                        $child = $node->addChild($key);
                        $this->fillXml($child, $item);
                    }
                } else {
                    $child = $node->addChild($key);
                    $this->fillXml($child, $value);
                }

                continue;
            }

            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            }

            $node->addChild($key, htmlspecialchars((string) $value, ENT_XML1));
        }
    }

    /**
     * Parsea una respuesta XML del ISAPI a un array asociativo simple.
     */
    private function parseXml(string $body): array
    {
        $previous = libxml_use_internal_errors(true);
        $xml = simplexml_load_string($body);
        libxml_use_internal_errors($previous);

        if ($xml === false) {
            return [];
        }

        $json = json_encode($xml);

        return $json ? (json_decode($json, true) ?? []) : [];
    }

    private function sendXml(HikVisionDevice $device, string $method, string $uri, array $payload, int $timeoutSeconds = 10): array
    {
        $response = $this->client($device, $timeoutSeconds)
            ->withBody($this->buildXml($payload), 'application/xml')
            ->send($method, $uri);

        return ['response' => $response, 'data' => $this->parseXml($response->body())];
    }

    /**
     * Envía JSON a un endpoint AccessControl/UserInfo/*. Requiere `?format=json`
     * en la URL además del body JSON (ver nota de clase).
     */
    private function sendJson(HikVisionDevice $device, string $method, string $uri, array $payload, int $timeoutSeconds = 10): array
    {
        $separator = str_contains($uri, '?') ? '&' : '?';

        $response = $this->client($device, $timeoutSeconds)
            ->send($method, $uri.$separator.'format=json', ['json' => $payload]);

        return ['response' => $response, 'data' => $response->json() ?? []];
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

            $data = $this->parseXml($response->body());

            return [
                'ok' => true,
                'model' => $data['model'] ?? null,
                'serial' => $data['serialNumber'] ?? null,
                'firmware' => $data['firmwareVersion'] ?? null,
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
                    // Evitar fechas cercanas al límite de 32 bits (~2038):
                    // el firmware las rechaza con badJsonContent/endTime.
                    'endTime' => '2035-12-31T23:59:59',
                ],
                'doorRight' => '1',
                'RightPlan' => [
                    ['doorNo' => 1, 'planTemplateNo' => '1'],
                ],
            ],
        ];

        try {
            // POST agrega una persona nueva; PUT (methodNotAllowed en este
            // firmware) sería para editar una ya existente.
            ['response' => $response, 'data' => $data] = $this->sendJson(
                $device, 'POST', '/ISAPI/AccessControl/UserInfo/Record', $payload
            );

            if ($response->successful()) {
                return ['ok' => true, 'employeeNo' => $employeeNo];
            }

            return ['ok' => false, 'error' => $data['statusString'] ?? $response->body()];
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
            ['response' => $response, 'data' => $data] = $this->sendJson(
                $device, 'PUT', '/ISAPI/AccessControl/UserInfo/Delete', $payload
            );

            return [
                'ok' => $response->successful(),
                'error' => $response->successful() ? null : ($data['statusString'] ?? $response->body()),
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
            ['response' => $response, 'data' => $data] = $this->sendJson(
                $device, 'POST', '/ISAPI/AccessControl/UserInfo/Search', $payload
            );

            if (! $response->successful()) {
                return ['ok' => false, 'users' => [], 'error' => $response->body()];
            }

            $search = $data['UserInfoSearch'] ?? [];

            return [
                'ok' => true,
                'total' => $search['totalMatches'] ?? 0,
                'users' => $search['UserInfo'] ?? [],
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
            ['response' => $response, 'data' => $data] = $this->sendJson(
                $device, 'POST', '/ISAPI/AccessControl/AcsEvent', $payload, 30
            );

            if (! $response->successful()) {
                return ['ok' => false, 'records' => [], 'error' => $response->body()];
            }

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

        $notification = [
            'id' => '1',
            'url' => $path,
            'protocolType' => 'HTTP',
            'parameterFormatType' => 'JSON',
            'portNo' => $port,
            'httpAuthenticationMethod' => 'none',
        ];

        // Algunos firmwares intentan resolver por DNS cualquier valor pasado
        // como hostName, incluso si es una IP literal — evitar ambigüedad
        // usando addressingFormatType=ipaddress cuando corresponda.
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $notification['addressingFormatType'] = 'ipaddress';
            $notification['ipAddress'] = $host;
        } else {
            $notification['addressingFormatType'] = 'hostname';
            $notification['hostName'] = $host;
        }

        $payload = [
            'HttpHostNotificationList' => [
                'HttpHostNotification' => $notification,
            ],
        ];

        try {
            ['response' => $response] = $this->sendXml(
                $device, 'PUT', '/ISAPI/Event/notification/httpHosts', $payload
            );

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
            $this->sendXml($device, 'PUT', '/ISAPI/Event/triggers/AccessControllerEvent-1', [
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
            $data = $this->parseXml($response->body());

            return [
                'ok' => $response->successful(),
                'mode' => $data['mode'] ?? null,
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
            ['response' => $response] = $this->sendXml($device, 'PUT', '/ISAPI/System/time', $payload);

            return [
                'ok' => $response->successful(),
                'error' => $response->successful() ? null : $response->body(),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
