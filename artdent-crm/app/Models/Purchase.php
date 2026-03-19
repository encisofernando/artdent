<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Purchase
 * 
 * @property int $id
 * @property int $company_id
 * @property int $vendor_id
 * @property int|null $user_id
 * @property int|null $warehouse_id
 * @property string|null $reference_no
 * @property string|null $status
 * @property float|null $subtotal
 * @property float|null $tax_amount
 * @property float|null $total
 * @property string|null $notes
 * @property Carbon|null $purchased_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Company $company
 * @property Vendor $vendor
 * @property Warehouse|null $warehouse
 * @property Collection|PurchaseItem[] $purchase_items
 *
 * @package App\Models
 */
class Purchase extends Model
{
	protected $table = 'purchases';

	protected $casts = [
		'company_id' => 'int',
		'vendor_id' => 'int',
		'user_id' => 'int',
		'warehouse_id' => 'int',
		'subtotal' => 'float',
		'tax_amount' => 'float',
		'total' => 'float',
		'purchased_at' => 'date',
		'due_date' => 'date',
	];

	protected $fillable = [
		'company_id',
		'vendor_id',
		'user_id',
		'warehouse_id',
		'reference_no',
		'invoice_type',
		'invoice_number',
		'status',
		'subtotal',
		'tax_amount',
		'total',
		'notes',
		'purchased_at',
		'due_date',
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function vendor()
	{
		return $this->belongsTo(Vendor::class);
	}

	public function warehouse()
	{
		return $this->belongsTo(Warehouse::class);
	}

	public function purchase_items()
	{
		return $this->hasMany(PurchaseItem::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
