<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $r){
        $data = $r->validate([
            'company.name' => 'required|string|max:191',
            'company.tax_id' => 'nullable|string|max:32',
            'name' => 'required|string|max:191',
            'email' => 'required|email|unique:users,email',
            'password' => ['required','confirmed', Password::min(6)],
        ]);

        $user = DB::transaction(function() use($data){
            $company = Company::create([
                'name' => $data['company']['name'],
                'tax_id' => $data['company']['tax_id'] ?? null,
            ]);
            return User::create([
                'company_id' => $company->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
        });

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user->load('company')],201);
    }

    public function login(Request $r){
        $cred = $r->validate(['email'=>'required|email','password'=>'required']);
        $user = User::where('email',$cred['email'])->first();
        if(!$user || !Hash::check($cred['password'],$user->password)){
            return response()->json(['message'=>'Credenciales inválidas'],401);
        }
        $token = $user->createToken('api')->plainTextToken;
        return ['token'=>$token,'user'=>$user->load('company')];
    }

    public function me(Request $r){ return $r->user()->load('company'); }

    public function logout(Request $r){
        $r->user()->currentAccessToken()?->delete();
        return response()->json(['ok'=>true]);
    }
}
