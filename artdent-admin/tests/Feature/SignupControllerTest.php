<?php

namespace Tests\Feature;

use App\Mail\TenantSignupVerificationMail;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * No se llama a Tenant::create() en ningún test acá (mismo criterio que
 * SuperadminAuditTest): `TenancyServiceProvider` liga `TenantCreated` al job
 * `Jobs\CreateDatabase`, así que crear un Tenant vía Eloquent dispara
 * creación física de una BD MySQL real, incluso en un test. Los checks de
 * "slug/email ya usado" se preparan con inserts directos por query builder
 * (bypasean los eventos de Eloquent) en vez de crear el Tenant de verdad. El
 * happy path completo de aprovisionamiento (verify() exitoso) se probó
 * manualmente contra infraestructura real — ver memoria del proyecto.
 *
 * `tenants`/`domains`/`user_tenant_map` viven en la conexión 'mysql' (=
 * `tenancy.database.central_connection` acá en admin — la real, compartida
 * con producción), no en la 'sqlite' de test por defecto. `phpunit.xml`
 * pisaba `DB_DATABASE=:memory:` para la conexión por defecto, pero esa misma
 * env var alimentaba también el bloque 'mysql' de config/database.php,
 * rompiendo cualquier test que tocara Tenant/domains/user_tenant_map
 * (conectaba mysql contra ":memory:"). Se le dio a 'mysql' su propia env var
 * (`DB_DATABASE_MYSQL`, ver config/database.php) — mismo criterio que
 * `CENTRAL_DB_DATABASE` en artdent-crm. La conexión 'mysql' se envuelve acá
 * en su propia transacción manual (setUp/tearDown) para no dejar residuos —
 * NO vía la propiedad `$connectionsToTransact` de RefreshDatabase, que
 * interfiere con el cacheo de la conexión sqlite ":memory:" entre clases de
 * test (ver comentario en la clase).
 */
class SignupControllerTest extends TestCase
{
    use RefreshDatabase;

    // Ojo: no usar la propiedad $connectionsToTransact de RefreshDatabase acá
    // — combinarla con una segunda conexión (mysql) interfiere con el cacheo
    // interno de la conexión sqlite ":memory:" entre clases de test (deja
    // sin tablas a la conexión default para el resto de la suite). Se
    // envuelve 'mysql' en su propia transacción a mano en su lugar.
    protected function setUp(): void
    {
        parent::setUp();

        DB::connection('mysql')->beginTransaction();

        Plan::create([
            'slug' => 'starter',
            'name' => 'Starter',
            'price' => 0,
            'trial_days' => 14,
            'is_active' => true,
            'is_public' => true,
        ]);
    }

    protected function tearDown(): void
    {
        DB::connection('mysql')->rollBack();

        parent::tearDown();
    }

    public function test_signup_form_only_lists_public_active_plans(): void
    {
        Plan::create(['slug' => 'hidden-'.uniqid(), 'name' => 'Hidden', 'price' => 0, 'trial_days' => 0, 'is_active' => true, 'is_public' => false]);
        Plan::create(['slug' => 'inactive-'.uniqid(), 'name' => 'Inactive', 'price' => 0, 'trial_days' => 0, 'is_active' => false, 'is_public' => true]);

        $response = $this->get(route('signup.create'));

        // $shouldExist=false: la config por defecto de inertia-laravel busca
        // páginas en resources/js/pages (minúscula) y este proyecto usa
        // resources/js/Pages (mayúscula) — mismatch preexistente del paquete
        // no relacionado a esta feature, no vale la pena tocar la config acá.
        $response->assertInertia(fn ($page) => $page
            ->component('Signup/Create', false)
            ->has('plans', 1)
            ->where('plans.0.slug', 'starter')
        );
    }

    public function test_rejects_a_slug_already_in_use(): void
    {
        $slug = 'acme-'.uniqid();
        DB::connection('mysql')->table('tenants')->insert(['id' => $slug, 'name' => 'Acme', 'plan' => 'starter', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]);

        Mail::fake();

        $response = $this->post(route('signup.store'), $this->validPayload(['id' => $slug]));

        $response->assertSessionHasErrors('id');
        Mail::assertNothingSent();
    }

    public function test_rejects_an_email_already_mapped_to_a_tenant(): void
    {
        $email = 'taken-'.uniqid().'@example.com';
        $existingTenantSlug = 'someone-else-'.uniqid();
        DB::connection('mysql')->table('tenants')->insert(['id' => $existingTenantSlug, 'name' => 'Someone Else', 'plan' => 'starter', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]);
        DB::connection('mysql')->table('user_tenant_map')->insert(['email' => $email, 'tenant_id' => $existingTenantSlug, 'created_at' => now(), 'updated_at' => now()]);

        Mail::fake();

        $response = $this->post(route('signup.store'), $this->validPayload(['owner_email' => $email]));

        $response->assertSessionHasErrors('owner_email');
        Mail::assertNothingSent();
    }

    public function test_sends_a_signed_verification_link_on_valid_signup(): void
    {
        Mail::fake();

        $email = 'owner-'.uniqid().'@example.com';
        $response = $this->post(route('signup.store'), $this->validPayload(['owner_email' => $email]));

        $response->assertRedirect(route('signup.check-email', ['email' => $email]));

        Mail::assertSent(TenantSignupVerificationMail::class, function (TenantSignupVerificationMail $mail) use ($email) {
            return $mail->hasTo($email)
                && str_contains($mail->verificationUrl, route('signup.verify'));
        });
    }

    public function test_verify_rejects_a_tampered_payload(): void
    {
        $response = $this->get(route('signup.verify').'?payload=not-a-real-token&signature=invalid');

        // Firma inválida -> Laravel corta antes de nuestro controller.
        $response->assertForbidden();
    }

    public function test_verify_gracefully_redirects_when_the_slug_was_taken_meanwhile(): void
    {
        $slug = 'raced-'.uniqid();
        $email = 'owner2-'.uniqid().'@example.com';
        DB::connection('mysql')->table('tenants')->insert(['id' => $slug, 'name' => 'Raced', 'plan' => 'starter', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]);

        $payload = Crypt::encryptString(json_encode([
            'id' => $slug,
            'name' => 'Empresa',
            'owner_name' => 'Owner',
            'owner_email' => $email,
            'owner_password' => 'password123',
            'plan' => 'starter',
        ]));

        $url = URL::temporarySignedRoute('signup.verify', now()->addHours(24), ['payload' => $payload]);

        $response = $this->get($url);

        $response->assertRedirect(route('signup.create'));
        $response->assertSessionHas('error');
        $this->assertFalse(DB::connection('mysql')->table('user_tenant_map')->where('email', $email)->exists());
    }

    protected function validPayload(array $overrides = []): array
    {
        return array_merge([
            'id' => 'nueva-empresa-'.uniqid(),
            'name' => 'Nueva Empresa',
            'owner_name' => 'Owner Test',
            'owner_email' => 'owner@example.com',
            'owner_password' => 'password123',
            'owner_password_confirmation' => 'password123',
            'plan' => 'starter',
        ], $overrides);
    }
}
