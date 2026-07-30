<?php

namespace App\Http\Controllers;

use App\Models\HikVisionDevice;
use App\Services\HikVisionEventProcessor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Recibe eventos push del terminal HikVision DS-K1T320MFWX vía ISAPI (HTTP
 * Listening / Platform Access sobre HTTP).
 *
 * El terminal envía POST a /hikvision/webhook con:
 *   - Content-Type: application/json, text/xml o multipart/form-data
 *   - Body: AccessControllerEvent en JSON, XML o campo event_log
 *
 * Configuración en el terminal:
 *   Red → Acceso a plataforma → HTTP → Dirección del servidor = IP del servidor
 *   Puerto = 80 (o 443), URL = /hikvision/webhook
 *
 * También acepta heartbeats de ISUP 5.0 (keepalive).
 *
 * La lógica de negocio (resolver colaborador/empleado, registrar asistencia)
 * vive en HikVisionEventProcessor, compartida con el ingest del listener ISUP
 * (IsupIngestController) — acá sólo se identifica el dispositivo por la vía
 * que corresponde a este transporte (IP/MAC/serial del payload) y se parsea
 * el body HTTP.
 */
class HikVisionWebhookController extends Controller
{
    public function __construct(private readonly HikVisionEventProcessor $processor) {}

    public function receive(Request $request): Response
    {
        $sourceIp = $request->ip();
        $raw = $this->parsePayload($request);

        // Identificar dispositivo por IP (solo funciona si el terminal pushea
        // directo por LAN; cuando pega a la IP pública del servidor a través del
        // WAN del consultorio, $sourceIp es la IP pública del ISP, no la del
        // terminal, y esto no matchea).
        // connection_type != 'isup': el ip_address de la fila ISUP se
        // autoactualiza con la IP pública real del terminal en cada conexión
        // (HikVisionDeviceObserver) — sin este filtro, cualquier push ISAPI
        // que llegue de esa misma IP pública matchea siempre la fila ISUP acá
        // y el guard de abajo lo descarta entero, aunque el terminal siga
        // empujando por ISAPI en paralelo.
        $device = HikVisionDevice::where('ip_address', $sourceIp)
            ->where('connection_type', '!=', 'isup')
            ->where('is_active', true)
            ->first();

        // Fallback por macAddress del payload, que el terminal siempre manda
        // en la raíz del evento independientemente de la topología de red.
        // connection_type != 'isup': si el mismo terminal físico tiene una fila
        // ISAPI y otra ISUP con la misma MAC (migración en curso), esta ruta
        // (transporte ISAPI) tiene que matchear siempre la fila ISAPI — si
        // matcheara la ISUP, el guard de abajo descartaría el evento entero
        // sin guardar nada, aunque el terminal siga empujando por ISAPI.
        if (! $device && ! empty($raw['macAddress'])) {
            $device = HikVisionDevice::where('mac_address', $raw['macAddress'])
                ->where('connection_type', '!=', 'isup')
                ->where('is_active', true)
                ->first();
        }

        // Si no encontramos por IP ni MAC, buscar por serial en el payload
        if (! $device && ! empty($raw['deviceID'])) {
            $device = HikVisionDevice::where('serial_no', $raw['deviceID'])->first();
        }

        // Si el dispositivo ya está migrado a ISUP, ese evento ya lo procesó
        // (o lo va a procesar) IsupIngestController — ignorar acá para no
        // duplicar el fichaje si el terminal todavía tiene el push ISAPI
        // activo en paralelo.
        if ($device && $device->connection_type === 'isup') {
            return response('OK', 200);
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

        $this->processor->process(
            device: $device,
            sourceIp: $sourceIp,
            eventType: $eventType,
            raw: $raw,
            acEvent: $acEvent,
            eventTime: $this->parseEventTime($raw['dateTime'] ?? $acEvent['time'] ?? null),
        );

        return response('OK', 200);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function parsePayload(Request $request): array
    {
        $contentType = $request->header('Content-Type', '');

        // XML
        if (str_contains($contentType, 'xml')) {
            return HikVisionEventProcessor::decodePayload($request->getContent(), 'xml');
        }

        // multipart/form-data: el terminal envía el evento como un campo de
        // formulario (event_log) en JSON o XML junto con fotos binarias, cuando
        // pictureURLType=binary está habilitado en la suscripción.
        if (str_contains($contentType, 'multipart/form-data')) {
            $field = $request->input('event_log') ?? $request->input('Event') ?? null;

            if ($field) {
                $decoded = json_decode($field, true);

                if (is_array($decoded)) {
                    return $decoded;
                }

                try {
                    $xml = simplexml_load_string($field);

                    return json_decode(json_encode($xml), true) ?? [];
                } catch (Throwable) {
                    return [];
                }
            }

            Log::debug('HikVision webhook: multipart sin campo event_log reconocido', [
                'fields' => array_keys($request->all()),
            ]);

            return [];
        }

        // JSON (default)
        $decoded = $request->json()->all() ?: [];

        if (! $decoded) {
            Log::debug('HikVision webhook: payload vacio o no reconocido', [
                'content_type' => $contentType,
                'raw' => substr($request->getContent(), 0, 3000),
            ]);
        }

        return $decoded;
    }

    private function parseEventTime(?string $rawTime): ?Carbon
    {
        if (! $rawTime) {
            return null;
        }

        try {
            return Carbon::parse($rawTime);
        } catch (Throwable) {
            return null;
        }
    }
}
