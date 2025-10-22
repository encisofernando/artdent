<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tax;

class TaxesController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        return Tax::where('company_id',$cid)->orderBy('is_default','desc')->orderBy('name')->get();
    }

    public function show(Request $r, Tax $tax){
        $this->authorizeRow($r, $tax);
        return $tax;
    }

    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'name' => 'required|string|max:191',
            'rate' => 'required|numeric',
            'is_default' => 'sometimes|in:0,1'
        ]);
        $data['company_id'] = $cid;
        $row = Tax::create($data);
        return response()->json($row, 201);
    }

    public function update(Request $r, Tax $tax){
        $this->authorizeRow($r, $tax);
        $data = $r->validate([
            'name' => 'sometimes|string|max:191',
            'rate' => 'sometimes|numeric',
            'is_default' => 'sometimes|in:0,1'
        ]);
        $tax->update($data);
        return $tax;
    }

    public function destroy(Request $r, Tax $tax){
        $this->authorizeRow($r, $tax);
        $tax->delete();
        return response()->json(['ok'=>true]);
    }

    protected function authorizeRow(Request $r, Tax $row){
        abort_unless($row->company_id == $r->user()->company_id, 403, 'Forbidden');
    }
}
