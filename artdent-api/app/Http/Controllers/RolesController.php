<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RolesController extends Controller
{
    public function index(){
        return DB::table('roles')->select('id','name')->orderBy('id')->get();
    }
}
