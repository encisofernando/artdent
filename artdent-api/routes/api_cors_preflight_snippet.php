<?php
// Añadir al final de routes/api.php SOLO para desarrollo
use Illuminate\Support\Facades\Route;

Route::options('/{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');
