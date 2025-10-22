<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;

class EmployeesController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id;
        $q = Employee::where('company_id',$cid);
        if($s = $r->get('q')){
            $q->where(function($w) use($s){
                $w->where('first_name','like',"%$s%") // adjust if columns differ
                  ->orWhere('last_name','like',"%$s%");
            });
        }
        return $q->orderBy('id','desc')->paginate(25);
    }
    public function show(Request $r, Employee $employee){
        abort_unless($employee->company_id == $r->user()->company_id, 403, 'Forbidden');
        return $employee;
    }
    public function store(Request $r){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'user_id'   => 'sometimes|nullable|integer',
            'branch_id' => 'sometimes|nullable|integer',
            'first_name'=> 'required|string|max:191',
            'last_name' => 'sometimes|nullable|string|max:191',
            'email'     => 'sometimes|nullable|email|max:191',
            'phone'     => 'sometimes|nullable|string|max:64',
            'is_active' => 'sometimes|in:0,1'
        ]);
        $data['company_id'] = $cid;
        $row = Employee::create($data);
        return response()->json($row,201);
    }
    public function update(Request $r, Employee $employee){
        abort_unless($employee->company_id == $r->user()->company_id, 403, 'Forbidden');
        $data = $r->validate([
            'first_name'=> 'sometimes|string|max:191',
            'last_name' => 'sometimes|nullable|string|max:191',
            'email'     => 'sometimes|nullable|email|max:191',
            'phone'     => 'sometimes|nullable|string|max:64',
            'is_active' => 'sometimes|in:0,1'
        ]);
        $employee->update($data);
        return $employee;
    }
    public function destroy(Request $r, Employee $employee){
        abort_unless($employee->company_id == $r->user()->company_id, 403, 'Forbidden');
        $employee->delete();
        return response()->json(['ok'=>true]);
    }
}
