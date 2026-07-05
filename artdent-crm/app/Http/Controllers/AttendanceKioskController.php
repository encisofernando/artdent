<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AttendanceKioskController extends Controller
{
    /**
     * Kiosk page (unauthenticado, restringido por red/token). El fichaje se hace por
     * huella/biometría de plataforma (WebAuthn, ver WebAuthnKioskController) o por el
     * terminal HikVision físico (webhook) — el reconocimiento facial vía CompreFace se
     * retiró, reemplazado por el terminal HikVision.
     */
    public function index(): Response
    {
        return Inertia::render('AttendanceKiosk/Kiosk', [
            'kioskToken' => config('app.kiosk_token'),
        ]);
    }
}
