@extends('emails._layout')

@php $company ??= null; $companyName = $company?->fantasy_name ?: $company?->name ?: 'ArtCode'; @endphp

@section('title', "Comprobante electrónico · {$companyName}")

@section('content')
  <h1 style="margin:0 0 6px;font-size:22px;color:#397B9C;">Comprobante electrónico</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#888;">{{ $recipientName }} · {{ now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}</p>

  <p style="margin:0 0 16px;font-size:14px;color:#333;">
    Estimado/a <strong>{{ $recipientName }}</strong>,
  </p>

  <p style="margin:0 0 16px;font-size:14px;color:#555;">
    Adjuntamos el comprobante electrónico correspondiente a tu compra <strong>#{{ $order->order_number }}</strong>.
  </p>

  {{-- CAE block --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#f0f8ff;border:1px solid #d0e8f5;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 10px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Datos del comprobante</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:#666;padding:3px 0;">Tipo</td>
            <td style="font-size:12px;color:#333;font-weight:600;text-align:right;">
              Factura {{ strtoupper($invoice->invoice_type?->name ?? 'C') }}
              {{ str_pad($invoice->point_sale, 4, '0', STR_PAD_LEFT) }}-{{ str_pad($invoice->number, 8, '0', STR_PAD_LEFT) }}
            </td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#666;padding:3px 0;">CAE</td>
            <td style="font-size:12px;color:#333;font-weight:600;text-align:right;font-family:monospace;">{{ $invoice->cae }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#666;padding:3px 0;">Vencimiento CAE</td>
            <td style="font-size:12px;color:#333;font-weight:600;text-align:right;">
              {{ $invoice->cae_expiry ? \Carbon\Carbon::parse($invoice->cae_expiry)->format('d/m/Y') : 'N/D' }}
            </td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#666;padding:3px 0;">Total</td>
            <td style="font-size:14px;color:#397B9C;font-weight:700;text-align:right;">${{ number_format($invoice->total, 0, ',', '.') }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 16px;font-size:14px;color:#555;">
    Encontrás el PDF del comprobante adjunto a este email.
  </p>

  <p style="margin:0 0 4px;font-size:14px;color:#555;">
    Ante cualquier consulta, respondé este email y te ayudamos.
  </p>

  <p style="margin:28px 0 0;font-size:13px;color:#aaa;text-align:center;">
    Este comprobante fue generado electrónicamente conforme a la normativa AFIP/ARCA vigente.
  </p>
@endsection
