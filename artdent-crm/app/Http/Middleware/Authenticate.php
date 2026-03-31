<?php

namespace App\Http\Middleware;

use App\Http\Middleware\Concerns\BootstrapsTenantFromSession;
use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

class Authenticate extends \Illuminate\Auth\Middleware\Authenticate
{
    use BootstrapsTenantFromSession;

    public function __construct(Auth $auth)
    {
        parent::__construct($auth);
    }

    public function handle($request, Closure $next, ...$guards)
    {
        $this->bootstrapTenantFromSession($request);

        return parent::handle($request, $next, ...$guards);
    }

    protected function unauthenticated($request, array $guards)
    {
        parent::unauthenticated($request, $guards);
    }
}
