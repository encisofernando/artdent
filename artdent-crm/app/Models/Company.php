<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Company
 * 
 * @property int $id
 * @property string $name
 * @property string|null $fantasy_name
 * @property string|null $logo_url
 * @property string|null $cuit
 * @property string|null $iva_condition
 * @property string|null $iibb
 * @property Carbon|null $start_date
 * @property int|null $afip_point_sale
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $website
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $postal_code
 * @property string|null $country
 * @property string|null $currency
 * @property string|null $timezone
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Branch[] $branches
 * @property Collection|CashDrawer[] $cash_drawers
 * @property Collection|CollaboratorAttendance[] $collaborator_attendances
 * @property Collection|Collaborator[] $collaborators
 * @property Collection|CrmClient[] $crm_clients
 * @property Collection|Dentist[] $dentists
 * @property Collection|EcommerceOrder[] $ecommerce_orders
 * @property Collection|Expense[] $expenses
 * @property Collection|IncomeRecord[] $income_records
 * @property Collection|Invoice[] $invoices
 * @property Collection|JobType[] $job_types
 * @property Collection|Job[] $jobs
 * @property Collection|Product[] $products
 * @property Collection|Purchase[] $purchases
 * @property Collection|Sale[] $sales
 * @property Collection|Tariff[] $tariffs
 * @property Collection|User[] $users
 * @property Collection|Vendor[] $vendors
 * @property Collection|Warehouse[] $warehouses
 *
 * @package App\Models
 */
class Company extends Model
{
	protected $table = 'companies';

	protected $casts = [
		'start_date' => 'datetime',
		'afip_point_sale' => 'int'
	];

	protected $fillable = [
		'name',
		'fantasy_name',
		'logo_url',
		'cuit',
		'iva_condition',
		'iibb',
		'start_date',
		'afip_point_sale',
		'email',
		'phone',
		'website',
		'address',
		'city',
		'province',
		'postal_code',
		'country',
		'currency',
		'timezone'
	];

	public function branches()
	{
		return $this->hasMany(Branch::class);
	}

	public function cash_drawers()
	{
		return $this->hasMany(CashDrawer::class);
	}

	public function collaborator_attendances()
	{
		return $this->hasMany(CollaboratorAttendance::class);
	}

	public function collaborators()
	{
		return $this->hasMany(Collaborator::class);
	}

	public function crm_clients()
	{
		return $this->hasMany(CrmClient::class);
	}

	public function dentists()
	{
		return $this->hasMany(Dentist::class);
	}

	public function ecommerce_orders()
	{
		return $this->hasMany(EcommerceOrder::class);
	}

	public function expenses()
	{
		return $this->hasMany(Expense::class);
	}

	public function income_records()
	{
		return $this->hasMany(IncomeRecord::class);
	}

	public function invoices()
	{
		return $this->hasMany(Invoice::class);
	}

	public function job_types()
	{
		return $this->hasMany(JobType::class);
	}

	public function jobs()
	{
		return $this->hasMany(Job::class);
	}

	public function products()
	{
		return $this->hasMany(Product::class);
	}

	public function purchases()
	{
		return $this->hasMany(Purchase::class);
	}

	public function sales()
	{
		return $this->hasMany(Sale::class);
	}

	public function tariffs()
	{
		return $this->hasMany(Tariff::class);
	}

	public function users()
	{
		return $this->hasMany(User::class);
	}

	public function vendors()
	{
		return $this->hasMany(Vendor::class);
	}

	public function warehouses()
	{
		return $this->hasMany(Warehouse::class);
	}
}
