<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $data = $req->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','unique:users,email'],
            'password' => ['required','string','min:6','confirmed'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $req)
    {
        $credentials = $req->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales inválidas.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $req)
    {
        return response()->json(['user' => $req->user()]);
    }

    public function logout(Request $req)
    {
        $req->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'OK']);
    }
     /**
     * ✅ Envía el email de restablecimiento de contraseña.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required','email']]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status), // "We have emailed your password reset link!"
            ], 200);
        }

        return response()->json([
            'message' => __($status),   // "We can't find a user with that email address."
        ], 400);
    }

    /**
     * Crea/actualiza contraseña para un usuario existente.
     * Mantiene compatibilidad con el flujo "CrearContraseña" del front.
     */
    public function createPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string','min:6','confirmed'],
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
