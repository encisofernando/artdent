<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index(Request $r)
    {
        $cid = $r->user()->company_id;

        $q = User::query()
            ->where('company_id', $cid)
            ->orderByDesc('id');

        if ($s = $r->get('q')) {
            $q->where(function ($w) use ($s) {
                $w->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            });
        }

        if ($r->filled('is_active')) {
            $q->where('is_active', (int) $r->get('is_active') ? 1 : 0);
        }

        if ($pm = $r->get('pricing_mode')) {
            $q->where('pricing_mode', $pm);
        }

        $perPage = (int) ($r->get('per_page') ?: 25);
        $perPage = max(5, min(200, $perPage));

        return $q->paginate($perPage);
    }

    public function show(Request $r, User $user)
    {
        $this->authorizeUser($r, $user);
        return $user;
    }

    public function store(Request $r)
    {
        $cid = $r->user()->company_id;

        $data = $r->validate([
            'name' => ['required', 'string', 'max:191'],
            'email' => [
                'required',
                'email',
                'max:191',
                Rule::unique('users', 'email')->where(fn ($q) => $q->where('company_id', $cid)),
            ],
            'password' => ['required', 'string', 'min:6'],
            'pricing_mode' => ['sometimes', 'in:b2c,b2b'],
            'b2b_discount_percent' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'in:0,1'],
        ]);

        $data['company_id'] = $cid;
        $data['pricing_mode'] = $data['pricing_mode'] ?? 'b2c';
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = array_key_exists('is_active', $data) ? (int) $data['is_active'] : 1;

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function update(Request $r, User $user)
    {
        $this->authorizeUser($r, $user);
        $cid = $r->user()->company_id;

        $data = $r->validate([
            'name' => ['sometimes', 'string', 'max:191'],
            'email' => [
                'sometimes',
                'email',
                'max:191',
                Rule::unique('users', 'email')
                    ->where(fn ($q) => $q->where('company_id', $cid))
                    ->ignore($user->id),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'pricing_mode' => ['sometimes', 'in:b2c,b2b'],
            'b2b_discount_percent' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'in:0,1'],
        ]);

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        $user->update($data);

        return $user;
    }

    public function destroy(Request $r, User $user)
    {
        $this->authorizeUser($r, $user);
        $user->delete();
        return response()->json(['ok' => true]);
    }

    protected function authorizeUser(Request $r, User $u)
    {
        $cid = $r->user()->company_id;
        abort_unless($u->company_id == $cid, 403, 'Forbidden');
    }
}
