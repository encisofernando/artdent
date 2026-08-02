<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShippingCarrierConfig;
use App\Models\ShippingMotoCompany;
use App\Models\ShippingPickupPoint;
use App\Services\AndreaniService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    /**
     * Return all shipping options available for a given city/province.
     * Moto Mandados only available in Formosa Capital.
     */
    public function options(Request $request): JsonResponse
    {
        $city = strtolower(trim($request->string('city')->toString()));
        $province = strtolower(trim($request->string('province')->toString()));

        $pickupPoints = ShippingPickupPoint::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'city', 'province', 'postal_code', 'phone', 'schedule', 'latitude', 'longitude', 'notes', 'accepts_cash_payment']);

        // Moto Mandados: only for Formosa Capital
        $motoAvailable = str_contains($city, 'formosa') || str_contains($province, 'formosa');

        $motoCompanies = $motoAvailable
            ? ShippingMotoCompany::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'price', 'zone', 'notes'])
            : collect();

        return response()->json([
            'home_delivery' => $this->buildHomeDelivery($request),
            'pickup_points' => [
                'available' => $pickupPoints->isNotEmpty(),
                'label' => 'Retiro en punto de entrega',
                'description' => 'Retirá tu pedido en uno de nuestros puntos',
                'points' => $pickupPoints,
            ],
            'moto' => [
                'available' => $motoAvailable && $motoCompanies->isNotEmpty(),
                'label' => 'Moto Mandados',
                'description' => 'Entrega rápida en Formosa Capital',
                'companies' => $motoCompanies,
            ],
        ]);
    }

    /**
     * Cotiza el envío a domicilio con Andreani cuando hay código postal y
     * carrito disponibles — si falta algo (CP, ítems, dimensiones de algún
     * producto, o Andreani deshabilitado) devuelve el costo en null y el
     * frontend lo muestra como "A coordinar", igual que antes.
     *
     * @return array{available: bool, label: string, description: string, cost: float|null, quote_pending: bool}
     */
    private function buildHomeDelivery(Request $request): array
    {
        $base = [
            'available' => true,
            'label' => 'Envío a domicilio',
            'description' => 'Recibí tu pedido en tu domicilio (Andreani)',
            'cost' => null,
            'quote_pending' => true,
        ];

        $postalCode = trim($request->string('postal_code')->toString());
        $items = $request->input('items', []);

        if ($postalCode === '' || empty($items) || ! is_array($items)) {
            return $base;
        }

        $andreani = ShippingCarrierConfig::query()->where('type', 'andreani')->first();
        if (! $andreani || ! $andreani->is_enabled) {
            return $base;
        }

        $productIds = collect($items)->pluck('product_id')->filter()->unique()->all();
        if (empty($productIds)) {
            return $base;
        }

        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        $bultos = [];
        foreach ($items as $item) {
            $product = $products->get($item['product_id'] ?? null);
            if (! $product || ! $product->weight || ! $product->width_cm || ! $product->height_cm || ! $product->depth_cm) {
                // Falta peso/dimensiones en algún producto del carrito — Andreani
                // no puede cotizar sin esto, no tiene sentido intentar la llamada.
                return $base;
            }

            $bultos[] = [
                'quantity' => max(1, (int) ($item['qty'] ?? 1)),
                'price' => (float) $product->price,
                'width' => (int) $product->width_cm,
                'height' => (int) $product->height_cm,
                'depth' => (int) $product->depth_cm,
                'grams' => (int) round($product->weight * 1000),
            ];
        }

        $rates = (new AndreaniService)->cotizar($postalCode, $bultos);

        if ($rates === null) {
            return $base;
        }

        $estandar = collect($rates)->first(fn (array $r): bool => ($r['code'] ?? '') === 'estándar');

        if (! $estandar) {
            return array_merge($base, ['quote_pending' => false]);
        }

        return array_merge($base, [
            'cost' => (float) $estandar['total'],
            'quote_pending' => false,
        ]);
    }
}
