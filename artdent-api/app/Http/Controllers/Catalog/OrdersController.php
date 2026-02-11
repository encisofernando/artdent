<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\EcommerceOrder;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    public function show(Request $request, string $code)
    {
        $companyId = (int) ($request->query('company_id') ?? env('ECOMMERCE_COMPANY_ID', 1));

        $order = EcommerceOrder::query()
            ->where('company_id', $companyId)
            ->where('code', $code)
            ->with(['items'])
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        // Seguridad: si NO está autenticado, debe enviar el email y coincidir.
        $user = $request->user();
        if (!$user) {
            $email = (string) $request->query('email', '');
            if ($email === '' || strcasecmp($email, $order->customer_email) !== 0) {
                return response()->json(['message' => 'No autorizado'], 401);
            }
        }

        return response()->json($order);
    }
}
