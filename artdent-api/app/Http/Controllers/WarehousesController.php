<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warehouse;

class WarehousesController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        return Warehouse::where('company_id',$cid)->orderBy('id','desc')->paginate(25);
    }
    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'name'=>'required|string|max:191',
            'code'=>'nullable|string|max:32',
            'is_active'=>'sometimes|boolean'
        ]);
        $data['company_id']=$cid;
        $w = Warehouse::create($data);
        return response()->json($w,201);
    }
    public function show(Request $r, Warehouse $warehouse){
        $this->authorizeWarehouse($r,$warehouse);
        return $warehouse;
    }
    public function update(Request $r, Warehouse $warehouse){
        $this->authorizeWarehouse($r,$warehouse);
        $data = $r->validate([
            'name'=>'sometimes|string|max:191',
            'code'=>'sometimes|nullable|string|max:32',
            'is_active'=>'sometimes|boolean'
        ]);
        $warehouse->update($data);
        return $warehouse;
    }
    public function destroy(Request $r, Warehouse $warehouse){
        $this->authorizeWarehouse($r,$warehouse);
        $warehouse->delete();
        return response()->noContent();
    }
    protected function authorizeWarehouse(Request $r, Warehouse $w){
        $cid = $r->user()->company_id;
        abort_unless($w->company_id == $cid, 403, 'Forbidden');
    }

    public function taxes()
    {
        // Placeholder simple (ajustá a tu modelo/tabla si ya existe)
        // Estructura esperada por el frontend: id / name / rate
        return response()->json([
            ['id' => 0,  'name' => 'Exento',   'rate' => 0],
            ['id' => 10, 'name' => 'IVA 10.5', 'rate' => 10.5],
            ['id' => 21, 'name' => 'IVA 21',   'rate' => 21],
            ['id' => 27, 'name' => 'IVA 27',   'rate' => 27],
        ]);
    }

    public function paymentMethods()
    {
        // Placeholder: ajustá a lo que uses realmente
        return response()->json([
            ['id' => 'cash',     'name' => 'Efectivo'],
            ['id' => 'debit',    'name' => 'Débito'],
            ['id' => 'credit',   'name' => 'Crédito'],
            ['id' => 'transfer', 'name' => 'Transferencia'],
        ]);
    }
}
