@extends('emails._layout')

@section('title', "Pedido #{{ $order->order_number }} recibido")

@section('content')
  <h1 style="margin:0 0 6px;font-size:22px;color:#397B9C;">¡Pedido recibido!</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#888;">{{ $recipientName }} · {{ now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}</p>

  {{-- Order number badge --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#f0f8ff;border:1px solid #d0e8f5;border-radius:8px;padding:16px 20px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Número de pedido</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#397B9C;font-family:monospace;">{{ $order->order_number }}</p>
      </td>
    </tr>
  </table>

  {{-- Items --}}
  <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#333;">Productos</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:1px solid #eee;">
    @foreach($order->ecommerce_order_items as $item)
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#444;">
        {{ $item->product_name }}
        <span style="font-size:12px;color:#999;">× {{ $item->quantity }}</span>
        @if($item->sku)
          <span style="font-size:11px;color:#bbb;"> · SKU: {{ $item->sku }}</span>
        @endif
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#333;text-align:right;white-space:nowrap;">
        ${{ number_format($item->total, 0, ',', '.') }}
      </td>
    </tr>
    @endforeach
  </table>

  {{-- Totals --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="font-size:13px;color:#666;padding:4px 0;">Subtotal</td>
      <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">${{ number_format($order->subtotal, 0, ',', '.') }}</td>
    </tr>
    @if($order->discount_amount > 0)
    <tr>
      <td style="font-size:13px;color:#3a8a5c;padding:4px 0;">Descuento</td>
      <td style="font-size:13px;color:#3a8a5c;padding:4px 0;text-align:right;">-${{ number_format($order->discount_amount, 0, ',', '.') }}</td>
    </tr>
    @endif
    <tr>
      <td style="font-size:13px;color:#666;padding:4px 0;">IVA</td>
      <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">${{ number_format($order->tax_amount, 0, ',', '.') }}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:8px;border-top:2px solid #eee;"></td>
    </tr>
    <tr>
      <td style="font-size:16px;font-weight:700;color:#333;padding:4px 0;">Total</td>
      <td style="font-size:18px;font-weight:700;color:#397B9C;padding:4px 0;text-align:right;">${{ number_format($order->total, 0, ',', '.') }}</td>
    </tr>
  </table>

  {{-- CTA --}}
  <p style="text-align:center;margin:0 0 20px;">
    <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) }}/pedido/{{ $order->order_number }}"
       style="display:inline-block;background:#397B9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Ver mi pedido
    </a>
  </p>

  @if($order->shipping_address)
  <p style="margin:0 0 4px;font-size:13px;color:#888;font-weight:600;">Dirección de envío</p>
  <p style="margin:0;font-size:13px;color:#555;">{{ $order->shipping_name }} · {{ $order->shipping_address }}</p>
  @endif

  <p style="margin:24px 0 0;font-size:13px;color:#aaa;text-align:center;">
    Nos contactaremos para coordinar el envío. Ante cualquier consulta, respondé a este email.
  </p>
@endsection
