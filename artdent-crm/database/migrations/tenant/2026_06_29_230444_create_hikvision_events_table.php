<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hikvision_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id')->nullable();
            $table->string('source_ip')->nullable();         // IP del terminal que envió el evento
            $table->string('event_type')->nullable();        // AccessControllerEvent, heartbeat, etc.
            $table->string('employee_no')->nullable();       // Número de empleado del terminal
            $table->string('attendance_status')->nullable(); // checkIn, checkOut, breakIn, breakOut
            $table->string('verify_mode')->nullable();       // face, fingerprint, card, pin
            $table->timestamp('event_time')->nullable();
            $table->json('raw_payload');                     // XML/JSON original del terminal
            $table->unsignedBigInteger('collaborator_id')->nullable(); // Colaborador resuelto
            $table->unsignedBigInteger('attendance_id')->nullable();   // Registro de asistencia creado
            $table->boolean('processed')->default(false);
            $table->string('error', 500)->nullable();
            $table->timestamps();

            $table->foreign('device_id')->references('id')->on('hikvision_devices')->nullOnDelete();
            $table->foreign('collaborator_id')->references('id')->on('collaborators')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hikvision_events');
    }
};
