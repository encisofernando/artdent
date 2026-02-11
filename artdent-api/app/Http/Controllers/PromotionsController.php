<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PromotionsController extends Controller
{
    /**
     * Por ahora el esquema de base de datos no incluye tabla "promotions".
     * Se deja el endpoint para que el frontend pueda renderizar la sección sin romper.
     */
    public function index(Request $request)
    {
        return response()->json([]);
    }
}
