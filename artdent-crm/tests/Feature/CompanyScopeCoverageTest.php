<?php

namespace Tests\Feature;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * Protege el invariante central de la Fase 2 (BelongsToCompany en los 67
 * modelos con company_id, IDOR cross-empresa): cualquier modelo cuya tabla
 * tenga columna company_id tiene que usar el trait, salvo que esté en la
 * excepción explícita de abajo. A diferencia de un test con la lista de
 * modelos hardcodeada, este barre app/Models/ en vivo — si mañana se agrega
 * un modelo nuevo con company_id y alguien se olvida del trait, este test lo
 * agarra sin que nadie tenga que acordarse de actualizar una lista.
 */
class CompanyScopeCoverageTest extends TestCase
{
    use RefreshesTenantSchema;

    /**
     * Modelos con company_id que a propósito NO usan BelongsToCompany, con
     * el motivo documentado (no repetir acá el detalle, ver el modelo).
     *
     * - User: CompanyContext::id() sin usuario autenticado devuelve el
     *   default (company 1), no null — el scope fail-closed rompería
     *   Auth::attempt() (busca el usuario ANTES de que exista contexto de
     *   compañía). Pendiente un fix distinto, ver Fase 2.
     */
    private const INTENTIONALLY_UNSCOPED = [
        'User',
    ];

    public function test_every_model_with_company_id_uses_belongs_to_company(): void
    {
        $offenders = [];

        foreach (glob(app_path('Models/*.php')) as $file) {
            $class = 'App\\Models\\'.basename($file, '.php');

            if (! class_exists($class) || ! is_subclass_of($class, Model::class)) {
                continue;
            }

            $table = (new $class)->getTable();

            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'company_id')) {
                continue;
            }

            $usesTrait = in_array(BelongsToCompany::class, class_uses_recursive($class), true);
            $name = class_basename($class);

            if (! $usesTrait && ! in_array($name, self::INTENTIONALLY_UNSCOPED, true)) {
                $offenders[] = $name;
            }
        }

        $this->assertEmpty(
            $offenders,
            'Modelo(s) con company_id sin BelongsToCompany (IDOR cross-empresa real, ver Fase 2): '
                .implode(', ', $offenders)
        );
    }

    public function test_intentionally_unscoped_list_has_no_stale_entries(): void
    {
        // Si alguien le agrega BelongsToCompany a User (o a lo que sea que
        // esté en la lista) sin sacarlo de acá, este test lo avisa — la
        // lista de excepciones documentadas no debe quedar desactualizada
        // en ningún sentido.
        $stale = [];

        foreach (self::INTENTIONALLY_UNSCOPED as $name) {
            $class = 'App\\Models\\'.$name;

            if (class_exists($class) && in_array(BelongsToCompany::class, class_uses_recursive($class), true)) {
                $stale[] = $name;
            }
        }

        $this->assertEmpty(
            $stale,
            'Modelo(s) en INTENTIONALLY_UNSCOPED que ya tienen BelongsToCompany — sacarlos de la lista: '
                .implode(', ', $stale)
        );
    }
}
