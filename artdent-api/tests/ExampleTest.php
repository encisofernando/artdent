<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_api_is_working()
    {
        $response = $this->get('/api/health');
        $response->assertStatus(200);
    }
}
