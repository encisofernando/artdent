<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Support\Facades\Cache;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * AfipService::generateFromSale() pide el próximo número de comprobante a
 * AFIP (getLastNumber + 1) y recién más tarde lo confirma (requestCae) —
 * sin lock, dos ventas facturándose al mismo tiempo para la misma
 * empresa+punto de venta+tipo de comprobante podían recibir el mismo
 * número (AFIP normalmente lo rechaza del lado del servidor, pero es un
 * fallo real de facturación evitable). El fix serializa ese tramo con
 * Cache::lock() por (company_id, point_sale, cbte_tipo).
 *
 * Este test no monta el flujo SOAP real (WSAA/WSFEv1 no son mockeables sin
 * tocar el constructor de AfipService, que preferimos no tocar por ahora) —
 * verifica el mecanismo de exclusión mutua en sí, con la misma clave exacta
 * que usa el servicio, que es lo que realmente previene el número duplicado.
 */
class AfipInvoiceLockTest extends TestCase
{
    use RefreshesTenantSchema;

    public function test_the_same_afip_invoice_lock_key_is_mutually_exclusive(): void
    {
        $company = Company::factory()->create();
        $pointSale = 1;
        $cbteTipo = 6; // Factura B

        $key = "afip-invoice:{$company->id}:{$pointSale}:{$cbteTipo}";

        $firstRequest = Cache::lock($key, 30);
        $this->assertTrue($firstRequest->get());

        // Mientras el primer "request" tiene el lock, un segundo intento
        // concurrente para la misma empresa+punto de venta+comprobante no
        // puede tomarlo — exactamente lo que evita que ambos pidan
        // getLastNumber() al mismo tiempo y reciban el mismo número.
        $secondRequest = Cache::lock($key, 30);
        $this->assertFalse($secondRequest->get());

        $firstRequest->release();

        // Liberado el primero, el segundo (u otro nuevo) sí puede tomarlo.
        $this->assertTrue(Cache::lock($key, 30)->get());
    }

    public function test_a_different_point_of_sale_or_receipt_type_does_not_share_the_lock(): void
    {
        $company = Company::factory()->create();

        $lockA = Cache::lock("afip-invoice:{$company->id}:1:6", 30);
        $this->assertTrue($lockA->get());

        // Punto de venta distinto (2 en vez de 1): factura B en otra caja no
        // tiene por qué esperar a la que se está facturando en la primera.
        $lockOtherPointSale = Cache::lock("afip-invoice:{$company->id}:2:6", 30);
        $this->assertTrue($lockOtherPointSale->get());

        // Mismo punto de venta, tipo de comprobante distinto (Nota de
        // Crédito B): AFIP numera cada tipo de comprobante en una
        // secuencia independiente, así que tampoco deberían bloquearse.
        $lockOtherReceiptType = Cache::lock("afip-invoice:{$company->id}:1:7", 30);
        $this->assertTrue($lockOtherReceiptType->get());
    }
}
