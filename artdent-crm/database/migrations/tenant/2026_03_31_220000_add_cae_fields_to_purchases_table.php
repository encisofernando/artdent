<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table): void {
            if (! Schema::hasColumn('purchases', 'cae')) {
                $table->string('cae', 20)->nullable()->after('invoice_number');
            }

            if (! Schema::hasColumn('purchases', 'cae_due_date')) {
                $table->date('cae_due_date')->nullable()->after('cae');
            }
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table): void {
            $columns = [];

            if (Schema::hasColumn('purchases', 'cae')) {
                $columns[] = 'cae';
            }

            if (Schema::hasColumn('purchases', 'cae_due_date')) {
                $columns[] = 'cae_due_date';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
