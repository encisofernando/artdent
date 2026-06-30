<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Customer;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class WhatsappTestSend extends Command
{
    protected $signature = 'whatsapp:test-send
                            {numero : Número de destino en formato internacional (ej. 5491112345678)}
                            {--company=1 : ID de la empresa cuyas credenciales usar}
                            {--template=hello_world : Nombre del template de Meta a enviar}
                            {--lang=en_US : Código de idioma del template}';

    protected $description = 'Envía un template de WhatsApp de prueba para validar la integración con la Cloud API de Meta.';

    public function handle(): int
    {
        $companyId = (int) $this->option('company');
        $company = Company::find($companyId);

        if (! $company) {
            $this->error("No se encontró la empresa con ID {$companyId}.");

            return self::FAILURE;
        }

        if (! $company->whatsapp_phone_number_id || ! $company->whatsapp_access_token) {
            $this->error("La empresa \"{$company->name}\" (ID {$companyId}) no tiene credenciales de WhatsApp configuradas.");
            $this->line('  → Configurá whatsapp_phone_number_id y whatsapp_access_token en la empresa.');

            return self::FAILURE;
        }

        $numero = $this->argument('numero');
        $template = $this->option('template');
        $lang = $this->option('lang');

        $this->info("Empresa   : {$company->name} (ID {$companyId})");
        $this->info("PhoneID   : {$company->whatsapp_phone_number_id}");
        $this->info("Destino   : {$numero}");
        $this->info("Template  : {$template} [{$lang}]");
        $this->newLine();

        // Customer temporal para no requerir un Customer real en el test
        $fakeCustomer = new Customer;
        $fakeCustomer->id = 0;
        $fakeCustomer->phone = $numero;
        $fakeCustomer->whatsapp_bsuid = null;

        $service = new WhatsAppService($company);

        $this->line('Enviando...');

        $ok = $service->sendTemplate($fakeCustomer, $template, $lang);

        if ($ok) {
            $this->info('✓ Mensaje enviado correctamente.');
            $this->line('  → Revisá el teléfono destino y el log en storage/logs/whatsapp.log');

            return self::SUCCESS;
        }

        $this->error('✗ El envío falló.');
        $this->line('  → Revisá storage/logs/whatsapp.log para el detalle del error.');

        return self::FAILURE;
    }
}
