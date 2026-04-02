<?php

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

it('downloads the newest windows installer by priority', function () {
    Storage::fake('public');

    Storage::disk('public')->put('downloads/print-manager/windows/artdent-print-server.zip', 'zip-binary');
    sleep(1);
    Storage::disk('public')->put('downloads/print-manager/windows/ArtDentPrint-1.0.0.msi', 'msi-binary');

    $response = $this->get('/print-manager/download/windows');

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('ArtDentPrint-1.0.0.msi');
});

it('detects linux from the user agent when no platform is provided', function () {
    Storage::fake('public');

    Storage::disk('public')->put('downloads/print-manager/linux/ArtDentPrint-1.0.0.AppImage', 'appimage-binary');

    $response = $this
        ->withHeader('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64)')
        ->get('/print-manager/download');

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('ArtDentPrint-1.0.0.AppImage');
});

it('returns 404 when the installer for the detected platform is missing', function () {
    Storage::fake('public');

    $response = $this->get('/print-manager/download/windows');

    $response->assertNotFound();
});
