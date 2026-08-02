<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingCarrierConfig extends Model
{
    protected $fillable = [
        'type',
        'label',
        'is_enabled',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
        ];
    }

    public function toMaskedArray(): array
    {
        $data = $this->toArray();

        if ($this->type === 'andreani' && isset($data['config']) && is_array($data['config'])) {
            if (! empty($data['config']['hash_andreani'])) {
                $data['config']['hash_andreani'] = EcommercePaymentConfig::maskSecret($data['config']['hash_andreani']);
            }
        }

        return $data;
    }
}
