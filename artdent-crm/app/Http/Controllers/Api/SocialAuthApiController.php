<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SocialAuthApiController extends Controller
{
    /**
     * Login / Register via social provider.
     *
     * Frontend sends a short-lived access_token obtained from the provider SDK
     * (Google Identity Services or Facebook JS SDK).
     * Backend verifies the token against the provider's API, finds or creates
     * a Customer, links accounts if the email already exists, and returns a
     * Sanctum token.
     *
     * POST /api/auth/social-login
     * Body: { provider: "google"|"facebook", access_token: "..." }
     */
    public function loginWithSocial(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string', 'in:google,facebook'],
            'access_token' => ['required', 'string'],
        ]);

        $provider = $request->input('provider');
        $accessToken = $request->input('access_token');

        // 1. Verify token with provider and fetch social user data
        $socialUser = $this->fetchSocialUser($provider, $accessToken);

        if (! $socialUser) {
            return response()->json(['message' => 'Token social inválido o expirado.'], 401);
        }

        $socialId = $socialUser['id'];
        $socialEmail = $socialUser['email'] ?? null;
        $socialName = $socialUser['name'] ?? null;
        $socialAvatar = $socialUser['avatar'] ?? null;

        $providerIdField = $provider.'_id'; // 'google_id' | 'facebook_id'

        // 2. Find customer by social provider ID (already linked)
        $customer = Customer::where($providerIdField, $socialId)->first();

        // 3. If not found by social ID, try to find by email to link accounts
        if (! $customer && $socialEmail) {
            $customer = Customer::where('email', $socialEmail)->first();
            if ($customer) {
                // Link the social account to the existing customer
                $customer->update([$providerIdField => $socialId]);
            }
        }

        // 4. If still not found, create a new customer
        if (! $customer) {
            if (! $socialEmail) {
                return response()->json([
                    'message' => 'No se pudo obtener el email del proveedor social. Es necesario para crear la cuenta.',
                ], 422);
            }

            $customer = Customer::create([
                'name' => $socialName ?? 'Usuario',
                'email' => $socialEmail,
                'password' => null, // no password for social-only accounts
                $providerIdField => $socialId,
                'email_verified_at' => now(), // social email is already verified
                'is_active' => true,
                'accepts_marketing' => false,
            ]);
        }

        // 5. Link any guest orders by email / dni
        $this->linkGuestOrders($customer);

        // 6. Issue Sanctum token
        $token = $customer->createToken('ecommerce-social')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->customerData($customer),
        ]);
    }

    /**
     * Verify the access token against the social provider API and return
     * normalized user data.
     *
     * @return array{id:string,email:string|null,name:string|null,avatar:string|null}|null
     */
    private function fetchSocialUser(string $provider, string $accessToken): ?array
    {
        try {
            if ($provider === 'google') {
                // Google tokeninfo endpoint works for both OAuth2 tokens and ID tokens
                $response = Http::get('https://www.googleapis.com/oauth2/v3/userinfo', [
                    'access_token' => $accessToken,
                ])->throw()->json();

                return [
                    'id' => $response['sub'] ?? null,
                    'email' => $response['email'] ?? null,
                    'name' => $response['name'] ?? null,
                    'avatar' => $response['picture'] ?? null,
                ];
            }

            if ($provider === 'facebook') {
                // Facebook Graph API: verify token and fetch user data
                $response = Http::get('https://graph.facebook.com/me', [
                    'access_token' => $accessToken,
                    'fields' => 'id,name,email,picture.type(large)',
                ])->throw()->json();

                return [
                    'id' => $response['id'] ?? null,
                    'email' => $response['email'] ?? null,
                    'name' => $response['name'] ?? null,
                    'avatar' => $response['picture']['data']['url'] ?? null,
                ];
            }
        } catch (\Throwable $e) {
            \Log::error("Social auth [{$provider}] error: ".$e->getMessage());
        }

        return null;
    }

    private function linkGuestOrders(Customer $customer): void
    {
        $query = EcommerceOrder::query()->whereNull('customer_id');
        $email = strtolower(trim($customer->email));
        $dni = $customer->dni;

        $query->where(function ($q) use ($email, $dni): void {
            $q->where('guest_email', $email);
            if ($dni) {
                $q->orWhere('guest_dni', $dni);
            }
        });

        $query->update(['customer_id' => $customer->id]);
    }

    /** @return array<string, mixed> */
    private function customerData(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'dni' => $customer->dni,
            'address' => $customer->address,
            'city' => $customer->city,
            'province' => $customer->province,
            'postal_code' => $customer->postal_code,
            'has_password' => ! is_null($customer->password),
        ];
    }
}
