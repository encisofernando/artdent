<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Placeholder de arquitectura — ver nota en la migración `create_payroll_book_submissions_table`.
 * Ninguna fila de esta tabla representa un envío real todavía.
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $payroll_run_id
 * @property string $period
 * @property string $status
 * @property array|null $request_payload
 * @property array|null $response_payload
 * @property Carbon|null $submitted_at
 * @property Company $company
 * @property PayrollRun|null $payrollRun
 */
class PayrollBookSubmission extends Model
{
    use BelongsToCompany;

    protected $casts = [
        'company_id' => 'int',
        'payroll_run_id' => 'int',
        'request_payload' => 'array',
        'response_payload' => 'array',
        'submitted_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'payroll_run_id',
        'period',
        'status',
        'request_payload',
        'response_payload',
        'submitted_at',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }
}
