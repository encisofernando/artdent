<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingMotoCompany;
use App\Models\ShippingPickupPoint;
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
            ->get(['id', 'name', 'address', 'city', 'province', 'postal_code', 'phone', 'schedule', 'latitude', 'longitude', 'notes']);

        // Moto Mandados: only for Formosa Capital
        $motoAvailable = str_contains($city, 'formosa') || str_contains($province, 'formosa');

        $motoCompanies = $motoAvailable
            ? ShippingMotoCompany::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'price', 'zone', 'notes'])
            : collect();

        return response()->json([
            'home_delivery' => [
                'available' => true,
                'label' => 'Envío a domicilio',
                'description' => 'Recibí tu pedido en tu domicilio (Andreani)',
            ],
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
}
