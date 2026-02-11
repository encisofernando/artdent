<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Product;
use App\Models\User;

class PricingService
{
    /**
     * Devuelve precio final + modo (b2c/b2b) para un producto.
     */
    public function priceFor(Product $product, ?User $user, ?Company $company = null): array
    {
        $base = (float) $product->price;

        // Invitado o usuario B2C
        if (!$user || ($user->pricing_mode ?? 'b2c') !== 'b2b') {
            return [
                'mode' => 'b2c',
                'base' => $base,
                'discount_percent' => 0.0,
                'final' => $base,
            ];
        }

        $company = $company ?: Company::query()->find($user->company_id);

        $discount = null;
        if (isset($user->b2b_discount_percent) && $user->b2b_discount_percent !== null) {
            $discount = (float) $user->b2b_discount_percent;
        } elseif ($company && isset($company->b2b_discount_percent) && $company->b2b_discount_percent !== null) {
            $discount = (float) $company->b2b_discount_percent;
        } else {
            $discount = (float) env('DEFAULT_B2B_DISCOUNT_PERCENT', 0);
        }

        $discount = max(0.0, min(100.0, $discount));
        $final = round($base * (1 - ($discount / 100)), 2);

        return [
            'mode' => 'b2b',
            'base' => $base,
            'discount_percent' => $discount,
            'final' => $final,
        ];
    }
}
