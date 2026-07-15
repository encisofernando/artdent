<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'laboratorio', 'ecommerce', 'chat_ia'...
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // nombre de ícono lucide-react
            $table->boolean('is_active')->default(true); // el módulo existe y se puede vender
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
