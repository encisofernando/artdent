<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\HikVisionDevice;
use App\Models\HikVisionEvent;
use App\Services\HikVisionIsapiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class HikVisionController extends Controller
{
    public function __construct(private readonly HikVisionIsapiService $isapi) {}

    // ── Admin: dispositivos ───────────────────────────────────────────────

    public function index(Request $request): InertiaResponse
    {
        $companyId = $request->user()->company_id;

        $devices = HikVisionDevice::where('company_id', $companyId)
            ->withCount('events')
            ->orderBy('name')
            ->get();

        $collaborators = Collaborator::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'hik_employee_no']);

        return Inertia::render('HikVision/Devices', [
            'devices' => $devices,
            'collaborators' => $collaborators,
            'webhookUrl' => route('hikvision.webhook'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'device_model' => ['nullable', 'string', 'max:50'],
            'ip_address' => ['required', 'ip'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'username' => ['nullable', 'string', 'max:64'],
            'password' => ['required', 'string', 'max:128'],
            'isup_verify_code' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        HikVisionDevice::create([
            'company_id' => $request->user()->company_id,
            'name' => $data['name'],
            'device_model' => $data['device_model'] ?? 'DS-K1T320MFWX',
            'ip_address' => $data['ip_address'],
            'port' => $data['port'] ?? 80,
            'username' => $data['username'] ?? 'admin',
            'password_enc' => Crypt::encryptString($data['password']),
            'isup_verify_code' => $data['isup_verify_code'],
            'webhook_secret' => Str::random(32),
            'notes' => $data['notes'],
        ]);

        return back()->with('success', 'Dispositivo registrado correctamente.');
    }

    public function update(Request $request, HikVisionDevice $hikVisionDevice): RedirectResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'ip_address' => ['required', 'ip'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'username' => ['nullable', 'string', 'max:64'],
            'password' => ['nullable', 'string', 'max:128'],
            'isup_verify_code' => ['nullable', 'string', 'max:64'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $update = [
            'name' => $data['name'],
            'ip_address' => $data['ip_address'],
            'port' => $data['port'] ?? 80,
            'username' => $data['username'] ?? 'admin',
            'isup_verify_code' => $data['isup_verify_code'],
            'is_active' => $data['is_active'] ?? true,
            'notes' => $data['notes'],
        ];

        if (! empty($data['password'])) {
            $update['password_enc'] = Crypt::encryptString($data['password']);
        }

        $hikVisionDevice->update($update);

        return back()->with('success', 'Dispositivo actualizado.');
    }

    public function destroy(Request $request, HikVisionDevice $hikVisionDevice): RedirectResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);
        $hikVisionDevice->delete();

        return back()->with('success', 'Dispositivo eliminado.');
    }

    // ── Acciones sobre el dispositivo ─────────────────────────────────────

    /** Prueba la conexión ISAPI y actualiza la info del firmware. */
    public function testConnection(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $result = $this->isapi->testConnection($hikVisionDevice);

        if ($result['ok']) {
            $hikVisionDevice->update([
                'serial_no' => $result['serial'] ?? $hikVisionDevice->serial_no,
                'firmware_version' => $result['firmware'] ?? $hikVisionDevice->firmware_version,
                'device_model' => $result['model'] ?? $hikVisionDevice->device_model,
                'last_heartbeat_at' => now(),
            ]);
        }

        return response()->json($result);
    }

    /** Sincroniza todos los colaboradores activos al terminal. */
    public function syncCollaborators(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $result = $this->isapi->syncCollaborators($hikVisionDevice);

        return response()->json([
            'ok' => $result['error'] === 0,
            'error' => $result['error'] > 0
                ? "{$result['error']} colaborador(es) no se pudieron sincronizar (de {$result['ok']} + {$result['error']} totales)."
                : null,
            'details' => $result['details'],
        ]);
    }

    /** Configura el terminal para hacer push de eventos a nuestro webhook. */
    public function subscribeEvents(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $webhookUrl = config('app.hikvision_webhook_url') ?: route('hikvision.webhook');
        $result = $this->isapi->subscribeEventPush($hikVisionDevice, $webhookUrl);

        return response()->json($result);
    }

    /** Sincroniza la hora del terminal con el servidor. */
    public function syncTime(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $result = $this->isapi->syncTime($hikVisionDevice);

        return response()->json($result);
    }

    /** Pull manual de registros de asistencia del terminal. */
    public function pullRecords(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $from = now()->startOfDay();
        $to = now()->endOfDay();

        $result = $this->isapi->pullAttendanceRecords($hikVisionDevice, $from, $to);

        return response()->json($result);
    }

    /** Agrega o actualiza un colaborador específico en el terminal. */
    public function pushCollaborator(Request $request, HikVisionDevice $hikVisionDevice): JsonResponse
    {
        $this->authorizeDevice($request, $hikVisionDevice);

        $data = $request->validate(['collaborator_id' => ['required', 'integer', 'exists:collaborators,id']]);

        $collaborator = Collaborator::findOrFail($data['collaborator_id']);
        $result = $this->isapi->addUser($hikVisionDevice, $collaborator);

        return response()->json($result);
    }

    // ── Log de eventos ────────────────────────────────────────────────────

    public function events(Request $request): InertiaResponse
    {
        $companyId = $request->user()->company_id;

        $deviceIds = HikVisionDevice::where('company_id', $companyId)->pluck('id');

        $events = HikVisionEvent::whereIn('device_id', $deviceIds)
            ->with(['device:id,name', 'collaborator:id,name'])
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('HikVision/Events', [
            'events' => $events,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function authorizeDevice(Request $request, HikVisionDevice $device): void
    {
        abort_unless(
            (int) $device->company_id === (int) $request->user()->company_id,
            403
        );
    }
}
