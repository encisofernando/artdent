<?php

namespace App\Http\Controllers;

use App\Mail\DentistPortalLoginCode;
use App\Models\Dentist;
use App\Models\DentistLoginCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\View\View;

class DentistPortalAuthController extends Controller
{
    private const REMEMBER_DAYS = 60;

    public function showLogin(): View
    {
        return view('portal.dentist-login');
    }

    public function sendCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = trim($request->email);
        $throttleKey = 'dentist-portal-code:'.strtolower($email).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors(['email' => 'Demasiados intentos. Esperá '.ceil($seconds / 60).' minuto(s) y volvé a intentar.']);
        }

        $dentist = Dentist::where('email', $email)->where('is_active', true)->first();

        // Mismo mensaje exista o no el email, para no filtrar qué correos están registrados.
        $genericMessage = 'Si el correo pertenece a un odontólogo registrado, te enviamos un código de acceso.';

        if ($dentist) {
            RateLimiter::hit($throttleKey, 600);

            $dentist->login_codes()->whereNull('used_at')->update(['used_at' => now()]);

            $code = (string) random_int(1000, 9999);

            DentistLoginCode::create([
                'dentist_id' => $dentist->id,
                'code' => $code,
                'expires_at' => now()->addMinutes(10),
            ]);

            Mail::to($dentist->email)->send(new DentistPortalLoginCode($dentist, $code));

            $request->session()->put('dentist_portal_pending_id', $dentist->id);
        }

        return redirect()->route('dentist-portal.verify')->with('success', $genericMessage);
    }

    public function showVerify(Request $request): View|RedirectResponse
    {
        if (! $request->session()->has('dentist_portal_pending_id')) {
            return redirect()->route('dentist-portal.login');
        }

        return view('portal.dentist-verify');
    }

    public function verifyCode(Request $request): RedirectResponse
    {
        $dentistId = $request->session()->get('dentist_portal_pending_id');

        if (! $dentistId) {
            return redirect()->route('dentist-portal.login');
        }

        $request->validate([
            'code' => ['required', 'string', 'size:4'],
        ]);

        $loginCode = DentistLoginCode::where('dentist_id', $dentistId)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (! $loginCode || $loginCode->isExpired()) {
            return back()->withErrors(['code' => 'El código venció. Pedí uno nuevo.']);
        }

        if ($loginCode->attempts >= 5) {
            return back()->withErrors(['code' => 'Superaste el máximo de intentos. Pedí un código nuevo.']);
        }

        if (! hash_equals($loginCode->code, trim($request->code))) {
            $loginCode->increment('attempts');

            return back()->withErrors(['code' => 'Código incorrecto.']);
        }

        $loginCode->update(['used_at' => now()]);

        $dentist = Dentist::findOrFail($dentistId);

        $request->session()->forget('dentist_portal_pending_id');
        $request->session()->regenerate();
        $request->session()->put('dentist_id', $dentist->id);

        if ($request->boolean('remember')) {
            $plainToken = Str::random(60);
            $dentist->remember_token = Hash::make($plainToken);
            $dentist->save();

            Cookie::queue(Cookie::make(
                'dentist_remember',
                $dentist->id.'|'.$plainToken,
                self::REMEMBER_DAYS * 24 * 60,
                httpOnly: true,
            ));
        }

        return redirect()->route('dentist-portal.show');
    }

    public function logout(Request $request): RedirectResponse
    {
        $dentistId = $request->session()->get('dentist_id');

        if ($dentistId) {
            Dentist::where('id', $dentistId)->update(['remember_token' => null]);
        }

        $request->session()->forget('dentist_id');
        Cookie::queue(Cookie::forget('dentist_remember'));

        return redirect()->route('dentist-portal.login');
    }
}
