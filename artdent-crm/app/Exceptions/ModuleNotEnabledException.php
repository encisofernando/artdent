<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class ModuleNotEnabledException extends HttpException
{
    public function __construct(public readonly string $module)
    {
        parent::__construct(403, 'Este módulo no está incluido en tu plan actual.');
    }
}
