<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Invoice
 * 
 * @property int $id
 * @property int $company_id
 * @property int $invoice_type_id
 * @property int|null $user_id
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property string $recipient_name
 * @property string|null $recipient_cuit
 * @property string|null $recipient_iva
 * @property string|null $recipient_address
 * @property int|null $point_sale
 * @property int|null $number
 * @property string|null $cae
 * @property Carbon|null $cae_expiry
 * @property float|null $subtotal
 * @property float|null $discount
 * @property float|null $tax_amount
 * @property float|null $total
 * @property string|null $status
 * @property Carbon|null $issued_at
 * @property Carbon|null $due_date
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Company $company
 * @property InvoiceType $invoice_type
 * @property Collection|InvoiceItem[] $invoice_items
 *
 * @package App\Models
 */
class Invoice extends Model
{
	protected $table = 'invoices';

	protected $casts = [
		'company_id' => 'int',
		'invoice_type_id' => 'int',
		'user_id' => 'int',
		'reference_id' => 'int',
		'point_sale' => 'int',
		'number' => 'int',
		'cae_expiry' => 'datetime',
		'subtotal' => 'float',
		'discount' => 'float',
		'tax_amount' => 'float',
		'total' => 'float',
		'issued_at' => 'datetime',
		'due_date' => 'datetime'
	];

	protected $fillable = [
		'company_id',
		'invoice_type_id',
		'user_id',
		'reference_type',
		'reference_id',
		'recipient_name',
		'recipient_cuit',
		'recipient_iva',
		'recipient_address',
		'point_sale',
		'number',
		'cae',
		'cae_expiry',
		'subtotal',
		'discount',
		'tax_amount',
		'total',
		'status',
		'issued_at',
		'due_date',
		'notes'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function invoice_type()
	{
		return $this->belongsTo(InvoiceType::class);
	}

	public function invoice_items()
	{
		return $this->hasMany(InvoiceItem::class);
	}
}
