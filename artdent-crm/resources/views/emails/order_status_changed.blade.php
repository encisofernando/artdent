@extends('emails._layout')

@section('title', "Pedido #{{ $order->order_number }} · {{ $statusLabel }}")

@section('content')

  @php
  $iconMap = [
    'confirmed'  => '✅',
    'processing' => '📦',
    'shipped'    => '🚚',
    'delivered'  => '🎉',
    'cancelled'  => '❌',
    'refunded'   => '↩️',
  ];
  $icon = $iconMap[$order->status] ?? '📋';
  $isBad = in_array($order->status, ['cancelled', 'refunded']);
  $headerColor = $isBad ? '#c0392b' : '#5AAD9C';
  @endphp

  <h1 style="margin:0 0 6px;font-size:22px;color:{{ $headerColor }};">{{ $icon }} {{ $statusLabel }}</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#888;">Pedido <strong style="font-family:monospace;color:#397B9C;">#{{ $order->order_number }}</strong></p>

  @if($order->status === 'shipped')
  @php $tracking = $order->shipments->first(); @endphp
  @if($tracking)
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#f0f8ff;border:1px solid #d0e8f5;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#397B9C;">Datos de seguimiento</p>
        @if($tracking->carrier)
          <p style="margin:0 0 4px;font-size:13px;color:#555;"><strong>Carrier:</strong> {{ $tracking->carrier }}</p>
        @endif
        @if($tracking->tracking_code)
          <p style="margin:0 0 4px;font-size:13px;color:#555;"><strong>Código:</strong> <span style="font-family:monospace;">{{ $tracking->tracking_code }}</span></p>
        @endif
        @if($tracking->estimated_delivery)
          <p style="margin:0;font-size:13px;color:#555;"><strong>Entrega estimada:</strong> {{ $tracking->estimated_delivery }}</p>
        @endif
      </td>
    </tr>
  </table>
  @endif
  @endif

  <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
    @switch($order->status)
      @case('confirmed')
        Tu pedido fue confirmado y pronto comenzará la preparación.
        @break
      @case('processing')
        Tu pedido está siendo preparado. Te notificaremos cuando sea despachado.
        @break
      @case('shipped')
        ¡Tu pedido está en camino! Usá el código de seguimiento para rastrearlo.
        @break
      @case('delivered')
        ¡Tu pedido fue entregado! Esperamos que todo sea de tu agrado.
        @break
      @case('cancelled')
        Tu pedido fue cancelado. Si tenés alguna consulta, contactanos.
        @break
      @case('refunded')
        El reembolso de tu pedido fue procesado.
        @break
      @default
        El estado de tu pedido fue actualizado.
    @endswitch
  </p>

  <p style="text-align:center;margin:0 0 8px;">
    <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) }}/pedido/{{ $order->order_number }}"
       style="display:inline-block;background:#397B9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Ver mi pedido
    </a>
  </p>
@endsection
