<?php

namespace App\Http\Controllers;

use App\Models\PaymentCredentialSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Credenciales de Mercado Pago y Nave con las que ArtCode cobra la
 * suscripción SaaS de sus tenants — separadas de las credenciales de pago
 * que cada tenant configura para SU propio negocio dentro de artdent-crm.
 */
class PaymentCredentialController extends Controller
{
    // Mismos endpoints que usa NaveService del lado artdent-crm (Nave no
    // expone un SDK, es autenticación OAuth client_credentials estándar).
    private const NAVE_AUTH_SANDBOX = 'https://homoservices.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate';

    private const NAVE_AUTH_PROD = 'https://services.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate';

    private const NAVE_AUDIENCE = 'https://naranja.com/ranty/merchants/api';

    public function edit(): Response
    {
        $credentials = PaymentCredentialSetting::current();

        return Inertia::render('PaymentCredentials/Edit', [
            'credentials' => [
                'mp_public_key' => $credentials?->mp_public_key,
                'mp_access_token_masked' => PaymentCredentialSetting::mask($credentials?->mp_access_token),
                'nave_client_id' => $credentials?->nave_client_id,
                'nave_client_secret_masked' => PaymentCredentialSetting::mask($credentials?->nave_client_secret),
                'nave_pos_id' => $credentials?->nave_pos_id,
                'nave_sandbox_mode' => $credentials?->nave_sandbox_mode ?? true,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mp_public_key' => ['nullable', 'string', 'max:255'],
            'mp_access_token' => ['nullable', 'string', 'max:500'],
            'nave_client_id' => ['nullable', 'string', 'max:255'],
            'nave_client_secret' => ['nullable', 'string', 'max:500'],
            'nave_pos_id' => ['nullable', 'string', 'max:100'],
            'nave_sandbox_mode' => ['required', 'boolean'],
        ]);

        $credentials = PaymentCredentialSetting::current() ?? new PaymentCredentialSetting;

        // Los campos secretos sólo se pisan si el usuario escribió un valor
        // nuevo — el form nunca manda el secreto guardado (llega vacío desde
        // el frontend), así que un submit sin tocarlos no los borra.
        $credentials->fill([
            'mp_public_key' => $validated['mp_public_key'] ?? null,
            'nave_client_id' => $validated['nave_client_id'] ?? null,
            'nave_pos_id' => $validated['nave_pos_id'] ?? null,
            'nave_sandbox_mode' => $validated['nave_sandbox_mode'],
        ]);

        if (! empty($validated['mp_access_token'])) {
            $credentials->mp_access_token = $validated['mp_access_token'];
        }

        if (! empty($validated['nave_client_secret'])) {
            $credentials->nave_client_secret = $validated['nave_client_secret'];
        }

        $credentials->save();

        return back()->with('success', 'Credenciales de pago actualizadas.');
    }

    public function testConnection(Request $request)
    {
        $request->validate(['provider' => 'required|in:mp,nave']);

        $credentials = PaymentCredentialSetting::current();

        if (! $credentials) {
            return response()->json(['success' => false, 'error' => 'No hay credenciales guardadas todavía.']);
        }

        return $request->provider === 'mp'
            ? $this->testMercadoPago($credentials)
            : $this->testNave($credentials);
    }

    private function testMercadoPago(PaymentCredentialSetting $credentials)
    {
        if (empty($credentials->mp_access_token)) {
            return response()->json(['success' => false, 'error' => 'Falta el Access Token de Mercado Pago.']);
        }

        $response = Http::withToken($credentials->mp_access_token)
            ->get('https://api.mercadopago.com/users/me');

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'error' => 'Mercado Pago rechazó el token: '.($response->json('message') ?? $response->body()),
            ]);
        }

        $data = $response->json();

        return response()->json([
            'success' => true,
            'checks' => [
                ['label' => 'Cuenta', 'ok' => true, 'detail' => $data['nickname'] ?? $data['email'] ?? "ID {$data['id']}"],
                ['label' => 'Sitio', 'ok' => true, 'detail' => $data['site_id'] ?? '—'],
            ],
        ]);
    }

    private function testNave(PaymentCredentialSetting $credentials)
    {
        if (empty($credentials->nave_client_id) || empty($credentials->nave_client_secret)) {
            return response()->json(['success' => false, 'error' => 'Faltan Client ID / Client Secret de Nave.']);
        }

        $endpoint = $credentials->nave_sandbox_mode ? self::NAVE_AUTH_SANDBOX : self::NAVE_AUTH_PROD;

        $response = Http::post($endpoint, [
            'client_id' => $credentials->nave_client_id,
            'client_secret' => $credentials->nave_client_secret,
            'audience' => self::NAVE_AUDIENCE,
        ]);

        if ($response->failed() || empty($response->json('access_token'))) {
            return response()->json([
                'success' => false,
                'error' => 'Nave rechazó las credenciales: '.($response->body() ?: 'sin detalle'),
            ]);
        }

        return response()->json([
            'success' => true,
            'checks' => [
                ['label' => 'Autenticación OAuth', 'ok' => true, 'detail' => 'Token obtenido correctamente'],
                ['label' => 'Entorno', 'ok' => true, 'detail' => $credentials->nave_sandbox_mode ? 'Sandbox' : 'Producción'],
            ],
        ]);
    }
}
