<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobItem;
use App\Models\Dentist;
use App\Models\Patient;
use App\Models\JobType;
use App\Models\Tariff;
use App\Models\User;
use App\Models\LabAccount;
use App\Models\LabAccountMove;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with(['dentist','patient','jobType']);

        if ($request->search) {
            $search = $request->search;

            $query->where(function($q) use ($search) {

                $q->where('job_number','like',"%$search%")

                ->orWhereHas('dentist', function($d) use ($search){
                    $d->where('name','like',"%$search%");
                })

                ->orWhereHas('patient', function($p) use ($search){
                    $p->where('name','like',"%$search%");
                });
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status',$request->status);
        }

        $items = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Job/Index',[
            'items' => $items,
            'filters' => $request->only('search','status')
        ]);
    }

    public function create()
    {
        return Inertia::render('Job/Create',[
            'dentists' => Dentist::orderBy('name')->get(),
            'patients' => Patient::orderBy('name')->get(),
            'jobTypes' => JobType::orderBy('name')->get(),
            'users' => User::orderBy('name')->get(),
            'tariffs' => Tariff::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'patient_name' => 'nullable|string|max:255',
            'job_type_id' => 'nullable|exists:job_types,id',

            'assigned_user_id' => 'nullable|exists:users,id',

            'status' => 'required|string',
            'priority' => 'required|string',

            'clinical_notes' => 'nullable|string',
            'shade' => 'nullable|string',

            'received_at' => 'required|date',
            'due_date' => 'required|date',

            'discount_amount' => 'nullable|numeric',

            'items' => 'required|array|min:1',
            'items.*.tariff_id' => 'required|exists:tariffs,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',

            'teeth' => 'nullable|array'
        ]);

        DB::transaction(function() use ($data) {

            $patient = null;

            if (!empty($data['patient_name'])) {

                $patient = Patient::firstOrCreate([
                    'name' => $data['patient_name'],
                    'dentist_id' => $data['dentist_id']
                ]);
            }

            $subtotal = 0;

            foreach ($data['items'] as $item) {

                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $discount = $data['discount_amount'] ?? 0;

            $total = $subtotal - $discount;

            $job = Job::create([
                'dentist_id' => $data['dentist_id'],
                'patient_id' => $patient?->id,
                'job_type_id' => $data['job_type_id'] ?? null,
                'assigned_user_id' => $data['assigned_user_id'] ?? null,
                'status' => $data['status'],
                'priority' => $data['priority'],
                'clinical_notes' => $data['clinical_notes'] ?? null,
                'shade' => $data['shade'] ?? null,
                'received_at' => $data['received_at'],
                'due_date' => $data['due_date'],
                'discount_amount' => $discount,
                'subtotal' => $subtotal,
                'total' => $total
            ]);

            foreach ($data['items'] as $item) {

                JobItem::create([
                    'job_id' => $job->id,
                    'tariff_id' => $item['tariff_id'],
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price']
                ]);
            }

            $this->chargeAccountIfNeeded($job);
        });

        return redirect()
            ->route('jobs.index')
            ->with('success','Trabajo registrado correctamente');
    }

    protected function chargeAccountIfNeeded(Job $job)
    {
        if ($job->total <= 0) {
            return;
        }

        $alreadyCharged = LabAccountMove::where('reference_type', Job::class)
            ->where('reference_id', $job->id)
            ->where('type', LabAccountMove::TYPE_CHARGE)
            ->exists();

        if ($alreadyCharged) {
            return;
        }

        $account = LabAccount::firstOrCreate(
            ['dentist_id' => $job->dentist_id],
            ['balance' => 0]
        );

        $account->balance += $job->total;
        $account->save();

        LabAccountMove::create([
            'lab_account_id' => $account->id,
            'user_id' => auth()->id(),
            'type' => LabAccountMove::TYPE_CHARGE,
            'amount' => $job->total,
            'balance_after' => $account->balance,
            'description' => 'Cargo por orden '.$job->job_number,
            'reference_type' => Job::class,
            'reference_id' => $job->id,
            'move_date' => now()
        ]);
    }

    public function destroy(Job $job)
    {
        DB::transaction(function () use ($job) {

            $move = LabAccountMove::where('reference_type', Job::class)
                ->where('reference_id', $job->id)
                ->where('type', LabAccountMove::TYPE_CHARGE)
                ->first();

            if ($move) {

                $account = $move->account;

                $account->balance -= $move->amount;
                $account->save();

                $move->delete();
            }

            $job->delete();
        });

        return back()->with('success','Trabajo eliminado');
    }
}