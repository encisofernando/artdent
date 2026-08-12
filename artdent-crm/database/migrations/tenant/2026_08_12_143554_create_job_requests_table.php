<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->constrained()->cascadeOnDelete();
            $table->string('patient_name')->nullable();
            $table->string('job_type_label')->nullable();
            $table->date('due_date_requested')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('pending');
            $table->foreignId('job_id')->nullable()->constrained('jobs')->nullOnDelete();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['dentist_id', 'status'], 'idx_jr_dentist_status');
        });

        Schema::create('job_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_request_id')->constrained()->cascadeOnDelete();
            $table->string('filename');
            $table->string('url', 500);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedInteger('size_bytes')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('job_request_id', 'idx_jra_request');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_request_attachments');
        Schema::dropIfExists('job_requests');
    }
};
