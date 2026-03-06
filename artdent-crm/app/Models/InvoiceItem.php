<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class InvoiceItem
 * 
 * @property int $id
 * @property int $invoice_id
 * @property string $description
 * @property float $quantity
 * @property float $unit_price
 * @property float|null $tax_rate
 * @property float|null $tax_amount
 * @property float $total
 * 
 * @property Invoice $invoice
 *
 * @package App\Models
 */
class InvoiceItem extends Model
{
	protected $table = 'invoice_items';
	public $timestamps = false;

	protected $casts = [
		'invoice_id' => 'int',
		'quantity' => 'float',
		'unit_price' => 'float',
		'tax_rate' => 'float',
		'tax_amount' => 'float',
		'total' => 'float'
	];

	protected $fillable = [
		'invoice_id',
		'description',
		'quantity',
		'unit_price',
		'tax_rate',
		'tax_amount',
		'total'
	];

	public function invoice()
	{
		return $this->belongsTo(Invoice::class);
	}
}
