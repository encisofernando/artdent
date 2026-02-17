<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Notification type
            $table->enum('type', [
                'order_status',
                'price_alert',
                'back_in_stock',
                'promotion',
                'review_response',
                'system'
            ]);
            
            // Content
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Extra metadata (order_id, product_id, etc.)
            
            // Status
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            
            // Link
            $table->string('action_url')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'is_read']);
            $table->index('type');
        });

        // User notification preferences
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Email preferences
            $table->boolean('email_order_updates')->default(true);
            $table->boolean('email_promotions')->default(true);
            $table->boolean('email_price_alerts')->default(true);
            $table->boolean('email_reviews')->default(true);
            
            // Push preferences
            $table->boolean('push_order_updates')->default(true);
            $table->boolean('push_promotions')->default(false);
            $table->boolean('push_price_alerts')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
        Schema::dropIfExists('notifications');
    }
};
