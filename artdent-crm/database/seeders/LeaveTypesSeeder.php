<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

/**
 * Catálogo global (company_id null) de licencias previstas por la LCT (Ley 20.744) —
 * disponible para cualquier empresa, editable/ampliable desde la UI de RRHH.
 */
class LeaveTypesSeeder extends Seeder
{
    private const LEAVE_TYPES = [
        ['code' => 'VAC', 'name' => 'Vacaciones', 'category' => 'vacaciones', 'paid' => true, 'requires_certificate' => false, 'max_days_per_year' => null],
        ['code' => 'ENF', 'name' => 'Enfermedad Inculpable', 'category' => 'enfermedad', 'paid' => true, 'requires_certificate' => true, 'max_days_per_year' => null],
        ['code' => 'MAT', 'name' => 'Licencia por Maternidad', 'category' => 'maternidad_paternidad', 'paid' => true, 'requires_certificate' => true, 'max_days_per_year' => 90],
        ['code' => 'PAT', 'name' => 'Licencia por Paternidad', 'category' => 'maternidad_paternidad', 'paid' => true, 'requires_certificate' => false, 'max_days_per_year' => 2],
        ['code' => 'MATR', 'name' => 'Licencia por Matrimonio', 'category' => 'matrimonio', 'paid' => true, 'requires_certificate' => false, 'max_days_per_year' => 10],
        ['code' => 'FALLDIR', 'name' => 'Fallecimiento Familiar Directo (cónyuge/hijo/padre)', 'category' => 'fallecimiento', 'paid' => true, 'requires_certificate' => false, 'max_days_per_year' => 3],
        ['code' => 'FALLHNO', 'name' => 'Fallecimiento de Hermano/a', 'category' => 'fallecimiento', 'paid' => true, 'requires_certificate' => false, 'max_days_per_year' => 1],
        ['code' => 'EXAM', 'name' => 'Licencia por Examen', 'category' => 'estudio', 'paid' => true, 'requires_certificate' => true, 'max_days_per_year' => 10],
    ];

    public function run(): void
    {
        foreach (self::LEAVE_TYPES as $type) {
            LeaveType::updateOrCreate(
                ['company_id' => null, 'code' => $type['code']],
                [
                    'name' => $type['name'],
                    'category' => $type['category'],
                    'paid' => $type['paid'],
                    'requires_certificate' => $type['requires_certificate'],
                    'max_days_per_year' => $type['max_days_per_year'],
                    'is_active' => true,
                ],
            );
        }
    }
}
