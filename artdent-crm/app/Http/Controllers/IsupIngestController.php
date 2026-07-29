<?php

namespace App\Http\Controllers;

use App\Models\HikVisionDevice;
use App\Services\HikVisionEventProcessor;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Recibe, del proceso isup-listener (Node.js + HCNetSDK), el estado de
 * conexión y los eventos de los terminales registrados vía Platform Access
 * (ISUP). Nunca lo llama un terminal directo — sólo el listener, autenticado
 * con un token interno (middleware `isup.internal`) — y la tenancy ya viene
 * resuelta por `isup.tenant` a partir del `account_id` del body.
 *
 * La normalización/registro de asistencia reutiliza HikVisionEventProcessor,
 * la misma lógica que usa el webhook ISAPI — acá sólo se resuelve el
 * HikVisionDevice dentro del tenant ya inicializado y se arma el payload
 * "AccessControllerEvent" que el processor espera.
 */
class IsupIngestController extends Controller
{
    public function __construct(private readonly HikVisionEventProcessor $processor) {}

    public function connect(Request $request): JsonResponse
    {
        $device = $this->resolveDevice($request);

        $device->update([
            'isup_status' => 'connected',
            'isup_last_connected_at' => now(),
            'ip_address' => $request->input('source_ip', $device->ip_address),
            'serial_no' => $request->input('serial_no', $device->serial_no),
            'mac_address' => $request->input('mac_address', $device->mac_address),
        ]);

        return response()->json(['ok' => true]);
    }

    public function disconnect(Request $request): JsonResponse
    {
        $device = $this->resolveDevice($request);

        $device->update([
            'isup_status' => 'disconnected',
            'isup_last_disconnected_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    public function events(Request $request): JsonResponse
    {
        $device = $this->resolveDevice($request);

        // El listener manda el payload ISAPI crudo (XML o JSON) tal como lo
        // recibió de NET_EHOME_ALARM_ISAPI_INFO — es el mismo AccessControllerEvent
        // que ya sabe decodificar HikVisionEventProcessor, sin importar el
        // transporte. `access_controller_event` (objeto ya armado) se mantiene
        // como alternativa para el modo mock del listener.
        $raw = [];
        $rawPayload = $request->input('raw_payload');
        $format = (string) $request->input('format', 'json');

        if (is_string($rawPayload) && $rawPayload !== '') {
            $raw = HikVisionEventProcessor::decodePayload($rawPayload, $format);
        }

        $acEvent = $raw['AccessControllerEvent']
            ?? ($raw['Events'][0]['AccessControllerEvent'] ?? null)
            ?? $request->input('access_controller_event');

        if (! is_array($acEvent)) {
            Log::warning('ISUP ingest: evento sin AccessControllerEvent reconocible', [
                'account_id' => $request->input('account_id'),
                'format' => $format,
            ]);

            return response()->json(['ok' => false, 'error' => 'AccessControllerEvent faltante'], 422);
        }

        $eventTime = null;
        if ($rawTime = $request->input('event_time')) {
            try {
                $eventTime = Carbon::parse($rawTime);
            } catch (\Throwable) {
                $eventTime = null;
            }
        }

        $this->processor->process(
            device: $device,
            sourceIp: $device->ip_address,
            eventType: (string) $request->input('event_type', 'AccessControllerEvent'),
            raw: $raw ?: $request->all(),
            acEvent: $acEvent,
            eventTime: $eventTime,
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Resuelve por cualquiera de los identificadores que haya mandado el
     * listener — el account_id no está confirmado que viaje de vuelta desde
     * el SDK real (ver docs/hikvision-isup-arquitectura.md § 5), así que acá
     * también se acepta serial/MAC, igual que el fallback que ya usa
     * HikVisionWebhookController para ISAPI push.
     */
    private function resolveDevice(Request $request): HikVisionDevice
    {
        $accountId = (string) $request->input('account_id', '');
        $serialNo = (string) $request->input('serial_no', '');
        $macAddress = (string) $request->input('mac_address', '');

        $device = HikVisionDevice::where('connection_type', 'isup')
            ->where(function ($query) use ($accountId, $serialNo, $macAddress) {
                $query->when($accountId !== '', fn ($q) => $q->orWhere('isup_account_id', $accountId))
                    ->when($serialNo !== '', fn ($q) => $q->orWhere('serial_no', $serialNo))
                    ->when($macAddress !== '', fn ($q) => $q->orWhere('mac_address', $macAddress));
            })
            ->first();

        abort_if(! $device, 404, 'Dispositivo ISUP no encontrado en este tenant.');

        return $device;
    }
}
