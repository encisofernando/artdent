<?php

namespace App\Jobs;

use App\Models\Company;
use App\Models\Customer;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [10, 30, 60];

    protected int $customerId;

    protected int $companyId;

    protected string $templateName;

    protected array $components;

    protected string $languageCode;

    /**
     * Create a new job instance.
     */
    public function __construct(int $customerId, int $companyId, string $templateName, array $components = [], string $languageCode = 'es_AR')
    {
        $this->customerId = $customerId;
        $this->companyId = $companyId;
        $this->templateName = $templateName;
        $this->components = $components;
        $this->languageCode = $languageCode;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $customer = Customer::find($this->customerId);

        if (! $customer) {
            Log::channel('whatsapp')->warning("Customer ID {$this->customerId} no encontrado al intentar enviar {$this->templateName}");

            return;
        }

        $company = Company::find($this->companyId);

        if (! $company) {
            Log::channel('whatsapp')->warning("Company ID {$this->companyId} no encontrada.");

            return;
        }

        $service = new WhatsAppService($company);

        $success = $service->sendTemplate($customer, $this->templateName, $this->languageCode, $this->components);

        if (! $success) {
            $this->fail(new \Exception('El servicio de WhatsApp indicó fallo al enviar el mensaje.'));
        }
    }
}
