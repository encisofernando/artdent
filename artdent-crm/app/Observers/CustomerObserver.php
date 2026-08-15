<?php

namespace App\Observers;

use App\Models\Customer;
use App\Support\PublicTokenRegistrar;

class CustomerObserver
{
    public function created(Customer $customer): void
    {
        if ($customer->portal_token) {
            PublicTokenRegistrar::register($customer->portal_token, 'customer_portal');
        }
    }
}
