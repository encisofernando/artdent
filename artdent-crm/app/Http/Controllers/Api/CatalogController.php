<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CatalogController extends Controller
{