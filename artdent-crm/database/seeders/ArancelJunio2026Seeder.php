<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Tariff;
use Illuminate\Database\Seeder;

/**
 * Carga el listado real de aranceles de laboratorio (categorías + ítems + precios)
 * provisto por el usuario en "ARANCEL JUNIO 2026.pdf", para que el módulo de Aranceles
 * tenga datos reales con los que probar el aumento masivo de precios y la exportación
 * del arancel en PDF. Idempotente: usa updateOrCreate por (company_id, name).
 */
class ArancelJunio2026Seeder extends Seeder
{
    private const CATEGORIES = [
        'ACRÍLICO TERMO TRADICIONAL' => [
            ['name' => 'Acrilico Tradicional 1 a 3 dientes', 'price' => 100000],
            ['name' => 'Acrilico Tradicional 4 a 8 dientes', 'price' => 105000],
            ['name' => 'Acrilico Tradicional 9 a más dientes', 'price' => 120000],
        ],
        'ACRÍLICO INYECTADO O FLEX' => [
            ['name' => 'Acrilico Inyectado o Flex 1 a 3 dientes', 'price' => 130000],
            ['name' => 'Acrilico Inyectado o Flex 4 a 8 dientes', 'price' => 140000],
            ['name' => 'Acrilico Inyectado o Flex 9 a más dientes', 'price' => 150000],
        ],
        'ACRÍLICO POR COLADO APC' => [
            ['name' => 'Apc 1 a 3 dientes', 'price' => 110000],
            ['name' => 'Apc 4 a 8 dientes', 'price' => 125000],
            ['name' => 'Apc 9 a más dientes', 'price' => 135000],
        ],
        'PRÓTESIS PROVISORIA' => [
            ['name' => 'Protesis provisoria 1 a 3 elementos', 'price' => 80000],
        ],
        'CROMO COBALTO' => [
            ['name' => 'Base colada (Sup e Inf.)', 'price' => 145000],
            ['name' => 'Combinado acrilico', 'price' => 250000],
            ['name' => 'Combinado Flex', 'price' => 280000],
            ['name' => 'Combinado acrilico inyectado', 'price' => 280000],
            ['name' => 'Caja barra tangencial', 'price' => 0],
        ],
        'REPARACIONES' => [
            ['name' => 'Rebasado en acrilico auto', 'price' => 43000],
            ['name' => 'Rebasado en mufla termo', 'price' => 80000],
            ['name' => 'Reparación simple', 'price' => 37000],
            ['name' => 'Reparación compleja', 'price' => 43000],
            ['name' => 'Agregado retenedor/diente', 'price' => 40000],
            ['name' => 'Subsiguiente', 'price' => 20000],
            ['name' => 'Cubeta individual ac. auto', 'price' => 36000],
        ],
        'CORONAS' => [
            ['name' => 'Corona Provisoria (NUEVA DIGITAL)', 'price' => 65000],
            ['name' => 'Corona PMMA Frezada', 'price' => 70000],
            ['name' => 'Corona definitiva (NUEVO DIGITAL)', 'price' => 70000],
            ['name' => 'Corona definitiva fotocurado (Ceramage)', 'price' => 110000],
            ['name' => 'Corona metal porcelana', 'price' => 150000],
            ['name' => 'Corona de porcelana pura (disilicato)', 'price' => 140000],
            ['name' => 'Corona Fresada zirconia multilayer', 'price' => 130000],
            ['name' => 'Corona Híbrida Fresada zirconia /pieza', 'price' => 140000],
            ['name' => 'Encia metal porcelana cada 2 dientes', 'price' => 145000],
            ['name' => 'Encia ceramage cada 2 dientes', 'price' => 110000],
        ],
        'INCRUSTACIONES' => [
            ['name' => 'Incrustación larga duración (DIGITAL)', 'price' => 70000],
            ['name' => 'Incrustación de PMMA frezada', 'price' => 70000],
            ['name' => 'Incrustación larga duración ceramage', 'price' => 110000],
            ['name' => 'Incrustación indirecta porcelana pura', 'price' => 140000],
            ['name' => 'Incrustación indirecta de zirconia', 'price' => 130000],
        ],
        'PERNOS' => [
            ['name' => 'Perno simple directo', 'price' => 46000],
            ['name' => 'Perno simple indirecto', 'price' => 50000],
            ['name' => 'Perno pasante', 'price' => 65000],
            ['name' => 'Perno Bolatach', 'price' => 105000],
            ['name' => 'Perno espiga', 'price' => 105000],
        ],
        'CARILLAS' => [
            ['name' => 'Carilla definitiva fotocurado CERAMAGE', 'price' => 110000],
            ['name' => 'Carilla de porcelana pura disilicato de litio', 'price' => 145000],
            ['name' => 'Carilla de zirconia multilayer', 'price' => 130000],
        ],
        'ANCLAJE ATACHMEN' => [
            ['name' => 'Bola servo c/u', 'price' => 74000],
            ['name' => 'Teflón para bola c/u', 'price' => 21000],
            ['name' => 'Rielera vertical c/u', 'price' => 48000],
        ],
        'ENCERADO / HIBRIDAS' => [
            ['name' => 'Encerado de diagnóstico impreso p/mock up 6 dientes', 'price' => 88000],
            ['name' => 'Encerado de diagnóstico impreso 1 pieza', 'price' => 25000],
            ['name' => 'Encerado de diagnóstico impreso desde 2 a 5 piezas c/u', 'price' => 0],
        ],
        'IMPLANTES Y BARRAS' => [
            ['name' => 'Fresado ucla maquinado', 'price' => 18000],
            ['name' => 'Poste para implante', 'price' => 37000],
            ['name' => 'Tramo barra tangencial', 'price' => 44000],
            ['name' => 'Broche metalico para barra', 'price' => 37000],
            ['name' => 'Teflón para barra c/u', 'price' => 20000],
            ['name' => 'Elementos transfer c/2 impl.', 'price' => 25000],
        ],
        'METALES' => [
            ['name' => 'Atornillados para ceramage o cerámica con ucla', 'price' => 110000],
            ['name' => 'Preparacion de pilares preform mas casquete con chimenea', 'price' => 90000],
        ],
        'PLACAS' => [
            ['name' => 'Estampada rigida 0,8mm', 'price' => 70000],
            ['name' => 'Placa estampada c/ pista acri', 'price' => 77000],
            ['name' => 'Placa para blanqueamiento', 'price' => 70000],
            ['name' => 'Placa impresa 3D', 'price' => 94000],
            ['name' => 'Placa cristal termoinyectada', 'price' => 108000],
            ['name' => 'Placa termo cristal', 'price' => 106000],
            ['name' => 'Placa partida sup de 13 a 23', 'price' => 97000],
            ['name' => 'Placa partida inf c/barra ling', 'price' => 97000],
        ],
        'PARA COLEGAS Y DOCTORES' => [
            ['name' => 'Digitalización de modelo por caso (sup o inf)', 'price' => 15000],
            ['name' => 'Diseño en EXOCAD (coronas c/u)', 'price' => 10000],
            ['name' => 'Diseños mas complejos', 'price' => 0],
            ['name' => 'Impresión modelo resina alineador (sup o inf)', 'price' => 25000],
            ['name' => 'Impresión modelo geller hemiarcada', 'price' => 25000],
            ['name' => 'Guía quirúrgica impresa con resina bio-splin', 'price' => 51000],
            ['name' => 'Modelo de estudio oseo-maxilar sup. o inf.', 'price' => 88000],
        ],
    ];

    public function run(): void
    {
        foreach (Company::all() as $company) {
            foreach (self::CATEGORIES as $category => $items) {
                foreach ($items as $item) {
                    Tariff::updateOrCreate(
                        ['company_id' => $company->id, 'name' => $item['name']],
                        [
                            'category' => $category,
                            'price' => $item['price'],
                            'unit' => 'unidad',
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
