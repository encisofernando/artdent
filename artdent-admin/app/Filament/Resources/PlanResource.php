<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlanResource\Pages;
use App\Models\Plan;
use App\Services\MercadoPagoService;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class PlanResource extends Resource
{
    protected static ?string $model = Plan::class;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-credit-card';
    }

    public static function getNavigationLabel(): string
    {
        return 'Planes';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Tenants';
    }

    public static function getModelLabel(): string
    {
        return 'Plan';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Planes';
    }

    public static function getNavigationSort(): ?int
    {
        return 2;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            \Filament\Schemas\Components\Section::make('Información del plan')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('slug')
                        ->label('Slug')
                        ->required()
                        ->maxLength(50)
                        ->unique(ignoreRecord: true)
                        ->alphaDash()
                        ->placeholder('starter')
                        ->helperText('Identificador único interno (ej: starter, pro)'),

                    Forms\Components\TextInput::make('name')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(100)
                        ->placeholder('Plan Starter'),

                    Forms\Components\TextInput::make('price')
                        ->label('Precio mensual (ARS)')
                        ->numeric()
                        ->prefix('$')
                        ->suffix('ARS')
                        ->required()
                        ->minValue(0),

                    Forms\Components\TextInput::make('trial_days')
                        ->label('Días de prueba gratis')
                        ->numeric()
                        ->default(14)
                        ->minValue(0),

                    Forms\Components\Textarea::make('description')
                        ->label('Descripción')
                        ->columnSpanFull()
                        ->rows(2),

                    Forms\Components\Toggle::make('is_active')
                        ->label('Plan activo')
                        ->default(true),

                    Forms\Components\Toggle::make('is_public')
                        ->label('Plan público')
                        ->helperText('Desactivar para planes que solo pueden asignarse desde el panel superadmin (ej: Owner).')
                        ->default(true),
                ]),

            \Filament\Schemas\Components\Section::make('Límites del plan')
                ->description('Dejar en blanco para ilimitado')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('max_users')
                        ->label('Usuarios máx.')
                        ->numeric()
                        ->placeholder('∞'),

                    Forms\Components\TextInput::make('max_products')
                        ->label('Productos máx.')
                        ->numeric()
                        ->placeholder('∞'),

                    Forms\Components\TextInput::make('max_sales_per_month')
                        ->label('Ventas/mes máx.')
                        ->numeric()
                        ->placeholder('∞'),
                ]),

            \Filament\Schemas\Components\Section::make('Features incluidas')
                ->schema([
                    Forms\Components\TagsInput::make('features')
                        ->label('Features')
                        ->placeholder('Agregar feature...')
                        ->helperText('Ej: AFIP, WhatsApp, E-commerce, Laboratorio'),
                ]),

            \Filament\Schemas\Components\Section::make('MercadoPago')
                ->description('Información sincronizada con MP — se completa automáticamente al publicar.')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('mp_plan_id')
                        ->label('ID del plan en MP')
                        ->disabled()
                        ->placeholder('Se completa al publicar'),

                    Forms\Components\TextInput::make('mp_init_point')
                        ->label('URL de checkout MP')
                        ->disabled()
                        ->placeholder('Se completa al publicar'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Plan')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->description(fn (Plan $record): string => $record->description ?: $record->slug)
                    ->wrap(),

                Tables\Columns\TextColumn::make('price')
                    ->label('Precio/mes')
                    ->formatStateUsing(fn ($state) => '$'.number_format((float) $state, 0, ',', '.').' ARS')
                    ->sortable()
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('trial_days')
                    ->label('Trial')
                    ->formatStateUsing(fn ($state) => "{$state} días")
                    ->sortable()
                    ->badge()
                    ->color('warning'),

                Tables\Columns\TextColumn::make('subscriptions_count')
                    ->label('Suscriptores')
                    ->counts('subscriptions')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\IconColumn::make('is_public')
                    ->label('Público')
                    ->boolean()
                    ->trueIcon('heroicon-o-globe-alt')
                    ->falseIcon('heroicon-o-lock-closed')
                    ->trueColor('success')
                    ->falseColor('warning')
                    ->tooltip(fn (bool $state): string => $state ? 'Visible públicamente' : 'Solo superadmin'),

                Tables\Columns\IconColumn::make('mp_plan_id')
                    ->label('En MP')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Activo'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                Actions\Action::make('publish_to_mp')
                    ->label('Publicar en MP')
                    ->icon('heroicon-o-arrow-up-circle')
                    ->color('success')
                    // Solo planes públicos se publican en MP; el Owner no tiene checkout
                    ->visible(fn (Plan $record): bool => ! $record->mp_plan_id && $record->is_public)
                    ->requiresConfirmation()
                    ->modalHeading('Publicar plan en MercadoPago')
                    ->modalDescription(fn (Plan $record): string => "Se creará el plan \"{$record->name}\" (\${$record->price} ARS/mes) en MercadoPago. Esto generará la URL de checkout.")
                    ->action(function (Plan $record): void {
                        try {
                            $service = app(MercadoPagoService::class);
                            $service->createPlan($record);
                            Notification::make()
                                ->title('Plan publicado en MercadoPago')
                                ->body("ID: {$record->fresh()->mp_plan_id}")
                                ->success()
                                ->send();
                        } catch (\Throwable $e) {
                            Notification::make()
                                ->title('Error al publicar en MP')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),

                Actions\Action::make('sync_mp')
                    ->label('Sincronizar precio')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->visible(fn (Plan $record): bool => (bool) $record->mp_plan_id)
                    ->action(function (Plan $record): void {
                        try {
                            app(MercadoPagoService::class)->updatePlan($record);
                            Notification::make()->title('Plan sincronizado con MP')->success()->send();
                        } catch (\Throwable $e) {
                            Notification::make()->title('Error de sincronización')->body($e->getMessage())->danger()->send();
                        }
                    }),

                Actions\EditAction::make(),
                Actions\DeleteAction::make()->requiresConfirmation(),
            ])
            ->striped()
            ->defaultSort('price');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPlans::route('/'),
            'create' => Pages\CreatePlan::route('/create'),
            'edit' => Pages\EditPlan::route('/{record}/edit'),
        ];
    }
}
