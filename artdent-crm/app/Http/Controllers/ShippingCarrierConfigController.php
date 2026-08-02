<?php

namespace App\Http\Controllers;

use App\Models\ShippingCarrierConfig;
use App\Services\AndreaniService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ShippingCarrierConfigController extends Controller
{
    public function index(): Response
    {
        $configs = ShippingCarrierConfig::query()
            ->get()
            ->map(fn (ShippingCarrierConfig $config) => $config->toMaskedArray());

        return Inertia::render('ShippingCarrier/Index', [
            'configs' => $configs,
        ]);
    }

    public function update(Request $request, string $type): JsonResponse
    {
        $config = ShippingCarrierConfig::where('type', $type)->firstOrFail();

        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'config' => ['nullable', 'array'],
            'config.hash_andreani' => ['nullable', 'string', 'max:500'],
            'config.cp_origen' => ['nullable', 'string', 'max:10'],
        ]);

        $existingConfig = is_array($config->config) ? $config->config : [];
        $incomingConfig = is_array($validated['config'] ?? null) ? $validated['config'] : [];

        if (
            array_key_exists('hash_andreani', $incomingConfig)
            && \App\Models\EcommercePaymentConfig::isMaskedSecretValue($incomingConfig['hash_andreani'])
        ) {
            $incomingConfig['hash_andreani'] = $existingConfig['hash_andreani'] ?? null;
        }

        // Si cambió la credencial, se descarta el tipo de cuenta / contratos
        // cacheados — se vuelven a detectar solos en el próximo login.
        if (
            array_key_exists('hash_andreani', $incomingConfig)
            && $incomingConfig['hash_andreani'] !== ($existingConfig['hash_andreani'] ?? null)
        ) {
            $incomingConfig['client_type'] = null;
            $incomingConfig['contratos'] = null;
        }

        $validated['config'] = array_merge($existingConfig, $incomingConfig);

        $config->update($validated);

        return response()->json($config->fresh()->toMaskedArray());
    }

    /**
     * Prueba la Credencial ID contra Andreani en el momento (sin caché) y
     * devuelve el nombre de cuenta + contratos — para que se pueda
     * verificar que la credencial cargada funciona sin salir del CRM.
     */
    public function testConnection(string $type): JsonResponse
    {
        if ($type !== 'andreani') {
            return response()->json(['message' => 'Transportista no soportado.'], 422);
        }

        $config = ShippingCarrierConfig::where('type', $type)->firstOrFail();
        $hash = $config->config['hash_andreani'] ?? null;

        if (! $hash) {
            return response()->json(['message' => 'Falta cargar la Credencial ID.'], 422);
        }

        Cache::forget('andreani_client_info_'.md5($hash));

        $info = (new AndreaniService)->clientInfo();

        if (! $info) {
            return response()->json(['message' => 'No se pudo validar la Credencial ID contra Andreani.'], 422);
        }

        return response()->json([
            'client_type' => $info['clientType'],
            'nombre_cuenta' => $info['raw']['name'] ?? null,
            'cuit' => $info['raw']['cuit'] ?? null,
            'contratos' => $info['contratos'],
        ]);
    }
}
