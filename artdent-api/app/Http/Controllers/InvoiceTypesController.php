<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class InvoiceTypesController extends Controller
{
    public function index(){
        return DB::table('invoice_types')->select('id','code','description')->orderBy('id')->get();
    }
}
