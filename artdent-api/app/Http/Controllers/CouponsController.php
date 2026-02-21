<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponsController extends Controller
{
    /**
     * POST /api/coupons/validate
     */
   public function validateCoupon(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0',
            'cart_items' => 'nullable|array',
        ]);

        $code = strtoupper($data['code']);
        $cartTotal = (float) $data['cart_total'];
        $cartItems = $data['cart_items'] ?? [];

        $coupon = Coupon::byCode($code)->active()->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Cupón inválido o expirado.',
            ], 404);
        }

        $user = $request->user();
        $validation = $coupon->isValid($user?->id, $cartTotal, $cartItems);

        if (!$validation['valid']) {
            return response()->json([
                'valid' => false,
                'message' => implode(' ', $validation['errors']),
            ], 422);
        }

        $discount = $coupon->calculateDiscount($cartTotal);

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type,
                'discount_value' => $coupon->discount_value,
            ],
            'discount' => $discount,
            'final_total' => max(0, $cartTotal - $discount),
        ]);
    }

    /**
     * GET /api/coupons/available (Public available coupons)
     */
    public function available(Request $request)
    {
        $companyId = (int) ($request->query('company_id') ?? config('app.ecommerce_company_id', 1));

        $coupons = Coupon::where('company_id', $companyId)
            ->active()
            ->whereNull('max_uses') // Public coupons
            ->select(['id', 'code', 'name', 'description', 'type', 'discount_value', 'valid_until'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($coupons);
    }

    /**
     * POST /api/coupons (Admin only)
     */
    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;

        $data = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed,free_shipping',
            'discount_value' => 'required_unless:type,free_shipping|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'applicable_categories' => 'nullable|array',
            'applicable_products' => 'nullable|array',
            'first_purchase_only' => 'nullable|boolean',
        ]);

        $data['company_id'] = $companyId;
        $data['code'] = strtoupper($data['code']);

        $coupon = Coupon::create($data);

        return response()->json($coupon, 201);
    }

    /**
     * GET /api/coupons (Admin only)
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $coupons = Coupon::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($coupons);
    }

    /**
     * PUT /api/coupons/{coupon} (Admin only)
     */
    public function update(Request $request, Coupon $coupon)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:191',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'valid_until' => 'nullable|date',
        ]);

        $coupon->update($data);

        return response()->json($coupon);
    }
}
