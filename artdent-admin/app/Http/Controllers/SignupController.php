<?php

namespace App\Http\Controllers;

use App\Mail\TenantSignupVerificationMail;
use App\Models\Plan;
use App\Models\Tenant;
use App\Services\TenantProvisioningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * Alta pública de tenants (self-service). El aprovisionamiento real (crear
 * la base física, sembrar el owner) sólo ocurre después de confirmar el
 * email — nunca se persiste nada en la base central antes de eso. Los datos
 * del alta (incluida la contraseña en texto plano, necesaria porque
 * TenantProvisioningService la hashea recién al crear el usuario) viajan
 * encriptados dentro de la URL firmada del email, no en una tabla — evita
 * tener que guardar una contraseña en texto plano en cualquier lado.
 *
 * El subdominio que arma TenantProvisioningService (`{id}.artdent.com.ar`,
 * guardado en `domains`) es sólo informativo — artdent-crm resuelve el
 * tenant por email (LoginRequest::authenticate() busca en user_tenant_map),
 * no por dominio, así que después de confirmar el email siempre se manda a
 * la URL de login única y compartida (`tenancy.crm_login_url`), no a un
 * subdominio por tenant.
 */
class SignupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Signup/Create', [
            'plans' => Plan::where('is_public', true)
                ->where('is_active', true)
                ->orderBy('price')
                ->get(['slug', 'name', 'price', 'trial_days', 'description']),
            'loginUrl' => config('tenancy.crm_login_url'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9\-]+$/'],
            'name' => ['required', 'string', 'max:150'],
            'owner_name' => ['required', 'string', 'max:150'],
            'owner_email' => ['required', 'email', 'max:150'],
            'owner_password' => ['required', 'string', 'min:8', 'confirmed'],
            'plan' => ['required', 'string', Rule::exists('plans', 'slug')->where('is_public', true)->where('is_active', true)],
        ], [
            'id.regex' => 'El identificador sólo puede tener minúsculas, números y guiones.',
        ]);

        $domain = $data['id'].'.'.config('tenancy.default_domain_suffix', 'artdent.com.ar');
        $central = DB::connection(config('tenancy.database.central_connection'));

        if (Tenant::whereKey($data['id'])->exists() || $central->table('domains')->where('domain', $domain)->exists()) {
            throw ValidationException::withMessages(['id' => 'Ese identificador ya está en uso.']);
        }

        if ($central->table('user_tenant_map')->where('email', $data['owner_email'])->exists()) {
            throw ValidationException::withMessages(['owner_email' => 'Ese email ya está asociado a una cuenta existente.']);
        }

        $payload = [
            'id' => $data['id'],
            'name' => $data['name'],
            'owner_name' => $data['owner_name'],
            'owner_email' => $data['owner_email'],
            'owner_password' => $data['owner_password'],
            'plan' => $data['plan'],
        ];

        $verificationUrl = URL::temporarySignedRoute('signup.verify', now()->addHours(24), [
            'payload' => Crypt::encryptString(json_encode($payload)),
        ]);

        Mail::to($data['owner_email'])->send(
            new TenantSignupVerificationMail($data['owner_name'], $data['name'], $verificationUrl)
        );

        return redirect()->route('signup.check-email', ['email' => $data['owner_email']]);
    }

    public function checkEmail(Request $request): Response
    {
        return Inertia::render('Signup/CheckEmail', [
            'email' => $request->query('email'),
        ]);
    }

    public function verify(Request $request, TenantProvisioningService $provisioning): RedirectResponse
    {
        try {
            $payload = json_decode(Crypt::decryptString((string) $request->query('payload')), true, flags: JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            return redirect()->route('signup.create')->with('error', 'El link de confirmación no es válido o ya expiró. Completá el alta de nuevo.');
        }

        try {
            $provisioning->provision($payload);
        } catch (ValidationException $e) {
            $message = collect($e->errors())->flatten()->first() ?? 'No pudimos crear tu cuenta.';

            return redirect()->route('signup.create')->with('error', $message);
        }

        return redirect()->route('signup.success');
    }

    public function success(): Response
    {
        return Inertia::render('Signup/Success', [
            'loginUrl' => config('tenancy.crm_login_url'),
        ]);
    }
}
