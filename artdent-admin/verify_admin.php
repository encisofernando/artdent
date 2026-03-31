<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;

echo "Starting Admin Verification Tests...\n";
$errors = [];

DB::beginTransaction();

try {
    echo "1. Testing Plan CRUD...\n";
    $plan = Plan::create([
        'name' => 'Pro Plan',
        'slug' => 'pro-plan-' . uniqid(),
        'price' => 5000,
        'features' => ['all' => true]
    ]);
    if (!$plan) throw new Exception("Failed to create Plan.");
    $plan->update(['name' => 'Premium Plan']);
    $readPlan = Plan::find($plan->id);
    if ($readPlan->name !== 'Premium Plan') throw new Exception("Failed to read/update Plan.");
    $plan->delete();
    echo "   [OK] Plan CRUD\n";

    echo "2. Testing Tenant CRUD...\n";
    $tenant = Tenant::create([
        'id' => 'test-tenant-' . uniqid(),
        'name' => 'Test Clinic',
        'domain' => 'test-clinic.localhost'
    ]);
    if (!$tenant) throw new Exception("Failed to create Tenant.");
    $tenant->update(['name' => 'Updated Clinic']);
    if (Tenant::find($tenant->id)->name !== 'Updated Clinic') throw new Exception("Failed to read/update Tenant.");
    
    // Test subscription or similar relation if possible
    // ...
    
    $tenant->delete();
    echo "   [OK] Tenant CRUD\n";

} catch (\Exception $e) {
    echo "   [ERROR] " . $e->getMessage() . "\n";
    $errors[] = $e->getMessage();
}

DB::rollBack();

echo "Verification complete.\n";
