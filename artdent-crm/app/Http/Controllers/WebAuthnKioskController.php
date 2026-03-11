<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\CollaboratorWebAuthnCredential;
use Carbon\Carbon;
use CBOR\Decoder;
use CBOR\MapObject;
use Cose\Algorithm\Signature\ECDSA\ES256;
use Cose\Algorithm\Signature\RSA\RS256;
use Cose\Key\Ec2Key;
use Cose\Key\Key;
use Cose\Key\RsaKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Webauthn\AuthenticatorDataLoader;

class WebAuthnKioskController extends Controller
{
    /** Returns base64url-encoded string from raw bytes. */
    private function base64url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    /** Decodes a base64url string to raw bytes. */
    private function base64urlDecode(string $input): string
    {
        $padded = str_pad(strtr($input, '-_', '+/'), strlen($input) + (4 - strlen($input) % 4) % 4, '=');

        return base64_decode($padded, true) ?: throw new \RuntimeException('Invalid base64url input');
    }

    /** Returns WebAuthn RP ID (hostname) from APP_URL config. */
    private function rpId(): string
    {
        return parse_url(config('app.url'), PHP_URL_HOST) ?? 'localhost';
    }

    /**
     * GET /collaborators/{collaborator}/webauthn/registration-options
     * Returns PublicKeyCredentialCreationOptions JSON.
     */
    public function registrationOptions(Request $request, Collaborator $collaborator): JsonResponse
    {
        $challenge = random_bytes(32);
        session([
            'webauthn_reg_challenge' => base64_encode($challenge),
            'webauthn_reg_collaborator' => $collaborator->id,
        ]);

        return response()->json([
            'challenge' => $this->base64url($challenge),
            'rp' => [
                'name' => config('app.name'),
                'id' => $this->rpId(),
            ],
            'user' => [
                'id' => $this->base64url("collab-{$collaborator->id}"),
                'name' => $collaborator->email ?? "collab-{$collaborator->id}",
                'displayName' => $collaborator->name,
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],   // ES256
                ['type' => 'public-key', 'alg' => -257],  // RS256
            ],
            'authenticatorSelection' => [
                'authenticatorAttachment' => 'platform',
                'residentKey' => 'required',
                'userVerification' => 'required',
            ],
            'timeout' => 60000,
            'attestation' => 'none',
        ]);
    }

    /**
     * POST /collaborators/{collaborator}/webauthn/register
     * Verifies and stores a new WebAuthn credential.
     */
    public function register(Request $request, Collaborator $collaborator): JsonResponse
    {
        $request->validate([
            'id' => 'required|string',
            'rawId' => 'required|string',
            'response.clientDataJSON' => 'required|string',
            'response.attestationObject' => 'required|string',
            'device_label' => 'nullable|string|max:100',
        ]);

        $storedChallenge = session('webauthn_reg_challenge');
        $storedCollaboratorId = session('webauthn_reg_collaborator');

        if (! $storedChallenge || $storedCollaboratorId !== $collaborator->id) {
            return response()->json(['error' => 'Sesión de registro inválida. Intentá de nuevo.'], 422);
        }

        // Parse and verify clientDataJSON
        $clientDataJSON = $this->base64urlDecode($request->input('response.clientDataJSON'));
        $clientData = json_decode($clientDataJSON, true);

        if ($clientData['type'] !== 'webauthn.create') {
            return response()->json(['error' => 'Tipo de operación WebAuthn inválido.'], 422);
        }

        $receivedChallenge = $clientData['challenge'];
        $expectedChallenge = $this->base64url(base64_decode($storedChallenge));

        if (! hash_equals($expectedChallenge, $receivedChallenge)) {
            return response()->json(['error' => 'Challenge de registro inválido.'], 422);
        }

        $origin = $clientData['origin'] ?? '';
        $appUrl = rtrim(config('app.url'), '/');
        if ($origin !== $appUrl) {
            return response()->json(['error' => "Origen inválido: {$origin}"], 422);
        }

        // Parse attestationObject (CBOR)
        $attestationObject = $this->base64urlDecode($request->input('response.attestationObject'));
        $decoder = Decoder::create();
        $stream = new \CBOR\StringStream($attestationObject);
        $decoded = $decoder->decode($stream);

        if (! $decoded instanceof MapObject) {
            return response()->json(['error' => 'Objeto de attestation inválido.'], 422);
        }

        $normalized = $decoded->normalize();
        $authDataBin = $normalized['authData'] ?? null;

        if (! $authDataBin) {
            return response()->json(['error' => 'authData ausente en attestation.'], 422);
        }

        // Parse authData using the library
        $authDataLoader = AuthenticatorDataLoader::create();
        $authData = $authDataLoader->load($authDataBin);

        // Verify rpIdHash
        $expectedRpIdHash = hash('sha256', $this->rpId(), true);
        if (! hash_equals($expectedRpIdHash, $authData->rpIdHash)) {
            return response()->json(['error' => 'RP ID hash inválido.'], 422);
        }

        if (! $authData->isUserPresent() || ! $authData->isUserVerified()) {
            return response()->json(['error' => 'El autenticador no verificó la presencia del usuario.'], 422);
        }

        $attestedData = $authData->attestedCredentialData;
        if (! $attestedData) {
            return response()->json(['error' => 'No se encontraron datos de credencial.'], 422);
        }

        $credentialId = $this->base64url($attestedData->credentialId);
        $publicKeyCbor = $attestedData->credentialPublicKey;

        // Store the credential (one per collaborator per device, replace if same credential_id)
        CollaboratorWebAuthnCredential::updateOrCreate(
            [
                'collaborator_id' => $collaborator->id,
                'credential_id' => $credentialId,
            ],
            [
                'public_key' => base64_encode($publicKeyCbor),
                'sign_count' => $authData->signCount,
                'device_label' => $request->input('device_label') ?: 'Dispositivo',
                'user_handle' => $this->base64url("collab-{$collaborator->id}"),
            ]
        );

        session()->forget(['webauthn_reg_challenge', 'webauthn_reg_collaborator']);

        return response()->json([
            'success' => true,
            'credential_id' => $credentialId,
            'collaborator' => $collaborator->name,
        ]);
    }

    /**
     * POST /attendance-kiosk/webauthn/authentication-options
     * Returns PublicKeyCredentialRequestOptions for a discoverable-credential assertion.
     */
    public function authenticationOptions(Request $request): JsonResponse
    {
        $challenge = random_bytes(32);
        session(['webauthn_auth_challenge' => base64_encode($challenge)]);

        return response()->json([
            'challenge' => $this->base64url($challenge),
            'rpId' => $this->rpId(),
            'allowCredentials' => [],  // discoverable — no pre-selection
            'userVerification' => 'required',
            'timeout' => 60000,
        ]);
    }

    /**
     * POST /attendance-kiosk/webauthn/verify
     * Verifies an assertion and records attendance.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|string',
            'response.clientDataJSON' => 'required|string',
            'response.authenticatorData' => 'required|string',
            'response.signature' => 'required|string',
        ]);

        $storedChallenge = session('webauthn_auth_challenge');
        if (! $storedChallenge) {
            return response()->json(['error' => 'No hay sesión de autenticación activa.'], 422);
        }

        // Parse and verify clientDataJSON
        $clientDataJSON = $this->base64urlDecode($request->input('response.clientDataJSON'));
        $clientData = json_decode($clientDataJSON, true);

        if ($clientData['type'] !== 'webauthn.get') {
            return response()->json(['error' => 'Tipo de operación WebAuthn inválido.'], 422);
        }

        $receivedChallenge = $clientData['challenge'];
        $expectedChallenge = $this->base64url(base64_decode($storedChallenge));

        if (! hash_equals($expectedChallenge, $receivedChallenge)) {
            return response()->json(['error' => 'Challenge de autenticación inválido.'], 422);
        }

        $origin = $clientData['origin'] ?? '';
        $appUrl = rtrim(config('app.url'), '/');
        if ($origin !== $appUrl) {
            return response()->json(['error' => "Origen inválido: {$origin}"], 422);
        }

        session()->forget('webauthn_auth_challenge');

        // Find the credential
        $credentialId = $request->input('id');
        $credential = CollaboratorWebAuthnCredential::where('credential_id', $credentialId)->first();

        if (! $credential) {
            return response()->json(['error' => 'Huella no reconocida. Registrá el dispositivo primero.'], 422);
        }

        $collaborator = Collaborator::where('id', $credential->collaborator_id)
            ->where('is_active', true)
            ->first();

        if (! $collaborator) {
            return response()->json(['error' => 'Colaborador inactivo o no encontrado.'], 422);
        }

        // Parse authData
        $authDataBin = $this->base64urlDecode($request->input('response.authenticatorData'));
        $authDataLoader = AuthenticatorDataLoader::create();
        $authData = $authDataLoader->load($authDataBin);

        // Verify rpIdHash
        $expectedRpIdHash = hash('sha256', $this->rpId(), true);
        if (! hash_equals($expectedRpIdHash, $authData->rpIdHash)) {
            return response()->json(['error' => 'RP ID hash inválido.'], 422);
        }

        if (! $authData->isUserPresent() || ! $authData->isUserVerified()) {
            return response()->json(['error' => 'Verificación biométrica fallida.'], 422);
        }

        // Verify signature
        $signatureBin = $this->base64urlDecode($request->input('response.signature'));
        $clientDataHash = hash('sha256', $clientDataJSON, true);
        $verificationData = $authDataBin.$clientDataHash;

        $publicKeyCbor = base64_decode($credential->public_key);
        $decoder = Decoder::create();
        $stream = new \CBOR\StringStream($publicKeyCbor);
        $cborKey = $decoder->decode($stream);

        if (! $cborKey instanceof MapObject) {
            return response()->json(['error' => 'Clave pública almacenada inválida.'], 422);
        }

        $keyData = $cborKey->normalize();
        $keyType = $keyData[Key::TYPE] ?? null;

        $verified = false;

        try {
            if ($keyType === Key::TYPE_EC2 || $keyType === '2') {
                $ec2Key = Ec2Key::create($this->normalizeKeyData($keyData));
                $algo = ES256::create();
                $verified = $algo->verify($verificationData, $ec2Key, $signatureBin);
            } elseif ($keyType === Key::TYPE_RSA || $keyType === '3') {
                $rsaKey = RsaKey::create($this->normalizeKeyData($keyData));
                $algo = RS256::create();
                $verified = $algo->verify($verificationData, $rsaKey, $signatureBin);
            }
        } catch (\Throwable) {
            $verified = false;
        }

        if (! $verified) {
            return response()->json(['error' => 'Firma biométrica inválida. Intentá de nuevo.'], 422);
        }

        // Update sign_count (replay attack prevention)
        if ($authData->signCount > 0 && $authData->signCount <= $credential->sign_count) {
            return response()->json(['error' => 'Contador de firma inválido. Posible ataque de réplica.'], 422);
        }

        $credential->update(['sign_count' => $authData->signCount]);

        return $this->recordAttendance($request, $collaborator);
    }

    /**
     * Normalizes CBOR-decoded map keys to the integer keys the COSE library expects.
     *
     * @param  array<mixed, mixed>  $data
     * @return array<int|string, mixed>
     */
    private function normalizeKeyData(array $data): array
    {
        $normalized = [];
        foreach ($data as $k => $v) {
            $intKey = is_numeric($k) ? (int) $k : $k;
            $normalized[$intKey] = is_string($v) ? $v : $v;
        }

        return $normalized;
    }

    private function recordAttendance(Request $request, Collaborator $collaborator): JsonResponse
    {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now()->toTimeString();
        $ip = $request->ip();
        $device = $request->userAgent();

        $attendance = CollaboratorAttendance::where('collaborator_id', $collaborator->id)
            ->where('work_date', $today)
            ->first();

        if (! $attendance) {
            CollaboratorAttendance::create([
                'company_id' => $collaborator->company_id,
                'collaborator_id' => $collaborator->id,
                'work_date' => $today,
                'time_in' => $now,
                'hourly_rate_snap' => $collaborator->hourly_rate,
                'method' => 'webauthn',
                'ip_address' => $ip,
                'device_info' => substr($device ?? '', 0, 255),
                'photo_path' => null,
            ]);

            return response()->json([
                'action' => 'in',
                'collaborator' => $collaborator->name,
                'time' => $now,
            ]);
        }

        if (! $attendance->time_out) {
            $timeIn = Carbon::parse("{$today} {$attendance->time_in}");
            $timeOut = Carbon::now();
            $hours = round($timeOut->diffInMinutes($timeIn) / 60, 2);
            $amount = round($hours * $attendance->hourly_rate_snap, 2);

            $attendance->update([
                'time_out' => $now,
                'hours' => $hours,
                'amount' => $amount,
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
