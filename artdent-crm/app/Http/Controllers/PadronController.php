<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Services\Afip\PadronService;
use App\Services\Afip\WsaaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PadronController extends Controller
{
    /**
     * Consulta el padrón ARCA por CUIT y retorna los datos normalizados.
     * Respuesta cacheada 24 horas en servidor.
     */
    public function lookup(Request $request, string $cuit): JsonResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $company = Company::findOrFail($companyId);

        if (empty($company->cuit) || empty($company->afip_key_path)) {
            return response()->json([
                'success' => false,
                'error' => 'La empresa no tiene configurados los certificados AFIP necesarios para consultar el padrón.',
            ], 422);
        }

        try {
            $service = new PadronService(
                new WsaaService($company->afip_environment ?? 'homo'),
                $company
            );

            $data = $service->getClienteByCuit($cuit);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);

        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Invalida la cache de un CUIT para forzar reconsulta desde ARCA.
     */
    public function invalidate(string $cuit): JsonResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $company = Company::findOrFail($companyId);

        $service = new PadronService(
            new WsaaService($company->afip_environment ?? 'homo'),
            $company
        );
        $service->invalidate($cuit);

        return response()->json(['success' => true, 'message' => 'Cache invalidada.']);
    }
}
