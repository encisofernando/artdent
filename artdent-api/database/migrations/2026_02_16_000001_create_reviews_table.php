<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('ecommerce_orders')->nullOnDelete();
            
            // Review data
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            
            // Verification
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(true);
            
            // Images
            $table->json('images')->nullable(); // Array de URLs
            
            // Stats
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            
            // Admin response
            $table->text('vendor_response')->nullable();
            $table->timestamp('vendor_response_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['product_id', 'is_approved']);
            $table->index('rating');
        });

        // Review helpful votes
        Schema::create('review_helpful_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->boolean('is_helpful'); // true = helpful, false = not helpful
            $table->timestamps();
            
            $table->unique(['review_id', 'user_id']);
            $table->index(['review_id', 'session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_helpful_votes');
        Schema::dropIfExists('reviews');
    }
};
