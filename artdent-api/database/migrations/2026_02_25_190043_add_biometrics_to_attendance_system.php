<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('collaborators', function (Blueprint $table) {
            $table->string('faceio_fid')->nullable()->unique()->after('notes');
        });

        Schema::table('collaborator_attendances', function (Blueprint $table) {
            $table->string('method')->default('manual')->after('notes'); // qr, face, fingerprint, manual
            $table->string('ip_address', 45)->nullable();
            $table->text('device_info')->nullable();
        });
    }

    public function down()
    {
        Schema::table('collaborators', fn($t) => $t->dropColumn('faceio_fid'));
        Schema::table('collaborator_attendances', fn($t) => $t->dropColumn(['method','ip_address','device_info']));
    }
};
