<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentsController extends Controller
{
    public function index(Request $r){
        $cid=$r->user()->company_id;
        return DB::table('payments')->where('company_id',$cid)->orderBy('id','desc')->paginate(25);
    }
    public function store(Request $r){
        $cid=$r->user()->company_id;
        $data=$r->validate([
            'purchase_id'=>'sometimes|nullable|integer',
            'payment_method_id'=>'required|integer',
            'amount'=>'required|numeric',
            'reference'=>'sometimes|nullable|string|max:191',
        ]);
        $data['company_id']=$cid;
        $id=DB::table('payments')->insertGetId($data);
        return response()->json(DB::table('payments')->where('id',$id)->first(),201);
    }
}
