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
                  ->orWhere('email','like',"%$s%")
                  ->orWhere('tax_id','like',"%$s%")
                  ->orWhere('code','like',"%$s%");
            });
        }
        return $q->orderBy('id','desc')->paginate(25);
    }

    public function show(Request $r, Customer $customer){
        $this->authorizeCustomer($r, $customer);
        return $customer;
    }

    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate($this->rules(false));
        $data['company_id'] = $cid;
        $c = Customer::create($data);
        return response()->json($c, 201);
    }

    public function update(Request $r, Customer $customer){
        $this->authorizeCustomer($r, $customer);
        $data = $r->validate($this->rules(true));
        $customer->update($data);
        return $customer;
    }

    public function destroy(Request $r, Customer $customer){
        $this->authorizeCustomer($r, $customer);
        $customer->delete();
        return response()->json(['ok'=>true]);
    }

    protected function authorizeCustomer(Request $r, Customer $c){
        $cid = $r->user()->company_id;
        abort_unless($c->company_id == $cid, 403, 'Forbidden');
    }

    protected function rules($isUpdate=false){
        $base = [
            'code'           => 'nullable|string|max:32',
            'name'           => $isUpdate ? 'sometimes|string|max:191' : 'required|string|max:191',
            'tax_id'         => 'sometimes|nullable|string|max:32',
            'tax_condition'  => 'sometimes|nullable|string|max:64',
            'email'          => 'sometimes|nullable|email|max:191',
            'phone'          => 'sometimes|nullable|string|max:64',
            'address'        => 'sometimes|nullable|string|max:191',
            'city'           => 'sometimes|nullable|string|max:191',
            'state'          => 'sometimes|nullable|string|max:191',
            'zip'            => 'sometimes|nullable|string|max:32',
            'credit_limit'   => 'sometimes|numeric',
            'is_active'      => 'sometimes|in:0,1',
        ];
        return $base;
    }
}
