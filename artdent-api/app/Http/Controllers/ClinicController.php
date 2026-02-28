<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use Illuminate\Http\Request;

class ClinicController extends Controller
{
    public function index(Request $request)
    {
        $query = Clinic::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('active')) {
            $query->where('active', $request->active);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:clinica,odontologo,otrolab,colegio,particular',
            'cuit' => 'nullable|string|max:32',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'balance' => 'nullable|numeric',
            'active' => 'nullable|boolean',
        ]);

        $clinic = Clinic::create($validated);
        return response()->json($clinic, 201);
    }

    public function show($id)
    {
        return response()->json(Clinic::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $clinic = Clinic::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:clinica,odontologo,otrolab,colegio,particular',
            'cuit' => 'nullable|string|max:32',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'balance' => 'nullable|numeric',
            'active' => 'nullable|boolean',
        ]);

        $clinic->update($validated);
        return response()->json($clinic);
    }

    public function destroy($id)
    {
        Clinic::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
