<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $company_id
 * @property int $user_id
 * @property int|null $branch_id
 * @property int|null $department_id
 * @property int|null $position_id
 * @property int|null $supervisor_id
 * @property int|null $labor_agreement_category_id
 * @property int|null $art_provider_id
 * @property string|null $dni
 * @property string|null $cuil
 * @property string|null $position
 * @property Carbon|null $birth_date
 * @property string|null $gender
 * @property string|null $marital_status
 * @property string|null $nationality
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $postal_code
 * @property string|null $phone
 * @property string|null $personal_email
 * @property string|null $bank_cbu
 * @property string|null $bank_name
 * @property string|null $hik_employee_no
 * @property string|null $health_insurance
 * @property string|null $photo_path
 * @property float|null $salary
 * @property float $commission_pct
 * @property float $job_commission_pct
 * @property Carbon|null $hire_date
 * @property Carbon|null $end_date
 * @property bool $is_active
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property User $user
 * @property Branch|null $branch
 * @property Department|null $department
 * @property Position|null $jobPosition
 * @property Employee|null $supervisor
 * @property Collection|Employee[] $subordinates
 * @property LaborAgreementCategory|null $laborAgreementCategory
 * @property Collection|EmployeeExtra[] $extras
 * @property Collection|EmployeeDiscount[] $discounts
 * @property Collection|EmployeeReceipt[] $receipts
 * @property Collection|EmployeeDocument[] $documents
 * @property Collection|EmployeeFamilyMember[] $familyMembers
 * @property Collection|EmployeeAttendance[] $attendances
 * @property Collection|EmployeeWebAuthnCredential[] $webAuthnCredentials
 * @property Collection|LeaveBalance[] $leaveBalances
 * @property Collection|LeaveRequest[] $leaveRequests
 * @property ArtProvider|null $artProvider
 * @property Collection|MedicalExam[] $medicalExams
 * @property Collection|ArtAccident[] $artAccidents
 * @property Collection|Evaluation[] $evaluations
 * @property Collection|Objective[] $objectives
 * @property Collection|TrainingEnrollment[] $trainingEnrollments
 */
class Employee extends Model
{
    use BelongsToCompany;
    use SoftDeletes;

    protected $table = 'employees';

    protected $casts = [
        'company_id' => 'int',
        'user_id' => 'int',
        'branch_id' => 'int',
        'department_id' => 'int',
        'position_id' => 'int',
        'supervisor_id' => 'int',
        'labor_agreement_category_id' => 'int',
        'art_provider_id' => 'int',
        'birth_date' => 'date:Y-m-d',
        'salary' => 'float',
        'commission_pct' => 'float',
        'job_commission_pct' => 'float',
        'hire_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'branch_id',
        'department_id',
        'position_id',
        'supervisor_id',
        'labor_agreement_category_id',
        'art_provider_id',
        'dni',
        'cuil',
        'position',
        'birth_date',
        'gender',
        'marital_status',
        'nationality',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'personal_email',
        'bank_cbu',
        'bank_name',
        'hik_employee_no',
        'health_insurance',
        'photo_path',
        'salary',
        'commission_pct',
        'job_commission_pct',
        'hire_date',
        'end_date',
        'is_active',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function jobPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'supervisor_id');
    }

    public function laborAgreementCategory(): BelongsTo
    {
        return $this->belongsTo(LaborAgreementCategory::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(EmployeeExtra::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(EmployeeDiscount::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(EmployeeReceipt::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function familyMembers(): HasMany
    {
        return $this->hasMany(EmployeeFamilyMember::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EmployeeAttendance::class);
    }

    public function webAuthnCredentials(): HasMany
    {
        return $this->hasMany(EmployeeWebAuthnCredential::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function artProvider(): BelongsTo
    {
        return $this->belongsTo(ArtProvider::class);
    }

    public function medicalExams(): HasMany
    {
        return $this->hasMany(MedicalExam::class);
    }

    public function artAccidents(): HasMany
    {
        return $this->hasMany(ArtAccident::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function objectives(): HasMany
    {
        return $this->hasMany(Objective::class);
    }

    public function trainingEnrollments(): HasMany
    {
        return $this->hasMany(TrainingEnrollment::class);
    }
}
