<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'description' => 'Ideal para clínicas pequeñas. POS + Facturación AFIP + 2 usuarios.',
                'price' => 15000.00,
                'trial_days' => 14,
                'is_active' => true,
                'is_public' => true,
                'max_users' => 2,
                'max_products' => 500,
                'max_sales_per_month' => null,
                'features' => ['POS', 'Facturación AFIP', 'WhatsApp', 'Clientes', 'Productos'],
            ],
            [
                'slug' => 'pro',
                'name' => 'Pro',
                'description' => 'Para clínicas en crecimiento. Todo Starter + E-commerce + usuarios ilimitados.',
                'price' => 35000.00,
                'trial_days' => 14,
                'is_active' => true,
                'is_public' => true,
                'max_users' => null,
                'max_products' => null,
                'max_sales_per_month' => null,
                'features' => ['POS', 'Facturación AFIP', 'WhatsApp', 'E-commerce', 'Laboratorio', 'RRHH', 'Usuarios ilimitados'],
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'Solución completa con soporte prioritario y personalización.',
                'price' => 75000.00,
                'trial_days' => 30,
                'is_active' => true,
                'is_public' => true,
                'max_users' => null,
                'max_products' => null,
                'max_sales_per_month' => null,
                'features' => ['Todo Pro', 'Soporte prioritario', 'Onboarding personalizado', 'Capacitación', 'Multi-sucursal'],
            ],
            [
                'slug' => 'owner',
                'name' => 'Owner',
                'description' => 'Licencia de propietario. Acceso ilimitado a todas las funcionalidades sin restricciones.',
                'price' => 0.00,
                'trial_days' => 0,
                'is_active' => true,
                'is_public' => false,   // Solo asignable desde el panel superadmin
                'max_users' => null,
                'max_products' => null,
                'max_sales_per_month' => null,
                'features' => ['Todo incluido', 'Sin límites', 'Acceso vitalicio', 'Soporte dedicado', 'Sin cobro de suscripción'],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
