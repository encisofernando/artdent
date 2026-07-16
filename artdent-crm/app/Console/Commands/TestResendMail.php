<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestResendMail extends Command
{
    protected $signature = 'app:test-resend-mail {email}';

    protected $description = 'Send a test email via Resend';

    public function handle(): void
    {
        $email = $this->argument('email');
        try {
            Mail::raw('Test email desde ArtCode via Resend 🦷', fn ($m) => $m->to($email)->subject('Test ArtCode · Resend'));
            $this->info("Email enviado a {$email}");
        } catch (\Exception $e) {
            $this->error('Error: '.$e->getMessage());
        }
    }
}
