<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeCustomer;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $customer = Customer::query()
            ->where('email', $request->email)
            ->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['Correo o contraseña incorrectos.'],
            ]);
        }

        $this->linkGuestOrders($customer);

        $token = $customer->createToken('ecommerce')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->customerData($customer),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:customers,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->whereNotNull('phone')],
            'dni' => ['nullable', 'string', 'max:20', Rule::unique('customers', 'dni')->whereNotNull('dni')],
            'cuit' => ['nullable', 'string', 'max:20'],
            'accepts_marketing' => ['nullable', 'boolean'],
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'dni' => $validated['dni'] ?? null,
            'cuit' => $validated['cuit'] ?? null,
            'accepts_marketing' => $validated['accepts_marketing'] ?? false,
            'is_active' => true,
        ]);

        Mail::to($customer->email)->queue(new WelcomeCustomer($customer));

        $this->linkGuestOrders($customer);

        $token = $customer->createToken('ecommerce')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->customerData($customer),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->customerData($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        try {
            Password::broker('customers')->sendResetLink(
                $request->only('email')
            );
        } catch (\Throwable $e) {
            \Log::error('Password reset email failed: '.$e->getMessage(), [
                'email' => $request->email,
            ]);
        }

        // Always return success to avoid email enumeration
        return response()->json([
            'message' => 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::broker('customers')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Customer $customer, string $password): void {
                $customer->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => ['El enlace de recuperación no es válido o ya expiró.'],
            ]);
        }

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
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

        $query->update([
            'customer_id' => $customer->id,
        ]);
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
        ];
    }
}
