<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ecommerce_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('code', 64)->unique();
            $table->string('status', 32)->default('pending');
            $table->string('pricing_mode', 10)->default('b2c');

            $table->string('customer_name', 191);
            $table->string('customer_email', 191);
            $table->string('customer_phone', 64)->nullable();
            $table->text('shipping_address')->nullable();
            $table->text('notes')->nullable();

            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax_total', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->string('currency', 8)->default('ARS');

            $table->timestamps();

            $table->index(['company_id', 'created_at']);
            $table->index(['customer_email']);

            $table->foreign('company_id')->references('id')->on('companies')->onUpdate('cascade');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->nullOnDelete()->onUpdate('cascade');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete()->onUpdate('cascade');
        });

        Schema::create('ecommerce_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id');

            $table->string('sku', 64)->nullable();
            $table->string('name', 191);
            $table->decimal('qty', 14, 3);
            $table->decimal('unit_price', 14, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);

            $table->decimal('line_subtotal', 14, 2);
            $table->decimal('line_tax', 14, 2)->default(0);
            $table->decimal('line_total', 14, 2);

            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['product_id']);

            $table->foreign('order_id')->references('id')->on('ecommerce_orders')->cascadeOnDelete()->onUpdate('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecommerce_order_items');
        Schema::dropIfExists('ecommerce_orders');
    }
};
