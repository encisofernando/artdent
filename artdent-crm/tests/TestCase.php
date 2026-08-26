<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Ver tests/Concerns/RefreshesTenantSchema.php — un override acá no
    // sirve: Pest inyecta RefreshDatabase directo en la clase de test
    // (pest()->extend()->use()), y un método de trait usado en la propia
    // clase siempre gana sobre un método heredado de esta clase padre.
}
