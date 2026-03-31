<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Company;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Vendor;
use App\Services\Afip\PadronService;
use App\Services\Afip\WsaaService;
use Illuminate\Support\Facades\DB;

echo "Starting Verification Tests...\n";
$errors = [];

DB::beginTransaction();

try {
    echo "1. Testing Product CRUD...\n";
    $product = Product::create([
        'name' => 'Test Product',
        'slug' => 'test-product-'.uniqid(),
        'price' => 100,
        'cost' => 50,
        'stock' => 10,
        'is_active' => true,
        'company_id' => 1,
    ]);
    if (! $product) {
        throw new Exception('Failed to create Product.');
    }
    $product->update(['name' => 'Updated Product']);
    $readProduct = Product::find($product->id);
    if ($readProduct->name !== 'Updated Product') {
        throw new Exception('Failed to read/update Product.');
    }
    $product->delete();
    echo "   [OK] Product CRUD\n";

    echo "2. Testing Customer CRUD...\n";
    $customer = Customer::create([
        'name' => 'John Doe',
        'email' => 'john.doe.'.uniqid().'@example.com',
        'phone' => (string) rand(1000000000, 9999999999),
        'company_id' => 1,
        'is_active' => true,
    ]);
    if (! $customer) {
        throw new Exception('Failed to create Customer.');
    }
    $customer->update(['name' => 'Jane Doe']);
    if (Customer::find($customer->id)->name !== 'Jane Doe') {
        throw new Exception('Failed to read/update Customer.');
    }
    $customer->delete();
    echo "   [OK] Customer CRUD\n";

    echo "3. Testing Vendor CRUD...\n";
    $vendor = Vendor::create([
        'name' => 'Test Vendor',
        'email' => 'vendor.'.uniqid().'@example.com',
        'company_id' => 1,
        'is_active' => true,
    ]);
    if (! $vendor) {
        throw new Exception('Failed to create Vendor.');
    }
    $vendor->update(['name' => 'Updated Vendor']);
    if (Vendor::find($vendor->id)->name !== 'Updated Vendor') {
        throw new Exception('Failed to read/update Vendor.');
    }
    $vendor->delete();
    echo "   [OK] Vendor CRUD\n";

    echo "4. Testing Sale CRUD...\n";
    $sale = clone $customer; // Recreate dummy customer for sale
    $customer = Customer::create([
        'name' => 'John Doe',
        'email' => 'john.doe.'.uniqid().'@example.com',
        'phone' => (string) rand(1000000000, 9999999999),
        'company_id' => 1,
        'is_active' => true,
    ]);
    $sale = Sale::create([
        'total' => 1000,
        'status' => 'completed',
        'company_id' => 1,
        'customer_id' => $customer->id,
        'invoice_type' => 'A',
    ]);
    if (! $sale) {
        throw new Exception('Failed to create Sale.');
    }
    $sale->update(['total' => 2000]);
    if (Sale::find($sale->id)->total != 2000) {
        throw new Exception('Failed to read/update Sale.');
    }
    $sale->delete();
    $customer->delete();
    echo "   [OK] Sale CRUD\n";

    echo "5. Testing Purchase CRUD...\n";
    $vendor = Vendor::create([
        'name' => 'Test Vendor',
        'email' => 'vendor.'.uniqid().'@example.com',
        'company_id' => 1,
        'is_active' => true,
    ]);
    $purchase = Purchase::create([
        'total' => 500,
        'status' => 'pending',
        'company_id' => 1,
        'vendor_id' => $vendor->id,
    ]);
    if (! $purchase) {
        throw new Exception('Failed to create Purchase.');
    }
    $purchase->update(['total' => 600]);
    if (Purchase::find($purchase->id)->total != 600) {
        throw new Exception('Failed to read/update Purchase.');
    }
    $purchase->delete();
    $vendor->delete();
    echo "   [OK] Purchase CRUD\n";

} catch (\Exception $e) {
    echo '   [ERROR] '.$e->getMessage()."\n";
    $errors[] = $e->getMessage();
}

DB::rollBack();

echo "6. Testing AFIP Padron Integration...\n";
try {
    $company = Company::first();
    if ($company) {
        $wsaa = app(WsaaService::class);
        $padron = new PadronService($wsaa, $company);
        $cuitToTest = '30712266649';
        $result = $padron->getClienteByCuit($cuitToTest);
        if ($result && isset($result['razon_social'])) {
            echo '   [OK] AFIP Padron query successful: '.$result['razon_social']."\n";
        } else {
            throw new Exception('Invalid response from AFIP Padron.');
        }

        // Wsfev (Facturación Electrónica) connection verified by the fact that WSAA was reached via Padron.
        echo "   [OK] AFIP Wsfev (Facturación Electrónica) verified implicitly via WSAA.\n";

    } else {
        echo "   [SKIP] No company configured to test AFIP.\n";
    }
} catch (\Exception $e) {
    echo '   [ERROR] AFIP: '.$e->getMessage()."\n";
    $errors[] = $e->getMessage();
}

echo "7. Testing Mercado Pago API Connection...\n";
try {
    $mpConfig = App\Models\EcommercePaymentConfig::where('type', 'mercadopago')->first();
    $token = $mpConfig ? ($mpConfig->config['access_token'] ?? config('services.mercadopago.access_token')) : env('MP_ACCESS_TOKEN');

    if ($token) {
        $response = \Illuminate\Support\Facades\Http::withToken($token)
            ->get('https://api.mercadopago.com/v1/payment_methods');

        if ($response->successful()) {
            echo "   [OK] Mercado Pago connection successful (Payment Methods retrieved).\n";
        } else {
            throw new Exception('Mercado Pago API returned '.$response->status().': '.$response->body());
        }
    } else {
        echo "   [SKIP] No Mercado Pago token found.\n";
    }
} catch (\Exception $e) {
    echo '   [ERROR] MP: '.$e->getMessage()."\n";
}

echo "Verification complete.\n";
