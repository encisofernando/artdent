<?php

namespace App\Filament\Pages\Auth;

use Filament\Auth\Pages\Login as BaseLogin;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;

class Login extends BaseLogin
{
    public function getTitle(): string | Htmlable
    {
        return 'Acceso Superadmin';
    }

    public function getHeading(): string | Htmlable | null
    {
        if (filled($this->userUndertakingMultiFactorAuthentication)) {
            return 'Validacion de seguridad';
        }

        return 'Panel central ArtDent';
    }

    public function getSubheading(): string | Htmlable | null
    {
        if (filled($this->userUndertakingMultiFactorAuthentication)) {
            return 'Confirma el segundo factor para continuar con la administracion del entorno.';
        }

        return new HtmlString('Ingresá con tu cuenta de superadmin para gestionar tenants, planes, dominios y provisioning central.');
    }
}
