<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vendor;

class VendorsController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        $q = Vendor::where('company_id',$cid);
        if($s = $r->get('q')){
            $q->where(function($w) use($s){
                $w->where('name','like',"%$s%")->orWhere('tax_id','like',"%$s%");
            });
        }
        return $q->orderBy('id','desc')->paginate(25);
    }
    public function show(Request $r, Vendor $vendor){
        abort_unless($vendor->company_id == $r->user()->company_id, 403, 'Forbidden');
        return $vendor;
    }
    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'name' => 'required|string|max:191',
            'tax_id' => 'sometimes|nullable|string|max:32',
            'email' => 'sometimes|nullable|email|max:191',
            'phone' => 'sometimes|nullable|string|max:64',
            'address' => 'sometimes|nullable|string|max:191',
            'city' => 'sometimes|nullable|string|max:191',
            'state' => 'sometimes|nullable|string|max:191',
            'zip' => 'sometimes|nullable|string|max:32',
            'is_active' => 'sometimes|in:0,1',
        ]);
        $data['company_id'] = $cid;
        $row = Vendor::create($data);
        return response()->json($row, 201);
    }
    public function update(Request $r, Vendor $vendor){
        abort_unless($vendor->company_id == $r->user()->company_id, 403, 'Forbidden');
        $data = $r->validate([
            'name' => 'sometimes|string|max:191',
            'tax_id' => 'sometimes|nullable|string|max:32',
            'email' => 'sometimes|nullable|email|max:191',
            'phone' => 'sometimes|nullable|string|max:64',
            'address' => 'sometimes|nullable|string|max:191',
            'city' => 'sometimes|nullable|string|max:191',
            'state' => 'sometimes|nullable|string|max:191',
            'zip' => 'sometimes|nullable|string|max:32',
            'is_active' => 'sometimes|in:0,1',
        ]);
        $vendor->update($data);
        return $vendor;
    }
    public function destroy(Request $r, Vendor $vendor){
        abort_unless($vendor->company_id == $r->user()->company_id, 403, 'Forbidden');
        $vendor->delete();
        return response()->json(['ok'=>true]);
    }
}
