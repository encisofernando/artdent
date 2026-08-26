<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_account_payment_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('image_url', 500);
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('pending');
            $table->foreignId('lab_account_move_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['dentist_id', 'status'], 'idx_lapr_dentist_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_account_payment_reports');
    }
};
