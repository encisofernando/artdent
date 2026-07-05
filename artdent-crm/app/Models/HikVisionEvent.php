<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HikVisionEvent extends Model
{
    protected $table = 'hikvision_events';

    protected $fillable = [
        'device_id',
        'source_ip',
        'event_type',
        'employee_no',
        'attendance_status',
        'verify_mode',
        'event_time',
        'raw_payload',
        'collaborator_id',
        'employee_id',
        'attendance_id',
        'processed',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'raw_payload' => 'array',
            'processed' => 'boolean',
            'event_time' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(HikVisionDevice::class, 'device_id');
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(CollaboratorAttendance::class, 'attendance_id');
    }
}
