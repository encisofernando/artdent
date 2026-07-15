<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Support\AccountingSettings;
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
 * @property string|null $lab_logo_url
 * @property array|null $accounting_settings
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
 */
class Company extends Model
{
    protected $table = 'companies';

    protected $casts = [
        'start_date' => 'datetime',
        'afip_point_sale' => 'int',
        'chatbot_enabled' => 'bool',
        'accounting_settings' => 'array',
        'usd_exchange_rate' => 'float',
        'collaborator_commission_pct' => 'float',
    ];

    protected $fillable = [
        'name',
        'fantasy_name',
        'logo_url',
        'lab_logo_url',
        'accounting_settings',
        'cuit',
        'iva_condition',
        'iibb',
        'start_date',
        'afip_point_sale',
        'afip_cert_path',
        'afip_homo_cert_path',
        'afip_key_path',
        'afip_environment',
        'afip_auto_invoice',
        'email',
        'phone',
        'website',
        'instagram_handle',
        'tariff_notes',
        'collaborator_commission_pct',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'currency',
        'usd_exchange_rate',
        'timezone',
        'whatsapp_phone_number_id',
        'whatsapp_access_token',
        'whatsapp_message_template',
        'whatsapp_contact_number',
        'ga4_measurement_id',
        'meta_pixel_id',
        'hotjar_id',
        'google_tag_manager_id',
        'email_sale_subject',
        'email_sale_body',
        'email_quote_subject',
        'email_quote_body',
        'email_payment_subject',
        'email_payment_body',
        'chatbot_enabled',
        'chatbot_provider',
        'chatbot_model',
        'chatbot_openai_key',
        'chatbot_anthropic_key',
    ];

    /** Devuelve el path del certificado según el entorno activo (o el solicitado). */
    public function afipCertPath(?string $env = null): ?string
    {
        $env ??= $this->afip_environment ?? 'homo';

        return $env === 'homo' ? $this->afip_homo_cert_path : $this->afip_cert_path;
    }

    public function documentLogoUrl(string $scope = 'general'): ?string
    {
        return $scope === 'lab'
            ? ($this->lab_logo_url ?: $this->logo_url)
            : $this->logo_url;
    }

    public function normalizedAccountingSettings(): array
    {
        return AccountingSettings::merge($this->accounting_settings, $this);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function afip_points_of_sale()
    {
        return $this->hasMany(AfipPointOfSale::class);
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

    public function chatbot_conversations()
    {
        return $this->hasMany(ChatbotConversation::class);
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
