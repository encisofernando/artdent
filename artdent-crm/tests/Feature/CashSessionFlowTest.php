<?php

namespace Tests\Feature;

use App\Models\CashDrawer;
use App\Models\CashSession;
use App\Models\Company;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

class CashSessionFlowTest extends TestCase
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
        );

        $this->drawer = CashDrawer::create([
            'company_id' => $this->company->id,
            'name' => 'Caja Principal',
            'is_active' => true,
        ]);

        $this->actingAs($this->user);
    }

    public function test_open_then_close_a_cash_session_with_no_movements_reports_zero_difference(): void
    {
        $openResponse = $this->post(route('cash-sessions.store'), [
            'cash_drawer_id' => $this->drawer->id,
            'opening_amount' => 5000,
        ]);

        $session = CashSession::where('cash_drawer_id', $this->drawer->id)->firstOrFail();
        $openResponse->assertRedirect(route('cash-sessions.show', $session));
        $this->assertSame('open', $session->status);

        $closeResponse = $this->put(route('cash-sessions.close', $session), [
            'closing_amount' => 5000,
        ]);

        $closeResponse->assertRedirect(route('cash-sessions.index'));
        $closeResponse->assertSessionHas('success', 'Caja cerrada sin diferencias.');

        $session->refresh();
        $this->assertSame('closed', $session->status);
        $this->assertEquals(5000.0, (float) $session->closing_amount);
    }

    public function test_closing_with_less_cash_than_expected_reports_a_shortfall(): void
    {
        $session = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => now(),
            'opening_amount' => 5000,
            'status' => 'open',
        ]);

        $response = $this->put(route('cash-sessions.close', $session), [
            'closing_amount' => 4500,
        ]);

        $response->assertSessionHas('success', 'Caja cerrada con faltante de $500,00');
    }

    public function test_cannot_open_a_second_session_on_a_drawer_that_already_has_one_open(): void
    {
        CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => now(),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);

        $response = $this->post(route('cash-sessions.store'), [
            'cash_drawer_id' => $this->drawer->id,
            'opening_amount' => 2000,
        ]);

        $response->assertSessionHas('error', 'Esta caja ya tiene una sesión abierta.');
        $this->assertSame(1, CashSession::where('cash_drawer_id', $this->drawer->id)->count());
    }

    public function test_cannot_close_an_already_closed_session(): void
    {
        $session = CashSession::create([
            'cash_drawer_id' => $this->drawer->id,
            'user_id' => $this->user->id,
            'opened_at' => now()->subHour(),
            'closed_at' => now(),
            'opening_amount' => 1000,
            'closing_amount' => 1000,
            'status' => 'closed',
        ]);

        $response = $this->put(route('cash-sessions.close', $session), [
            'closing_amount' => 1000,
        ]);

        $response->assertSessionHas('error', 'Esta sesión ya está cerrada.');
    }

    public function test_user_from_another_company_cannot_close_a_session_that_is_not_theirs(): void
    {
        $otherCompany = Company::factory()->create();
        $otherDrawer = CashDrawer::create([
            'company_id' => $otherCompany->id,
            'name' => 'Caja de otra empresa',
            'is_active' => true,
        ]);
        $otherUser = User::factory()->for($otherCompany)->create();
        $session = CashSession::create([
            'cash_drawer_id' => $otherDrawer->id,
            'user_id' => $otherUser->id,
            'opened_at' => now(),
            'opening_amount' => 1000,
            'status' => 'open',
        ]);

        $response = $this->put(route('cash-sessions.close', $session), [
            'closing_amount' => 1000,
        ]);

        $response->assertNotFound();
    }
}
