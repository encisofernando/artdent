@extends('emails._layout')

@php
    $fmt = fn ($n) => '$'.number_format((float) $n, 2, ',', '.');
    $diffLabel = $difference == 0
        ? 'Sin diferencias'
        : ($difference > 0 ? 'Sobrante de '.$fmt($difference) : 'Faltante de '.$fmt(abs($difference)));
    $diffColor = $difference == 0 ? '#397B9C' : ($difference > 0 ? '#2f9e5b' : '#c0392b');
@endphp

@section('title', 'Cierre de caja — '.($session->cash_drawer->name ?? 'Caja'))

@section('content')
  <h1 style="margin:0 0 6px;font-size:22px;color:#397B9C;">Cierre de caja</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#888;">
    {{ $session->cash_drawer->name ?? 'Caja' }} · abierta por {{ $session->user->name ?? '—' }} el
    {{ $session->opened_at->format('d/m/Y H:i') }} · cerrada el {{ $session->closed_at->format('d/m/Y H:i') }}
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#f0f8ff;border:1px solid #d0e8f5;border-radius:8px;padding:16px 20px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Diferencia de arqueo</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:{{ $diffColor }};">{{ $diffLabel }}</p>
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;border-top:1px solid #eee;">
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#444;">Caja inicial</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#333;text-align:right;">{{ $fmt($report['opening_amount']) }}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#444;">Ingresos manuales</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#333;text-align:right;">{{ $fmt($report['manual_income']) }}</td>
    </tr>

    <tr>
      <td colspan="2" style="padding:16px 0 6px;font-size:13px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:0.5px;">Ventas por medio de pago</td>
    </tr>
    @forelse($report['sales_by_method'] as $line)
    <tr>
      <td style="padding:6px 0 6px 12px;border-bottom:1px solid #eee;font-size:14px;color:#444;">{{ $line['label'] }}</td>
      <td style="padding:6px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#333;text-align:right;">{{ $fmt($line['amount']) }}</td>
    </tr>
    @empty
    <tr>
      <td colspan="2" style="padding:6px 0 6px 12px;border-bottom:1px solid #eee;font-size:13px;color:#999;">Sin ventas registradas en este turno.</td>
    </tr>
    @endforelse

    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#444;">Egresos</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#c0392b;text-align:right;">-{{ $fmt($report['expenses']) }}</td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#f0f5f8;border-radius:8px;padding:14px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#555;padding-bottom:4px;">Total esperado en efectivo</td>
            <td style="font-size:15px;font-weight:700;color:#333;text-align:right;padding-bottom:4px;">{{ $fmt($report['expected_cash']) }}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;">Contado al cierre</td>
            <td style="font-size:15px;font-weight:700;color:#333;text-align:right;">{{ $fmt($closingAmount) }}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding-top:10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#888;">Total por medios digitales (no afecta el efectivo en caja)</td>
            <td style="font-size:14px;font-weight:600;color:#397B9C;text-align:right;">{{ $fmt($report['sales_digital_total']) }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  @if($session->notes)
  <p style="margin:20px 0 0;font-size:12px;color:#999;white-space:pre-line;">{{ $session->notes }}</p>
  @endif
@endsection
