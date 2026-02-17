<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            
            // Coupon details
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Discount type
            $table->enum('type', ['percentage', 'fixed', 'free_shipping'])->default('percentage');
            $table->decimal('discount_value', 10, 2)->nullable(); // Amount or percentage
            
            // Limits
            $table->decimal('min_purchase', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable(); // Max discount for percentage
            $table->integer('max_uses')->nullable(); // Total uses allowed
            $table->integer('max_uses_per_user')->default(1);
            $table->integer('current_uses')->default(0);
            
            // Validity
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            
            // Applicability
            $table->json('applicable_categories')->nullable(); // Array of category IDs
            $table->json('applicable_products')->nullable(); // Array of product IDs
            $table->boolean('first_purchase_only')->default(false);
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['code', 'is_active']);
            $table->index('company_id');
        });

        // Coupon usage tracking
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->constrained('ecommerce_orders')->cascadeOnDelete();
            
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();
            
            $table->index(['coupon_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupons');
    }
};
