<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Services\CompreFaceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceKioskController extends Controller
{
    public function __construct(private readonly CompreFaceService $compreface) {}

    /** Kiosk page (unauthenticated, network-restricted) */
    public function index(): Response
    {
        return Inertia::render('AttendanceKiosk/Kiosk', [
            'kioskToken' => config('app.kiosk_token'),
        ]);
    }

    /** Clock in / out via face recognition */
    public function clockFace(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|string']); // base64

        $match = $this->compreface->recognizeFace($request->input('image'));

        if (! $match) {
            return response()->json(['error' => 'Rostro no reconocido. Intentá de nuevo.'], 422);
        }

        // subject format: "collab-{id}"
        $collaboratorId = (int) str_replace('collab-', '', $match['subject']);
        $collaborator = Collaborator::where('id', $collaboratorId)
            ->where('is_active', true)
            ->firstOrFail();

        return $this->recordAttendance($request, $collaborator, 'biometric');
    }

    /** Enroll / re-enroll a collaborator face (from admin panel) */
    public function enroll(Request $request, Collaborator $collaborator): JsonResponse
    {
        $request->validate(['image' => 'required|string']);

        // Remove old face data if exists
        if ($collaborator->faceio_fid) {
            $this->compreface->deleteFaces($collaborator->faceio_fid);
        }

        $subjectId = "collab-{$collaborator->id}";
        $result = $this->compreface->enrollFace($subjectId, $request->input('image'));

        if (empty($result['image_id'])) {
            return response()->json(['error' => 'No se pudo registrar el rostro. Asegurate de estar bien iluminado.'], 422);
        }

        $collaborator->update(['faceio_fid' => $subjectId]);

        return response()->json(['success' => true, 'subject' => $subjectId]);
    }

    private function recordAttendance(Request $request, Collaborator $collaborator, string $method): JsonResponse
    {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now()->toTimeString();
        $ip = $request->ip();
        $device = $request->userAgent();

        // Save captured image
        $photoPath = null;
        if ($request->input('image')) {
            $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $request->input('image')));
            $filename = "attendance/{$collaborator->id}/{$today}-".time().'.jpg';
            Storage::disk('public')->put($filename, $imageData);
            $photoPath = $filename;
        }

        $attendance = CollaboratorAttendance::where('collaborator_id', $collaborator->id)
            ->where('work_date', $today)
            ->first();

        if (! $attendance) {
            // Clock IN
            CollaboratorAttendance::create([
                'company_id' => $collaborator->company_id,
                'collaborator_id' => $collaborator->id,
                'work_date' => $today,
                'time_in' => $now,
                'hourly_rate_snap' => $collaborator->hourly_rate,
                'method' => $method,
                'ip_address' => $ip,
                'device_info' => substr($device ?? '', 0, 255),
                'photo_path' => $photoPath,
            ]);

            return response()->json([
                'action' => 'in',
                'collaborator' => $collaborator->name,
                'time' => $now,
                'similarity' => null,
            ]);
        }

        if (! $attendance->time_out) {
            // Clock OUT — calculate hours
            $timeIn = Carbon::parse("{$today} {$attendance->time_in}");
            $timeOut = Carbon::now();
            $hours = round($timeOut->diffInMinutes($timeIn) / 60, 2);
            $amount = round($hours * $attendance->hourly_rate_snap, 2);

            $attendance->update([
                'time_out' => $now,
                'hours' => $hours,
                'amount' => $amount,
                'photo_path' => $photoPath ?? $attendance->photo_path,
                'ip_address' => $ip,
                'device_info' => substr($device ?? '', 0, 255),
            ]);

            return response()->json([
                'action' => 'out',
                'collaborator' => $collaborator->name,
                'time' => $now,
                'hours' => $hours,
                'amount' => $amount,
            ]);
        }

        return response()->json(['error' => 'Ya registraste entrada y salida hoy.'], 422);
    }
}
