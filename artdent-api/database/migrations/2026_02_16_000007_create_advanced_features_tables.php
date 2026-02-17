<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Product comparison lists
        Schema::create('product_comparisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable(); // For non-logged users
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('position')->default(0); // Order in comparison
            $table->timestamps();
            
            $table->index(['user_id', 'position']);
            $table->index(['session_id', 'position']);
        });

        // Search history
        Schema::create('search_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('query');
            $table->integer('results_count')->default(0);
            $table->json('filters')->nullable(); // Category, price range, etc
            $table->boolean('has_results')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index('query');
        });

        // Popular searches (aggregated)
        Schema::create('popular_searches', function (Blueprint $table) {
            $table->id();
            $table->string('query')->unique();
            $table->integer('search_count')->default(1);
            $table->integer('click_count')->default(0); // How many times results were clicked
            $table->decimal('conversion_rate', 5, 2)->default(0); // % of searches that led to purchase
            $table->timestamp('last_searched_at');
            $table->timestamps();
            
            $table->index('search_count');
        });

        // Product views/clicks tracking
        Schema::create('product_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable();
            $table->enum('event_type', ['view', 'click', 'add_to_cart', 'add_to_wishlist', 'purchase']);
            $table->string('source')->nullable(); // search, category, recommendation, etc
            $table->string('search_query')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['product_id', 'event_type']);
            $table->index('created_at');
        });

        // Email marketing subscribers
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('preferences')->nullable(); // Categories of interest, frequency, etc
            $table->string('unsubscribe_token')->unique();
            $table->timestamp('subscribed_at');
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();
            
            $table->index(['company_id', 'is_active']);
        });

        // Email campaigns
        Schema::create('email_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('subject');
            $table->text('content');
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'cancelled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->integer('recipients_count')->default(0);
            $table->integer('opened_count')->default(0);
            $table->integer('clicked_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaigns');
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('product_analytics');
        Schema::dropIfExists('popular_searches');
        Schema::dropIfExists('search_history');
        Schema::dropIfExists('product_comparisons');
    }
};
