<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->string('cuil', 20)->nullable()->after('dni');
            $table->date('birth_date')->nullable()->after('cuil');
            $table->string('gender', 30)->nullable()->after('birth_date');
            $table->string('marital_status', 30)->nullable()->after('gender');
            $table->string('nationality', 100)->nullable()->after('marital_status');
            $table->string('address', 255)->nullable()->after('nationality');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('province', 100)->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('province');
            $table->string('phone', 30)->nullable()->after('postal_code');
            $table->string('personal_email', 191)->nullable()->after('phone');
            $table->string('bank_cbu', 22)->nullable()->after('personal_email');
            $table->string('health_insurance', 191)->nullable()->after('bank_cbu');
            $table->string('photo_path', 255)->nullable()->after('health_insurance');
            $table->unsignedBigInteger('department_id')->nullable()->after('branch_id');
            $table->unsignedBigInteger('position_id')->nullable()->after('department_id');
            $table->unsignedBigInteger('supervisor_id')->nullable()->after('position_id');

            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            $table->foreign('position_id')->references('id')->on('positions')->nullOnDelete();
            $table->foreign('supervisor_id')->references('id')->on('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['position_id']);
            $table->dropForeign(['supervisor_id']);
            $table->dropColumn([
                'cuil', 'birth_date', 'gender', 'marital_status', 'nationality',
                'address', 'city', 'province', 'postal_code', 'phone', 'personal_email',
                'bank_cbu', 'health_insurance', 'photo_path',
                'department_id', 'position_id', 'supervisor_id',
            ]);
        });
    }
};
