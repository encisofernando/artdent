<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenantResource\Pages;
use App\Models\Plan;
use App\Models\Tenant;
use App\Services\MercadoPagoService;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class TenantResource extends Resource
{
    protected static ?string $model = Tenant::class;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-building-office-2';
    }

    public static function getNavigationLabel(): string
    {
        return 'Empresas';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Tenants';
    }

    public static function getModelLabel(): string
    {
        return 'Empresa';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Empresas';
    }

    public static function getNavigationSort(): ?int
    {
        return 1;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            \Filament\Schemas\Components\Section::make('Datos del tenant')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('id')
                        ->label('Slug / Subdominio')
                        ->helperText('Ej: "artdent" → artdent.artdent.com.ar')
                        ->required()
                        ->maxLength(50)
                        ->alphaDash()
                        ->unique(ignoreRecord: true)
                        ->disabledOn('edit'),

                    Forms\Components\TextInput::make('name')
                        ->label('Nombre de la empresa')
                        ->required()
                        ->maxLength(150),

                    Forms\Components\TextInput::make('email')
                        ->label('Email de contacto')
                        ->email()
                        ->maxLength(150),

                    Forms\Components\TextInput::make('domain')
                        ->label('Dominio principal')
                        ->placeholder(fn () => '{slug}.' . config('tenancy.default_domain_suffix'))
                        ->helperText('Opcional. Si se deja vacío se genera automáticamente.')
                        ->maxLength(255)
                        ->visibleOn('create'),

                    Forms\Components\Select::make('plan')
                        ->label('Plan')
                        ->options(Plan::all()->pluck('name', 'slug'))
                        ->default('starter')
                        ->required(),

                    Forms\Components\Select::make('status')
                        ->label('Estado')
                        ->options([
                            'trial' => 'Período de prueba',
                            'active' => 'Activo',
                            'suspended' => 'Suspendido',
                            'cancelled' => 'Cancelado',
                        ])
                        ->default('trial')
                        ->required(),

                    Forms\Components\DateTimePicker::make('trial_ends_at')
                        ->label('Vencimiento del trial')
                        ->nullable(),

                    Forms\Components\DateTimePicker::make('activated_at')
                        ->label('Fecha de activación')
                        ->nullable(),
                ]),

            \Filament\Schemas\Components\Section::make('Usuario owner')
                ->description('Se crea dentro del tenant para ingresar al CRM.')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('owner_name')
                        ->label('Nombre del administrador')
                        ->required()
                        ->maxLength(150)
                        ->visibleOn('create'),

                    Forms\Components\TextInput::make('owner_email')
                        ->label('Email del administrador')
                        ->email()
                        ->required()
                        ->maxLength(150)
                        ->visibleOn('create'),

                    Forms\Components\TextInput::make('owner_password')
                        ->label('Password inicial')
                        ->password()
                        ->revealable()
                        ->helperText('Opcional. Si se deja vacío se genera una password temporal.')
                        ->visibleOn('create'),
                ]),

            \Filament\Schemas\Components\Section::make('DB y Empleados')
                ->description('Configuración de base de datos aislada y mapeo de usuarios')
                ->schema([
                    Forms\Components\TextInput::make('tenancy_db_name')
                        ->label('Base de datos (Nombre)')
                        ->maxLength(255)
                        ->disabledOn('create')
                        ->helperText('Nombre de la base de datos exclusiva para esta empresa (se asume autogenerada si está en blanco)'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('Slug')
                    ->badge()
                    ->color('info')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('name')
                    ->label('Empresa')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Tenant $record): string => "DB: " . ($record->tenancy_db_name ?? $record->database()->getName()))
                    ->wrap(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email Contacto')
                    ->searchable()
                    ->icon('heroicon-o-envelope')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('plan')
                    ->label('Plan')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'starter' => 'gray',
                        'pro' => 'warning',
                        'enterprise' => 'success',
                        'owner' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'starter' => 'Starter',
                        'pro' => 'Pro',
                        'enterprise' => 'Enterprise',
                        'owner' => '⭐ Owner',
                        default => $state,
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'trial' => 'warning',
                        'active' => 'success',
                        'suspended' => 'danger',
                        'cancelled' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'trial' => 'Trial',
                        'active' => 'Activo',
                        'suspended' => 'Suspendido',
                        'cancelled' => 'Cancelado',
                        default => $state,
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('trial_ends_at')
                    ->label('Trial vence')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Estado')
                    ->options([
                        'trial' => 'Trial',
                        'active' => 'Activo',
                        'suspended' => 'Suspendido',
                        'cancelled' => 'Cancelado',
                    ]),

                Tables\Filters\SelectFilter::make('plan')
                    ->label('Plan')
                    ->options(Plan::all()->pluck('name', 'slug')),
            ])
            ->actions([
                Actions\Action::make('assign_owner')
                    ->label('Licencia Owner')
                    ->icon('heroicon-o-star')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Asignar licencia Owner')
                    ->modalDescription(fn (Tenant $record): string => "Se asignará la licencia Owner (ilimitada, sin cobro) a \"{$record->name}\". Esta acción solo puede realizarse desde el panel superadmin.")
                    ->visible(fn (Tenant $record): bool => $record->plan !== 'owner')
                    ->action(function (Tenant $record): void {
                        $ownerPlan = Plan::where('slug', 'owner')->first();

                        if (! $ownerPlan) {
                            Notification::make()->title('Plan Owner no encontrado')->danger()->send();

                            return;
                        }

                        $record->update([
                            'plan' => 'owner',
                            'status' => 'active',
                            'activated_at' => $record->activated_at ?? now(),
                            'trial_ends_at' => null,
                        ]);

                        // Cancelar suscripción MP activa si existe
                        $activeSub = $record->subscriptions()->where('status', 'authorized')->latest()->first();
                        if ($activeSub) {
                            app(MercadoPagoService::class)->cancelSubscription($activeSub);
                            $activeSub->update(['status' => 'cancelled']);
                        }

                        Notification::make()
                            ->title('Licencia Owner asignada')
                            ->body("\"{$record->name}\" tiene ahora acceso ilimitado y permanente.")
                            ->success()
                            ->send();
                    }),

                Actions\Action::make('generate_checkout')
                    ->label('Generar pago')
                    ->icon('heroicon-o-credit-card')
                    ->color('primary')
                    // No mostrar si ya tiene plan Owner
                    ->visible(fn (Tenant $record): bool => $record->plan !== 'owner')
                    ->form([
                        Forms\Components\Select::make('plan_id')
                            ->label('Plan')
                            // Solo planes públicos disponibles en el checkout
                            ->options(Plan::where('is_active', true)->where('is_public', true)->pluck('name', 'id'))
                            ->required(),
                    ])
                    ->action(function (Tenant $record, array $data): void {
                        try {
                            $plan = Plan::findOrFail($data['plan_id']);

                            if (! $plan->mp_plan_id) {
                                Notification::make()
                                    ->title('El plan no está publicado en MP')
                                    ->body("Publicá el plan \"{$plan->name}\" primero desde la sección Planes.")
                                    ->warning()
                                    ->send();

                                return;
                            }

                            $checkoutUrl = app(MercadoPagoService::class)->getCheckoutUrl($record, $plan);

                            Notification::make()
                                ->title('URL de checkout generada')
                                ->body("Enviá este link al cliente: {$checkoutUrl}")
                                ->success()
                                ->persistent()
                                ->send();
                        } catch (\Throwable $e) {
                            Notification::make()
                                ->title('Error al generar checkout')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),

                Actions\Action::make('activate')
                    ->label('Activar')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Tenant $record): bool => $record->status !== 'active')
                    ->requiresConfirmation()
                    ->action(function (Tenant $record): void {
                        $record->update([
                            'status' => 'active',
                            'activated_at' => now(),
                        ]);
                        Notification::make()->title('Tenant activado')->success()->send();
                    }),

                Actions\Action::make('suspend')
                    ->label('Suspender')
                    ->icon('heroicon-o-pause-circle')
                    ->color('danger')
                    ->visible(fn (Tenant $record): bool => $record->status === 'active')
                    ->requiresConfirmation()
                    ->action(function (Tenant $record): void {
                        $record->update(['status' => 'suspended']);
                        Notification::make()->title('Tenant suspendido')->warning()->send();
                    }),

                Actions\EditAction::make(),
                Actions\DeleteAction::make()->requiresConfirmation(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->striped()
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            \App\Filament\Resources\TenantResource\RelationManagers\UserMapsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTenants::route('/'),
            'create' => Pages\CreateTenant::route('/create'),
            'edit' => Pages\EditTenant::route('/{record}/edit'),
        ];
    }
}
