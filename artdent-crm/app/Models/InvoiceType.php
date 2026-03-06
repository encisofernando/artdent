<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class InvoiceType
 * 
 * @property int $id
 * @property string $name
 * @property string $afip_code
 * @property bool|null $is_active
 * 
 * @property Collection|Invoice[] $invoices
 *
 * @package App\Models
 */
class InvoiceType extends Model
{
	protected $table = 'invoice_types';
	public $timestamps = false;

	protected $casts = [
		'is_active' => 'bool'
	];

	protected $fillable = [
		'name',
		'afip_code',
		'is_active'
	];

	public function invoices()
	{
		return $this->hasMany(Invoice::class);
	}
}
