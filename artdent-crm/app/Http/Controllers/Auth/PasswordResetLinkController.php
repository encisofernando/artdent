<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\CrmMode;
use App\Support\TenantEmailResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * En multi-tenant, el usuario vive en la base de SU tenant, no en la
     * central — hay que resolver el tenant por email (mismo criterio que
     * LoginRequest::authenticate()) e inicializar esa tenancy antes de que
     * Password::sendResetLink() pueda encontrar al usuario y escribir el
     * token en su tabla password_reset_tokens.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = Str::lower(trim((string) $request->input('email')));

        if (CrmMode::isMultiTenant()) {
            $tenant = TenantEmailResolver::resolve($email);

            if (! $tenant) {
                throw ValidationException::withMessages([
                    'email' => [trans(Password::INVALID_USER)],
                ]);
            }

            tenancy()->initialize($tenant);
        }

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(['email' => $email]);

        if (tenancy()->initialized) {
            tenancy()->end();
        }

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
