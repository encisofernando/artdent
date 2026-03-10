<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Product
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $vendor_id
 * @property int|null $category_id
 * @property int|null $tax_id
 * @property string $name
 * @property string $slug
 * @property string|null $sku
 * @property string|null $barcode
 * @property string|null $short_description
 * @property string|null $description
 * @property float|null $cost_price
 * @property float $price
 * @property float|null $compare_price
 * @property bool|null $has_variants
 * @property bool|null $track_stock
 * @property float|null $weight
 * @property bool|null $is_active
 * @property bool|null $is_featured
 * @property string|null $meta_title
 * @property string|null $meta_desc
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property float|null $tax_rate
 * @property Category|null $category
 * @property Company $company
 * @property Tax|null $tax
 * @property Vendor|null $vendor
 * @property Collection|EcommerceOrderItem[] $ecommerce_order_items
 * @property Collection|ProductImage[] $product_images
 * @property Collection|ProductVariant[] $product_variants
 * @property Collection|PurchaseItem[] $purchase_items
 * @property Collection|Review[] $reviews
 * @property Collection|SaleItem[] $sale_items
 * @property Collection|StockMovement[] $stock_movements
 * @property Collection|Stock[] $stocks
 * @property Collection|Wishlist[] $wishlists
 */
class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';

    protected $casts = [
        'company_id' => 'int',
        'vendor_id' => 'int',
        'category_id' => 'int',
        'tax_id' => 'int',
        'cost_price' => 'float',
        'price' => 'float',
        'compare_price' => 'float',
        'has_variants' => 'bool',
        'track_stock' => 'bool',
        'weight' => 'float',
        'is_active' => 'bool',
        'is_featured' => 'bool',
        'internal_use' => 'bool',
        'tax_rate' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'vendor_id',
        'category_id',
        'tax_id',
        'product_type',
        'internal_use',
        'name',
        'slug',
        'sku',
        'barcode',
        'short_description',
        'description',
        'cost_price',
        'price',
        'compare_price',
        'has_variants',
        'track_stock',
        'weight',
        'is_active',
        'is_featured',
        'meta_title',
        'meta_desc',
        'tax_rate',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function ecommerce_order_items()
    {
        return $this->hasMany(EcommerceOrderItem::class);
    }

    public function product_images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function product_variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function purchase_items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function sale_items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stock_movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }
}
