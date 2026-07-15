<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Collaborator
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $document
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property Carbon|null $birth_date
 * @property float $hourly_rate
 * @property string|null $specialty
 * @property string|null $faceio_fid
 * @property bool|null $is_active
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Company $company
 * @property Collection|CollaboratorAttendance[] $collaborator_attendances
 * @property Collection|CollaboratorDiscount[] $collaborator_discounts
 * @property Collection|CollaboratorExtra[] $collaborator_extras
 * @property Collection|CollaboratorReceipt[] $collaborator_receipts
 * @property Collection|Job[] $jobs
 */
class Collaborator extends Model
{
    use SoftDeletes;

    protected $table = 'collaborators';

    protected $casts = [
        'company_id' => 'int',
        'birth_date' => 'date:Y-m-d',
        'hourly_rate' => 'float',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'document',
        'email',
        'phone',
        'address',
        'birth_date',
        'hourly_rate',
        'specialty',
        'faceio_fid',
        'hik_employee_no',
        'pin',
        'is_active',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function collaborator_attendances()
    {
        return $this->hasMany(CollaboratorAttendance::class);
    }

    public function collaborator_discounts()
    {
        return $this->hasMany(CollaboratorDiscount::class);
    }

    public function collaborator_extras()
    {
        return $this->hasMany(CollaboratorExtra::class);
    }

    public function collaborator_receipts()
    {
        return $this->hasMany(CollaboratorReceipt::class);
    }

    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'job_collaborators')
            ->withPivot('id', 'assigned_by', 'role', 'assigned_at', 'completed_at', 'notes')
            ->withTimestamps();
    }
}
