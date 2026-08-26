<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeCustomer;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
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

        // Mismo criterio que LoginRequest (staff): 5 intentos por
        // email+IP — antes este login no tenía ningún límite, a diferencia
        // del de staff.
        $throttleKey = Str::transliterate(Str::lower($request->string('email')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => ["Demasiados intentos. Probá de nuevo en {$seconds} segundos."],
            ]);
        }

        $customer = Customer::query()
            ->where('email', $request->email)
            ->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => ['Correo o contraseña incorrectos.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        $this->linkGuestOrders($customer);

        Auth::guard('customer')->login($customer, true);
        $request->session()->regenerate();

        return response()->json([
            'user' => $this->customerData($customer),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        // Puede existir una cuenta "cáscara" (sin password) creada por la
        // acreditación automática de puntos de un checkout invitado — en ese
        // caso el registro la reclama en vez de fallar por email/dni duplicado.
        $shell = Customer::query()
            ->whereNull('password')
            ->where(function ($query) use ($request): void {
                $query->where('email', $request->input('email'));
                if ($request->filled('dni')) {
                    $query->orWhere('dni', $request->input('dni'));
                }
            })
            ->first();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('customers', 'email')->ignore($shell?->id)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->ignore($shell?->id)->whereNotNull('phone')],
            'dni' => ['nullable', 'string', 'max:20', Rule::unique('customers', 'dni')->ignore($shell?->id)->whereNotNull('dni')],
            'cuit' => ['nullable', 'string', 'max:20'],
            'accepts_marketing' => ['nullable', 'boolean'],
        ]);

        $attributes = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'dni' => $validated['dni'] ?? null,
            'cuit' => $validated['cuit'] ?? null,
            'accepts_marketing' => $validated['accepts_marketing'] ?? false,
            'is_active' => true,
        ];

        if ($shell) {
            $shell->update($attributes);
            $customer = $shell;
        } else {
            $customer = Customer::create($attributes);
        }

        Mail::to($customer->email)->queue(new WelcomeCustomer($customer));

        $this->linkGuestOrders($customer);

        Auth::guard('customer')->login($customer, true);
        $request->session()->regenerate();

        return response()->json([
            'user' => $this->customerData($customer),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->customerData($request->user('customer')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('customer')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

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
