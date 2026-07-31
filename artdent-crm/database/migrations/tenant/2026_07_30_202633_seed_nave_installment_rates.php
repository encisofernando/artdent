<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tasas reales publicadas por Nave (Galicia) para cuotas con interés a cargo
 * del cliente, tomadas de la tabla oficial de Nave y verificadas contra los
 * montos reales que muestra el comparador ryrcomputacion.com (mismo cálculo:
 * PTF = monto × (1 + tasa/100), cuota = PTF / cantidad de cuotas).
 *
 * Visa y Mastercard tienen dos niveles para 3 y 6 cuotas: "Cuotas Nave" (más
 * baratas, subsidiadas) y las tradicionales — ambas conviven como filas
 * separadas. Editable después desde /installments-simulator.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $rows = [];

        $creditRates = [
            ['installments' => 1, 'rate_pct' => 0, 'tier_label' => null],
            ['installments' => 2, 'rate_pct' => 7.22, 'tier_label' => null],
            ['installments' => 3, 'rate_pct' => 7.64, 'tier_label' => 'Cuotas Nave'],
            ['installments' => 3, 'rate_pct' => 9.85, 'tier_label' => null],
            ['installments' => 6, 'rate_pct' => 13.89, 'tier_label' => 'Cuotas Nave'],
            ['installments' => 6, 'rate_pct' => 18.05, 'tier_label' => null],
            ['installments' => 9, 'rate_pct' => 29.76, 'tier_label' => null],
            ['installments' => 12, 'rate_pct' => 40.24, 'tier_label' => null],
            ['installments' => 18, 'rate_pct' => 63.53, 'tier_label' => null],
        ];

        $addRows = function (string $bank, string $brand, string $type, array $rates) use (&$rows, $now) {
            $sort = 0;
            foreach ($rates as $r) {
                $rows[] = [
                    'bank' => $bank,
                    'card_brand' => $brand,
                    'card_type' => $type,
                    'installments' => $r['installments'],
                    'rate_pct' => $r['rate_pct'],
                    'tier_label' => $r['tier_label'],
                    'is_active' => true,
                    'sort_order' => $sort++,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        };

        // Visa/Mastercard crédito — misma tabla para Galicia y Otros Bancos.
        foreach (['galicia', 'otros_bancos'] as $bank) {
            $addRows($bank, 'visa', 'credit', $creditRates);
            $addRows($bank, 'mastercard', 'credit', $creditRates);
            $addRows($bank, 'visa', 'debit', [['installments' => 1, 'rate_pct' => 0, 'tier_label' => null]]);
        }

        // Amex — sólo Galicia, tabla propia (más cara).
        $addRows('galicia', 'amex', 'credit', [
            ['installments' => 1, 'rate_pct' => 0, 'tier_label' => null],
            ['installments' => 3, 'rate_pct' => 22.43, 'tier_label' => null],
            ['installments' => 6, 'rate_pct' => 38.63, 'tier_label' => null],
            ['installments' => 9, 'rate_pct' => 59.11, 'tier_label' => null],
            ['installments' => 12, 'rate_pct' => 78.54, 'tier_label' => null],
            ['installments' => 18, 'rate_pct' => 126.55, 'tier_label' => null],
        ]);

        // Naranja crédito — tabla propia, solo tradicional (sin nivel "Cuotas Nave").
        $addRows('naranja', 'naranja', 'credit', [
            ['installments' => 1, 'rate_pct' => 0, 'tier_label' => null],
            ['installments' => 1, 'rate_pct' => 9.85, 'tier_label' => 'Promo'],
            ['installments' => 6, 'rate_pct' => 18.05, 'tier_label' => null],
            ['installments' => 9, 'rate_pct' => 29.76, 'tier_label' => null],
            ['installments' => 12, 'rate_pct' => 40.24, 'tier_label' => null],
            ['installments' => 18, 'rate_pct' => 63.53, 'tier_label' => null],
        ]);

        DB::table('nave_installment_rates')->insert($rows);
    }

    public function down(): void
    {
        DB::table('nave_installment_rates')->truncate();
    }
};
