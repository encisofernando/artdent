<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
class CollaboratorAttendancesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'collaborator_id' => ['nullable','integer'],
            'from' => ['nullable','date'],
            'to' => ['nullable','date'],
        ]);

        $q = CollaboratorAttendance::query()->with('collaborator');

        $companyId = optional($request->user())->company_id;
        if ($companyId) $q->where('company_id', $companyId);

        if (!empty($data['collaborator_id'])) $q->where('collaborator_id', $data['collaborator_id']);
        if (!empty($data['from'])) $q->whereDate('work_date', '>=', $data['from']);
        if (!empty($data['to'])) $q->whereDate('work_date', '<=', $data['to']);

        return response()->json(
            $q->orderBy('work_date', 'desc')->orderBy('id', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'collaborator_id' => ['required','integer','exists:collaborators,id'],
            'work_date' => ['required','date'],
            'time_in' => ['nullable','date_format:H:i'],
            'time_out' => ['nullable','date_format:H:i'],
            'notes' => ['nullable','string'],
        ]);

        $companyId = optional($request->user())->company_id;
        $collab = Collaborator::findOrFail($data['collaborator_id']);
        $this->authorizeCompany($companyId, $collab->company_id);

        [$hours, $amount] = $this->calcHoursAndAmount($data['time_in'] ?? null, $data['time_out'] ?? null, (float)$collab->hourly_rate);

        $row = CollaboratorAttendance::create([
            'company_id' => $companyId,
            'collaborator_id' => $data['collaborator_id'],
            'work_date' => $data['work_date'],
            'time_in' => $data['time_in'] ?? null,
            'time_out' => $data['time_out'] ?? null,
            'hours' => $hours,
            'amount' => $amount,
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json($row->load('collaborator'), 201);
    }

    public function update(Request $request, $id)
    {
        $row = CollaboratorAttendance::findOrFail($id);
        $companyId = optional($request->user())->company_id;
        $this->authorizeCompany($companyId, $row->company_id);

        $data = $request->validate([
            'work_date' => ['sometimes','required','date'],
            'time_in' => ['nullable','date_format:H:i'],
            'time_out' => ['nullable','date_format:H:i'],
            'notes' => ['nullable','string'],
        ]);

        $collab = Collaborator::findOrFail($row->collaborator_id);
        $this->authorizeCompany($companyId, $collab->company_id);

        $row->fill($data);
        [$hours, $amount] = $this->calcHoursAndAmount($row->time_in, $row->time_out, (float)$collab->hourly_rate);
        $row->hours = $hours;
        $row->amount = $amount;
        $row->save();

        return response()->json($row->load('collaborator'));
    }

    public function destroy(Request $request, $id)
    {
        $row = CollaboratorAttendance::findOrFail($id);
        $companyId = optional($request->user())->company_id;
        $this->authorizeCompany($companyId, $row->company_id);
        $row->delete();
        return response()->json(['ok' => true]);
    }

    private function calcHoursAndAmount(?string $in, ?string $out, float $hourlyRate): array
    {
        if (!$in || !$out) return [0.00, 0.00];

        // Soporta turnos que cruzan medianoche.
        $inTs = strtotime($in);
        $outTs = strtotime($out);
        if ($outTs < $inTs) $outTs += 24 * 3600;

        $minutes = max(0, ($outTs - $inTs) / 60);
        $hours = round($minutes / 60, 2);
        $amount = round($hours * $hourlyRate, 2);

        return [$hours, $amount];
    }

    private function authorizeCompany($userCompanyId, $resourceCompanyId): void
    {
        if ($userCompanyId && $resourceCompanyId && (int)$userCompanyId !== (int)$resourceCompanyId) {
            abort(403, 'No autorizado.');
        }
    }

    // ==================== GENERAR QR DINÁMICO ====================
public function generateDailyQr(Request $request)
{
    $companyId = $request->user()->company_id;
    $date      = now()->format('Y-m-d');

    $token = Cache::remember("daily_qr_{$companyId}_{$date}", 86400, fn() => Str::uuid()->toString());

    $qrUrl = route('attendance.kiosk', [
        'token'      => $token,
        'date'       => $date,
        'company_id' => $companyId
    ]);

    return response()->json([
        'success' => true,
        'qr_url'  => $qrUrl,
        'token'   => $token,
        'date'    => $date
    ]);
}

    // ==================== MARCADO (QR + Facial) ====================
    public function markAttendance(Request $request)
    {
        $data = $request->validate([
            'token'       => 'required|string',
            'date'        => 'required|date',
            'company_id'  => 'required|integer',
            'type'        => 'required|in:in,out',
            'method'      => 'required|in:qr,face',
            'faceio_fid'  => 'nullable|string',
            'collaborator_id' => 'nullable|exists:collaborators,id',
        ]);

        // Validar token dinámico
        if (Cache::get("daily_qr_{$data['company_id']}_{$data['date']}") !== $data['token']) {
            return response()->json(['error' => 'QR inválido o expirado'], 403);
        }

        $collabId = $data['collaborator_id'];

        // Si viene por rostro
        if ($data['method'] === 'face' && $data['faceio_fid']) {
            $collab = Collaborator::where('faceio_fid', $data['faceio_fid'])
                ->where('company_id', $data['company_id'])
                ->firstOrFail();
            $collabId = $collab->id;
        }

        if (!$collabId) {
            return response()->json(['error' => 'Colaborador no identificado'], 422);
        }

        $attendance = CollaboratorAttendance::firstOrNew([
            'company_id'     => $data['company_id'],
            'collaborator_id'=> $collabId,
            'work_date'      => $data['date'],
        ]);

        $now = now()->format('H:i');

        if ($data['type'] === 'in') {
            $attendance->time_in = $now;
        } else {
            $attendance->time_out = $now;
        }

        $attendance->method      = $data['method'];
        $attendance->ip_address  = $request->ip();
        $attendance->device_info = $request->header('User-Agent');

        // Recalcular horas y monto (reutilizamos tu método privado)
        $collab = Collaborator::findOrFail($collabId);
        [$hours, $amount] = $this->calcHoursAndAmount(
            $attendance->time_in,
            $attendance->time_out,
            (float)$collab->hourly_rate
        );

        $attendance->hours  = $hours;
        $attendance->amount = $amount;
        $attendance->save();

        return response()->json([
            'success' => true,
            'message' => $data['type'] === 'in' ? '✅ Entrada registrada' : '✅ Salida registrada',
            'attendance' => $attendance->load('collaborator')
        ]);
    }
}
