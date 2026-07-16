<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla de colas de Laravel para las BD de tenant, con nombre propio
 * (queue_jobs, no jobs) porque `jobs` ya está tomado por el modelo de
 * negocio App\Models\Job (trabajos de laboratorio) — ver config/queue.php
 * `DB_QUEUE_TABLE`. Sin esto, QUEUE_CONNECTION=database inserta contra el
 * esquema equivocado y todo lo que se encola falla en silencio.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('queue_jobs')) {
            return;
        }

        Schema::create('queue_jobs', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        if (! Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table): void {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_jobs');
        Schema::dropIfExists('failed_jobs');
    }
};
