<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentMethod;

class PaymentMethodsController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        return PaymentMethod::where('company_id',$cid)->orderBy('name')->get();
    }

    public function show(Request $r, PaymentMethod $payment_method){
        $this->authorizeRow($r, $payment_method);
        return $payment_method;
    }

    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'name' => 'required|string|max:191',
            'code' => 'required|string|max:32'
        ]);
        $data['company_id'] = $cid;
        $row = PaymentMethod::create($data);
        return response()->json($row, 201);
    }

    public function update(Request $r, PaymentMethod $payment_method){
        $this->authorizeRow($r, $payment_method);
        $data = $r->validate([
            'name' => 'sometimes|string|max:191',
            'code' => 'sometimes|string|max:32'
        ]);
        $payment_method->update($data);
        return $payment_method;
    }

    public function destroy(Request $r, PaymentMethod $payment_method){
        $this->authorizeRow($r, $payment_method);
        $payment_method->delete();
        return response()->json(['ok'=>true]);
    }

    protected function authorizeRow(Request $r, PaymentMethod $row){
        abort_unless($row->company_id == $r->user()->company_id, 403, 'Forbidden');
    }
}
