<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('ecommerce_orders')->cascadeOnDelete();
            
            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'refunded'
            ]);
            
            // Details
            $table->text('notes')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            
            // Shipping info
            $table->string('carrier')->nullable(); // Correo Argentino, Andreani, etc.
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            
            // Who updated
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Notification sent
            $table->boolean('notification_sent')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['order_id', 'created_at']);
            $table->index('status');
        });

        // Add tracking fields to orders table
        if (!Schema::hasColumn('ecommerce_orders', 'current_status')) {
            Schema::table('ecommerce_orders', function (Blueprint $table) {
                $table->enum('current_status', [
                    'pending',
                    'confirmed',
                    'processing',
                    'shipped',
                    'in_transit',
                    'out_for_delivery',
                    'delivered',
                    'cancelled',
                    'refunded'
                ])->default('pending')->after('status');
                
                $table->string('tracking_number')->nullable()->after('total');
                $table->timestamp('shipped_at')->nullable()->after('tracking_number');
                $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_tracking');
        
        if (Schema::hasColumn('ecommerce_orders', 'current_status')) {
            Schema::table('ecommerce_orders', function (Blueprint $table) {
                $table->dropColumn(['current_status', 'tracking_number', 'shipped_at', 'delivered_at']);
            });
        }
    }
};
