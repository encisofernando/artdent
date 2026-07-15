<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Catálogo de módulos vendibles por plan. El slug es lo que después
     * consume el middleware `module:` del lado del CRM (Fase 2) y el
     * selector de módulos del backoffice (Fase 5) — no renombrar sin
     * actualizar ambos lados.
     */
    private const MODULES = [
        ['slug' => 'clientes', 'name' => 'Gestión de Clientes', 'description' => 'CRM de clientes, historial y contacto.', 'icon' => 'Users'],
        ['slug' => 'laboratorio', 'name' => 'Laboratorio Odontológico', 'description' => 'Órdenes de trabajo, fases de producción y kiosco de laboratorio.', 'icon' => 'FlaskConical'],
        ['slug' => 'clinica', 'name' => 'Clínicas / Consultorios', 'description' => 'Pacientes, turnos e historia clínica.', 'icon' => 'Stethoscope'],
        ['slug' => 'insumos', 'name' => 'Insumos e Inventario', 'description' => 'Stock, almacenes y movimientos de insumos.', 'icon' => 'Package'],
        ['slug' => 'finanzas', 'name' => 'Finanzas', 'description' => 'Caja, cobranzas y cuentas corrientes.', 'icon' => 'Wallet'],
        ['slug' => 'contabilidad', 'name' => 'Contabilidad', 'description' => 'Libros fiscales, AFIP/ARCA y reportes impositivos.', 'icon' => 'Calculator'],
        ['slug' => 'rrhh', 'name' => 'Recursos Humanos', 'description' => 'Legajos, liquidaciones, asistencia y licencias.', 'icon' => 'UsersRound'],
        ['slug' => 'ecommerce', 'name' => 'Tienda Online / E-commerce', 'description' => 'Catálogo público, carrito y pedidos online.', 'icon' => 'ShoppingCart'],
        ['slug' => 'chat_ia', 'name' => 'Chat IA', 'description' => 'Asistente conversacional con IA para el equipo.', 'icon' => 'Sparkles'],
        ['slug' => 'reportes', 'name' => 'Reportes', 'description' => 'Analítica y reportes exportables.', 'icon' => 'BarChart3'],
    ];

    /**
     * Mapeo inicial plan → módulos. Reconciliado entre el `features` (texto
     * marketing) ya cargado en cada plan real y el ejemplo de negocio dado
     * por el cliente (Básico/Profesional/Enterprise). Ajustable después
     * desde el backoffice (Fase 5) sin tocar código.
     */
    private const PLAN_MODULES = [
        'starter' => ['clientes', 'reportes'],
        'pro' => ['clientes', 'reportes', 'laboratorio', 'insumos', 'finanzas', 'ecommerce'],
        'enterprise' => ['clientes', 'laboratorio', 'clinica', 'insumos', 'finanzas', 'contabilidad', 'rrhh', 'ecommerce', 'chat_ia', 'reportes'],
        'owner' => ['clientes', 'laboratorio', 'clinica', 'insumos', 'finanzas', 'contabilidad', 'rrhh', 'ecommerce', 'chat_ia', 'reportes'],
    ];

    public function run(): void
    {
        foreach (self::MODULES as $data) {
            Module::updateOrCreate(['slug' => $data['slug']], $data + ['is_active' => true]);
        }

        foreach (self::PLAN_MODULES as $planSlug => $moduleSlugs) {
            $plan = Plan::where('slug', $planSlug)->first();

            if (! $plan) {
                continue;
            }

            $moduleIds = Module::whereIn('slug', $moduleSlugs)->pluck('id');
            $plan->modules()->sync($moduleIds);
        }
    }
}
