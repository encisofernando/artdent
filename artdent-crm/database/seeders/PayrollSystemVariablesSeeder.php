<?php

namespace Database\Seeders;

use App\Models\PayrollVariable;
use Illuminate\Database\Seeder;

class PayrollSystemVariablesSeeder extends Seeder
{
    /**
     * Variables calculadas automáticamente por el motor de liquidación.
     * No son editables por el usuario (source: system) — sirven como
     * tokens disponibles para escribir fórmulas de conceptos.
     */
    private const VARIABLES = [
        ['code' => 'sueldo_basico', 'name' => 'Sueldo Básico', 'description' => 'Sueldo base mensual del empleado.'],
        ['code' => 'comision', 'name' => 'Comisión', 'description' => 'Comisión calculada sobre ventas del período.'],
        ['code' => 'ventas_total', 'name' => 'Total de Ventas', 'description' => 'Monto total de ventas del empleado en el período.'],
        ['code' => 'antiguedad_anios', 'name' => 'Antigüedad (años)', 'description' => 'Años completos desde la fecha de ingreso hasta el fin del período.'],
        ['code' => 'mes_liquidacion', 'name' => 'Mes de Liquidación', 'description' => 'Mes (1-12) del fin del período liquidado. Útil para condicionar conceptos que solo aplican en ciertos meses, ej. SAC: "(mes_liquidacion == 6 or mes_liquidacion == 12) ? round(max(mejor_remuneracion_semestre_previa, remunerativo_parcial_mes) * 0.5 * proporcion_sac, 2) : 0" (Ley 23.041, 1° cuota junio / 2° cuota diciembre).'],
        ['code' => 'remunerativo_parcial_mes', 'name' => 'Remunerativo Parcial del Mes', 'description' => 'Acumulado de los conceptos remunerativos del propio período resueltos hasta el momento (sueldo básico + comisión + los remunerativos ya calculados antes en el orden de conceptos, ej. presentismo y antigüedad). Se usa como candidato a "mejor remuneración del semestre" para el cálculo del SAC (Ley 23.041) sin necesidad de guardar el recibo primero.'],
        ['code' => 'mejor_remuneracion_semestre_previa', 'name' => 'Mejor Remuneración del Semestre (meses previos)', 'description' => 'Mayor remuneración remunerativa mensual ya liquidada en los demás meses del semestre (excluyendo el período actual), consultando los recibos existentes. Se compara con remunerativo_parcial_mes para determinar la "mejor remuneración mensual del semestre" que exige la Ley 23.041 para el SAC. Da 0 si no hay otros recibos liquidados en el semestre.'],
        ['code' => 'proporcion_sac', 'name' => 'Proporción SAC', 'description' => 'Fracción del semestre efectivamente trabajada (días desde el ingreso hasta el fin del semestre, sobre el total de días del semestre), para prorratear el SAC cuando el ingreso ocurrió durante el semestre (Ley 23.041). Vale 1 si el empleado ya estaba activo desde el inicio del semestre. No contempla egreso/liquidación final.'],
        ['code' => 'remunerativo_total', 'name' => 'Total Remunerativo', 'description' => 'Suma de todos los conceptos remunerativos ya liquidados en el período (sueldo básico + comisión + presentismo + antigüedad + SAC, etc.). Solo disponible para conceptos de tipo deducción/aporte/contribución patronal, ya que se calcula después de resolver los haberes. Es la base real de cálculo de aportes y contribuciones en la práctica argentina (no el sueldo básico solo).'],
        ['code' => 'no_remunerativo_total', 'name' => 'Total No Remunerativo', 'description' => 'Suma de los conceptos no remunerativos ya liquidados en el período. Solo disponible para conceptos de tipo deducción/aporte/contribución patronal.'],
        ['code' => 'dias_trabajados', 'name' => 'Días Trabajados', 'description' => 'Días del período liquidado. Valor calendario (rango del período), no de asistencia real.'],
        ['code' => 'ausencias', 'name' => 'Ausencias', 'description' => 'Cantidad de días marcados como ausencia (Control Horario, tabla employee_attendances) dentro del período liquidado.'],
        ['code' => 'horas_extra', 'name' => 'Horas Extra', 'description' => 'Horas trabajadas por encima de 8 por jornada dentro del período, según los fichajes de Control Horario (employee_attendances). Simplificación: no contempla convenios con jornada distinta a 8hs.'],
    ];

    public function run(): void
    {
        foreach (self::VARIABLES as $variable) {
            PayrollVariable::updateOrCreate(
                ['company_id' => null, 'code' => $variable['code']],
                [
                    'name' => $variable['name'],
                    'data_type' => 'number',
                    'source' => 'system',
                    'description' => $variable['description'],
                    'is_active' => true,
                ],
            );
        }
    }
}
