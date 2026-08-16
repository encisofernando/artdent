<?php

namespace App\Logging;

use Illuminate\Log\Logger;

/**
 * Registra TenantContextProcessor en el logger de un canal — ver config/logging.php
 * (clave 'tap' de cada canal) y App\Logging\TenantContextProcessor para el porqué.
 */
class TenantContextTap
{
    public function __invoke(Logger $logger): void
    {
        $logger->pushProcessor(new TenantContextProcessor);
    }
}
