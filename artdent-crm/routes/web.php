<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {

    require __DIR__.'/modules/dashboard.php';

    require __DIR__.'/modules/products.php';
    require __DIR__.'/modules/inventory.php';

    require __DIR__.'/modules/clinic.php';
    require __DIR__.'/modules/laboratory.php';

    require __DIR__.'/modules/sales.php';
    require __DIR__.'/modules/finance.php';

    require __DIR__.'/modules/hr.php';
    require __DIR__.'/modules/ecommerce.php';

    require __DIR__.'/modules/admin.php';
    require __DIR__.'/modules/user.php';

    require __DIR__.'/modules/profile.php';

});

// Panel de asignación — usa auth:sanctum (Bearer token) fuera del grupo de sesión
require __DIR__.'/modules/assign-panel.php';

require __DIR__.'/auth.php';
