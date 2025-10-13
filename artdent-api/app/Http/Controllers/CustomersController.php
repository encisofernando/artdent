<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;

class CustomersController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        $q = Customer::where('company_id',$cid);
        if($s = $r->get('q')){
            $q->where(function($w) use($s){
                $w->where('name','like',"%$s%")
                  ->orWhere('email','like',"%$s%");
            });
        }
        return $q->orderBy('id','desc')->paginate(25);
    }
    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'name'=>'required|string|max:191',
            'email'=>'nullable|email|max:191',
            'tax_id'=>'nullable|string|max:32'
        ]);
        $data['company_id']=$cid;
        $c = Customer::create($data);
        return response()->json($c,201);
    }
    public function show(Request $r, Customer $customer){
        $this->authorizeCustomer($r,$customer);
        return $customer;
    }
    public function update(Request $r, Customer $customer){
        $this->authorizeCustomer($r,$customer);
        $data = $r->validate([
            'name'=>'sometimes|string|max:191',
            'email'=>'sometimes|nullable|email|max:191',
            'tax_id'=>'sometimes|nullable|string|max:32'
        ]);
        $customer->update($data);
        return $customer;
    }
    public function destroy(Request $r, Customer $customer){
        $this->authorizeCustomer($r,$customer);
        $customer->delete();
        return response()->noContent();
    }
    protected function authorizeCustomer(Request $r, Customer $c){
        $cid = $r->user()->company_id;
        abort_unless($c->company_id == $cid, 403, 'Forbidden');
    }
}
