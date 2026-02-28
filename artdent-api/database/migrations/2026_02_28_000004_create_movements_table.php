<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movements', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('client_id'); // clinic_id (odontólogo)
            $table->date('date');

            // charge = Cargo (debe), payment = Pago (haber)
            $table->enum('type', ['charge', 'payment']);

            $table->decimal('amount', 14, 2)->default(0);
            $table->string('description')->nullable();
            $table->string('method')->nullable();
            $table->string('reference')->nullable();

            $table->unsignedBigInteger('job_id')->nullable(); // si viene de una orden
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('client_id')->references('id')->on('clinics');
            $table->foreign('job_id')->references('id')->on('jobs')->nullOnDelete();

            $table->index(['company_id','client_id','date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
