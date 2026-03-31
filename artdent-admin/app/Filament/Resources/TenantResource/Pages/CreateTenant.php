<?php

namespace App\Filament\Resources\TenantResource\Pages;

use App\Filament\Resources\TenantResource;
use App\Services\TenantProvisioningService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class CreateTenant extends CreateRecord
{
    protected static string $resource = TenantResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function handleRecordCreation(array $data): Model
    {
        try {
            $result = app(TenantProvisioningService::class)->provision($data);

            Notification::make()
                ->title('Empresa creada')
                ->body("DB: {$result['database']} · Dominio: {$result['domain']}")
                ->success()
                ->send();

            if ($result['generated_password']) {
                Notification::make()
                    ->title('Password temporal generada')
                    ->body("Owner {$result['owner_email']}: {$result['generated_password']}")
                    ->warning()
                    ->persistent()
                    ->send();
            }

            return $result['tenant'];
        } catch (ValidationException $e) {
            $this->onValidationError($e);
            throw $e;
        }
    }
}
