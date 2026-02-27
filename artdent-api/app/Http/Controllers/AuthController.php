<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Carbon\Carbon;

/**
 * AuthController — Refresh Token Rotation
 * ─────────────────────────────────────────────────────────────────────────────
 * FLUJO:
 *   1. POST /api/auth/login
 *      → Crea dos tokens Sanctum:
 *          · access_token  (15 min)  → devuelto en JSON, el front lo guarda en RAM
 *          · refresh_token (30 días) → seteado en cookie httpOnly, Secure
 *      → El front guarda SOLO el access_token en memoria (variable JS)
 *
 *   2. Requests normales
 *      → Authorization: Bearer {access_token}
 *      → El refresh_token viaja solo como cookie (no necesita código extra)
 *
 *   3. POST /api/auth/refresh  (llamado automáticamente cuando el access expira)
 *      → Valida la cookie refresh_token
 *      → Invalida el refresh_token usado (rotación: un solo uso)
 *      → Crea un access_token nuevo + refresh_token nuevo
 *      → Devuelve nuevo access_token en JSON + setea nueva cookie
 *
 *   4. POST /api/auth/logout
 *      → Invalida ambos tokens en la DB
 *      → Borra la cookie
 *
 * SEGURIDAD:
 *   ✅ access_token en RAM → XSS no puede robarlo entre sesiones
 *   ✅ refresh_token httpOnly → XSS no puede leerlo nunca
 *   ✅ refresh_token de un solo uso → si se roba, el atacante SOLO puede
 *      usarlo una vez y el usuario legítimo queda deslogueado (detección)
 *   ✅ SameSite=Lax → protege de CSRF en la mayoría de escenarios
 *   ✅ Secure (solo HTTPS en producción)
 */
class AuthController extends Controller
{
    // ── Duración de los tokens ────────────────────────────────────────────────
    private const ACCESS_MINUTES   = 15;         // 15 minutos
    private const REFRESH_DAYS     = 30;          // 30 días
    private const COOKIE_NAME      = 'refresh_token';

    // ── Helper: crear par de tokens ───────────────────────────────────────────
    private function issueTokenPair(User $user): array
    {
        $accessExpiry  = Carbon::now()->addMinutes(self::ACCESS_MINUTES);
        $refreshExpiry = Carbon::now()->addDays(self::REFRESH_DAYS);

        // Revocar tokens anteriores del mismo nombre para no acumular
        $user->tokens()->where('name', 'access_token')->delete();
        $user->tokens()->where('name', 'refresh_token')->delete();

        $accessToken = $user->createToken(
            'access_token',
            ['*'],                  // abilities
            $accessExpiry           // requires Sanctum 3.x + expires_at column
        )->plainTextToken;

        $refreshToken = $user->createToken(
            'refresh_token',
            ['refresh'],            // ability restringida
            $refreshExpiry
        )->plainTextToken;

        return [
            'access_token'  => $accessToken,
            'access_expiry' => $accessExpiry->toISOString(),
            'refresh_token' => $refreshToken,
        ];
    }

    // ── Helper: construir cookie httpOnly ─────────────────────────────────────
    private function refreshCookie(string $token): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            self::COOKIE_NAME,
            $token,
            self::REFRESH_DAYS * 24 * 60,           // minutes
            '/',                                     // path
            config('session.domain'),                // e.g. .artdent.com.ar
            config('app.env') === 'production',      // secure (HTTPS only in prod)
            true,                                    // httpOnly ← JS no puede leerla
            false,
            'Lax'                                    // SameSite
        );
    }

    // ── Helper: cookie de borrado ─────────────────────────────────────────────
    private function clearRefreshCookie(): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            self::COOKIE_NAME,
            '',
            -1,                                      // expira inmediatamente
            '/',
            config('session.domain'),
            config('app.env') === 'production',
            true,
            false,
            'Lax'
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ────────────────────────────────────────────────────────────────────────
    public function register(Request $req)
    {
        $data = $req->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $tokens = $this->issueTokenPair($user);

        return response()
            ->json([
                'user'         => $user,
                'access_token' => $tokens['access_token'],
                'expires_at'   => $tokens['access_expiry'],
            ], 201)
            ->withCookie($this->refreshCookie($tokens['refresh_token']));
    }

    // ────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ────────────────────────────────────────────────────────────────────────
    public function login(Request $req)
    {
        $credentials = $req->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales inválidas.'],
            ]);
        }

        $tokens = $this->issueTokenPair($user);

        return response()
            ->json([
                'user'         => $user,
                'access_token' => $tokens['access_token'],
                'expires_at'   => $tokens['access_expiry'],
            ])
            ->withCookie($this->refreshCookie($tokens['refresh_token']));
    }

    // ────────────────────────────────────────────────────────────────────────
    // REFRESH  —  POST /api/auth/refresh
    // ────────────────────────────────────────────────────────────────────────
    public function refresh(Request $req)
    {
        $refreshToken = $req->cookie(self::COOKIE_NAME);

        if (!$refreshToken) {
            return response()->json(['message' => 'No refresh token.'], 401);
        }

        // Extraer el ID del token (formato: "id|hash")
        $tokenId = explode('|', $refreshToken)[0] ?? null;

        if (!$tokenId) {
            return response()
                ->json(['message' => 'Token inválido.'], 401)
                ->withCookie($this->clearRefreshCookie());
        }

        // Buscar el token en la DB
        $personalToken = \Laravel\Sanctum\PersonalAccessToken::find($tokenId);

        if (
            !$personalToken
            || !hash_equals($personalToken->token, hash('sha256', explode('|', $refreshToken)[1] ?? ''))
            || $personalToken->name !== 'refresh_token'
            || ($personalToken->expires_at && $personalToken->expires_at->isPast())
        ) {
            // Token inválido o expirado — limpiar cookie
            return response()
                ->json(['message' => 'Refresh token inválido o expirado.'], 401)
                ->withCookie($this->clearRefreshCookie());
        }

        $user = $personalToken->tokenable;

        // ── ROTACIÓN: eliminar el refresh token usado ─────────────────────
        $personalToken->delete();

        // Emitir nuevo par
        $tokens = $this->issueTokenPair($user);

        return response()
            ->json([
                'user'         => $user,
                'access_token' => $tokens['access_token'],
                'expires_at'   => $tokens['access_expiry'],
            ])
            ->withCookie($this->refreshCookie($tokens['refresh_token']));
    }

    // ────────────────────────────────────────────────────────────────────────
    // ME
    // ────────────────────────────────────────────────────────────────────────
    public function me(Request $req)
    {
        return response()->json(['user' => $req->user()]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ────────────────────────────────────────────────────────────────────────
    public function logout(Request $req)
    {
        // Revocar access token actual
        $req->user()?->currentAccessToken()?->delete();

        // Revocar refresh token si aún existe en DB
        $refreshRaw = $req->cookie(self::COOKIE_NAME);
        if ($refreshRaw) {
            $tokenId = explode('|', $refreshRaw)[0] ?? null;
            if ($tokenId) {
                \Laravel\Sanctum\PersonalAccessToken::find($tokenId)?->delete();
            }
        }

        return response()
            ->json(['message' => 'OK'])
            ->withCookie($this->clearRefreshCookie());
    }

    // ────────────────────────────────────────────────────────────────────────
    // FORGOT PASSWORD
    // ────────────────────────────────────────────────────────────────────────
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 400);
    }

    // ────────────────────────────────────────────────────────────────────────
    // CREATE PASSWORD
    // ────────────────────────────────────────────────────────────────────────
    public function createPassword(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => 'OK']);
    }
}
