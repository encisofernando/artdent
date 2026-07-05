<?php

namespace App\Services\Payroll;

use App\Models\PayrollBookSubmission;
use App\Models\PayrollRun;

/**
 * Placeholder de arquitectura para una futura integración con el Libro de Sueldos Digital /
 * SICOSS (AFIP/ARCA). Sigue el mismo patrón que la integración AFIP existente en el proyecto
 * (app/Services/Afip/*: WsaaService + servicio específico + certificados por Company), para
 * que conectar el envío real sea un cambio acotado el día que se confirme la especificación.
 *
 * IMPORTANTE — esto NO envía nada a ningún organismo todavía. `buildPayload()` arma una
 * estructura razonable basada en los conceptos públicos y generales de SICOSS (CUIL,
 * remuneración, aportes/contribuciones por período), pero esa estructura NO está verificada
 * contra la especificación técnica vigente del servicio real — antes de habilitar un envío
 * real hay que confirmar con el usuario/contador: el endpoint exacto, el esquema de datos
 * requerido, y el período de vigencia de la obligación. `submit()` solo registra el intento
 * localmente (`payroll_book_submissions`, status=not_implemented) para dejar la trazabilidad
 * lista, sin hacer ninguna llamada HTTP.
 */
class LibroSueldosDigitalService
{
    /**
     * Arma el payload candidato a partir de los recibos de una liquidación. Estructura
     * aproximada, no verificada contra la especificación real — ver nota de la clase.
     */
    public function buildPayload(PayrollRun $payrollRun): array
    {
        $payrollRun->loadMissing(['receipts.employee.user:id,name', 'receipts.lines.concept:id,code,type,category']);

        return [
            'periodo' => $payrollRun->period_from->format('Y-m'),
            'tipo_liquidacion' => $payrollRun->type,
            'empleados' => $payrollRun->receipts->map(fn ($receipt) => [
                'cuil' => $receipt->employee->cuil,
                'nombre' => $receipt->employee->user->name ?? null,
                'remuneracion_bruta' => $receipt->gross,
                'remuneracion_neta' => $receipt->net,
                'conceptos' => $receipt->lines->map(fn ($line) => [
                    'codigo' => $line->concept?->code,
                    'tipo' => $line->type,
                    'monto' => $line->amount,
                ])->all(),
            ])->all(),
        ];
    }

    /**
     * Registra el intento de envío localmente, SIN llamar a ningún servicio externo.
     * `status` queda en `not_implemented` a propósito.
     */
    public function submit(PayrollRun $payrollRun): PayrollBookSubmission
    {
        return PayrollBookSubmission::create([
            'company_id' => $payrollRun->company_id,
            'payroll_run_id' => $payrollRun->id,
            'period' => $payrollRun->period_from->format('Y-m'),
            'status' => 'not_implemented',
            'request_payload' => $this->buildPayload($payrollRun),
        ]);
    }
}
