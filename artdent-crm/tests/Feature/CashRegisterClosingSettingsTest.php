<?php

namespace Tests\Feature;

use App\Models\CashDrawer;
use App\Models\CashRegisterSetting;
use App\Models\CashSession;
use App\Models\Company;
use App\Models\User;
use App\Services\CashSessionService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

class CashRegisterClosingSettingsTest extends TestCase
{
    use RefreshesTenantSchema;

    private Company $company;

    private User $user;

    private CashDrawer $drawer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->for($this->company)->create();
        $this->user->givePermissionTo(
            Permission::findOrCreate('cash-register.view', 'web'),
            Permission::findOrCreate('cash-register.operate', 'web'),
            Permission::findOrCreate('settings.edit', 'web'),
            Permission::findOrCreate('sales.create', 'web'),
        );

        $this->drawer = CashDrawer::create([
            'company_id' => $this->company->id,
            'name' => 'Caja Test',
            'is_active' => true,
        ]);

        $this->actingAs($this->user);
    }

    public function test_admin_can_update_cash_register_settings_mode_and_time(): void
    {
        // 1. Update to manual mode
        $response = $this->put(route('cash-register-settings.update'), [
            'is_enabled' => true,
            'close_mode' => 'manual',
            'close_time' => null,
        ]);

        $response->assertSessionHas('success');
        $setting = CashRegisterSetting::forCompany($this->company->id);
        $this->assertTrue((bool) $setting->is_enabled);
        $this->assertSame('manual', $setting->close_mode);

        // 2. Update to auto mode with valid time
        $response = $this->put(route('cash-register-settings.update'), [
            'is_enabled' => true,
            'close_mode' => 'auto',
            'close_time' => '22:30',
        ]);

        $response->assertSessionHas('success');
        $setting->refresh();
        $this->assertSame('auto', $setting->close_mode);
        $this->assertSame('22:30', $setting->close_time);
    }

    public function test_cash_register_settings_validation_rejects_invalid_values(): void
    {
        $response = $this->put(route('cash-register-settings.update'), [
            'is_enabled' => true,
            'close_mode' => 'invalid_mode',
            'close_time' => '22:30',
        ]);
        $response->assertSessionHasErrors('close_mode');

        $response = $this->put(route('cash-register-settings.update'), [
            'is_enabled' => true,
            'close_mode' => 'auto',
            'close_time' => '25:99',
        ]);
        $response->assertSessionHasErrors('close_time');
    }

    public function test_session_expiration_service_logic(): void
    {
        $service = app(CashSessionService::class);
        $setting = CashRegisterSetting::forCompany($this->company->id);

        // Case 1: Manual mode -> never expired
        $setting->update(['close_mode' => 'manual', 'close_time' => '00:00']);
        $sessionOld = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => Carbon::parse('2026-11-08 09:00:00'),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);

        $this->assertFalse($service->isSessionExpired($sessionOld, $setting, Carbon::parse('2026-11-11 15:00:00')));

        // Case 2: Auto mode with cutoff at 20:00
        $setting->update(['close_mode' => 'auto', 'close_time' => '20:00']);

        // Opened today at 09:00, current time today at 18:00 (before cutoff)
        $sessionToday = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => Carbon::parse('2026-11-11 09:00:00'),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);
        $this->assertFalse($service->isSessionExpired($sessionToday, $setting, Carbon::parse('2026-11-11 18:00:00')));

        // Current time today at 20:15 (after cutoff) -> expired!
        $this->assertTrue($service->isSessionExpired($sessionToday, $setting, Carbon::parse('2026-11-11 20:15:00')));

        // Opened yesterday at 21:00 (after yesterday cutoff), current time today at 10:00 (before today cutoff) -> not expired
        $sessionNight = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => Carbon::parse('2026-11-10 21:00:00'),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);
        $this->assertFalse($service->isSessionExpired($sessionNight, $setting, Carbon::parse('2026-11-11 10:00:00')));
    }

    public function test_manual_mode_allows_session_from_previous_day_in_middleware(): void
    {
        $setting = CashRegisterSetting::forCompany($this->company->id);
        $setting->update(['is_enabled' => true, 'close_mode' => 'manual']);

        // Session opened 2 days ago
        $session = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => now()->subDays(2),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);

        $response = $this->get(route('sales.create'));
        // Does not redirect to cash-sessions.show or error about expired session
        $this->assertNotSame(route('cash-sessions.show', $session), $response->headers->get('Location'));
    }

    public function test_auto_mode_blocks_expired_session_in_middleware(): void
    {
        $setting = CashRegisterSetting::forCompany($this->company->id);
        $setting->update(['is_enabled' => true, 'close_mode' => 'auto', 'close_time' => '20:00']);

        // Freeze time at 21:00
        Carbon::setTestNow(Carbon::parse('2026-11-11 21:00:00'));

        $session = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => Carbon::parse('2026-11-11 10:00:00'),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);

        $response = $this->get(route('sales.create'));

        $response->assertRedirect(route('cash-sessions.show', $session));
        $response->assertSessionHas('error');

        Carbon::setTestNow();
    }

    public function test_auto_close_command_closes_expired_sessions(): void
    {
        Mail::fake();

        $setting = CashRegisterSetting::forCompany($this->company->id);
        $setting->update(['is_enabled' => true, 'close_mode' => 'auto', 'close_time' => '20:00']);

        Carbon::setTestNow(Carbon::parse('2026-11-11 20:30:00'));

        $session = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => Carbon::parse('2026-11-11 10:00:00'),
            'opening_amount' => 5000,
            'status' => 'open',
        ]);

        $this->artisan('cash:auto-close')->assertSuccessful();

        $session->refresh();
        $this->assertSame('closed', $session->status);
        $this->assertNotNull($session->closed_at);
        $this->assertEquals(5000.0, (float) $session->closing_amount);
        $this->assertStringContainsString('Cierre automático programado', $session->notes);

        Carbon::setTestNow();
    }
}
