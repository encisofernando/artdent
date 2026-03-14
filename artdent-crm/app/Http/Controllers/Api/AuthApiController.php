<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

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
            'phone' => ['nullable', 'string', 'max:50'],
            'dni' => ['nullable', 'string', 'max:20'],
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'dni' => $validated['dni'] ?? null,
            'is_active' => true,
        ]);

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
