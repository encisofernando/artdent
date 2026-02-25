<?php
// routes/web.php

use Illuminate\Support\Facades\Route;

// ── Health check / API info ───────────────────────────────────────────────────
Route::get('/', function () {
    return response()->json(['api' => 'ArtDentAPI', 'ok' => true]);
});

// ── Sanctum CSRF cookie ───────────────────────────────────────────────────────
// GET /sanctum/csrf-cookie ya está registrado automáticamente por el
// ServiceProvider de Sanctum. NO es necesario definirlo acá.
//
// El frontend lo llama vía ensureCsrf() en api.js antes de cada mutación:
//   await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
// ─────────────────────────────────────────────────────────────────────────────

// ── SPA fallback ──────────────────────────────────────────────────────────────
// Si el backend también sirve el frontend compilado (no es el caso si usás
// subdominios separados), este catch-all devuelve index.html para que el
// router de React maneje la navegación en el cliente.
//
// Descomentarlo SOLO si servís el front desde Laravel:
//
// Route::get('/{any}', function () {
//     return response()->file(public_path('index.html'));
// })->where('any', '.*');
//
// ─────────────────────────────────────────────────────────────────────────────
