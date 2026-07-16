<?php

namespace App\Services;

use App\Mail\CrmTransactionalMail;
use App\Models\Company;
use Illuminate\Support\Facades\Mail;

class EmailTemplateService
{
    /** Default templates when the company hasn't customized them. */
    private array $defaults = [
        'sale' => [
            'subject' => 'Comprobante #{numero} · {empresa}',
            'body' => "Hola {cliente},\n\nTe enviamos el comprobante de tu compra.\n\nN° de comprobante: {numero}\nFecha: {fecha}\nTotal: {total}\n\n{link}\n\nMuchas gracias por tu preferencia.\n{empresa}",
        ],
        'quote' => [
            'subject' => 'Presupuesto #{numero} · {empresa}',
            'body' => "Hola {cliente},\n\nTe compartimos el presupuesto solicitado.\n\nN° de presupuesto: {numero}\nFecha: {fecha}\nTotal estimado: {total}\n\nPodés verlo en el siguiente enlace:\n{link}\n\nQuedamos a tu disposición.\n{empresa}",
        ],
        'payment' => [
            'subject' => 'Confirmación de pago · {empresa}',
            'body' => "Hola {cliente},\n\nConfirmamos la recepción de tu pago.\n\nMonto: {monto}\nFecha: {fecha}\nMétodo: {metodo}\n\nMuchas gracias.\n{empresa}",
        ],
        'account_statement' => [
            'subject' => 'Estado de cuenta · {empresa}',
            'body' => "Hola {cliente},\n\nTe enviamos tu estado de cuenta actualizado.\n\nSaldo actual: {saldo}\nFecha: {fecha}\n\nSi tenés alguna consulta, no dudes en contactarnos.\n{empresa}",
        ],
    ];

    /**
     * Resolve a template string replacing {variable} placeholders.
     *
     * @param  array<string,string>  $vars
     */
    public function resolve(string $template, array $vars): string
    {
        $search = array_map(fn ($k) => '{'.$k.'}', array_keys($vars));
        $replace = array_values($vars);

        return str_replace($search, $replace, $template);
    }

    /**
     * Build subject + body for a given template type using the company's
     * customized templates (falls back to defaults).
     *
     * @param  'sale'|'quote'|'payment'  $type
     * @param  array<string,string>  $vars
     * @return array{subject:string,body:string}
     */
    public function build(string $type, Company $company, array $vars): array
    {
        $colSubject = "email_{$type}_subject";
        $colBody = "email_{$type}_body";

        $subjectTpl = (isset($company->{$colSubject}) ? $company->{$colSubject} : null)
            ?: ($this->defaults[$type]['subject'] ?? '');
        $bodyTpl = (isset($company->{$colBody}) ? $company->{$colBody} : null)
            ?: ($this->defaults[$type]['body'] ?? '');

        return [
            'subject' => $this->resolve($subjectTpl, $vars),
            'body' => $this->resolve($bodyTpl, $vars),
        ];
    }

    /**
     * Queue a transactional email for a CRM template type.
     *
     * @param  'sale'|'quote'|'payment'  $type
     * @param  array<string,string>  $vars
     */
    public function send(string $type, string $recipientEmail, Company $company, array $vars): void
    {
        ['subject' => $subject, 'body' => $body] = $this->build($type, $company, $vars);

        Mail::to($recipientEmail)->queue(new CrmTransactionalMail($subject, $body, $company));
    }
}
