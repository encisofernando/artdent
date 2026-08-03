<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        $postalCode = trim($request->string('postal_code')->toString());
        $items = $request->input('items', []);

        $cost = is_array($items)
            ? app(AndreaniService::class)->quoteHomeDelivery($postalCode, $items)
            : null;

        return [
            'available' => true,
            'label' => 'Envío a domicilio',
            'description' => 'Recibí tu pedido en tu domicilio (Andreani)',
            'cost' => $cost,
            'quote_pending' => $cost === null,
        ];
    }
}
