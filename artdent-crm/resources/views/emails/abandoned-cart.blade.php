@extends('emails._layout')

@section('title', '¿Olvidaste algo? Tu carrito te espera en ArtDent')

@section('content')
  <h1 style="margin:0 0 6px;font-size:22px;color:#397B9C;">¡Tu carrito te está esperando!</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#888;">Dejaste productos en tu carrito. Completá tu compra antes de que se agote el stock.</p>

  {{-- Items --}}
  @if(!empty($items))
  <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#333;">Productos en tu carrito</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-top:1px solid #eee;">
    @foreach($items as $item)
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#444;">
        {{ $item['name'] ?? 'Producto' }}
        <span style="font-size:12px;color:#999;"> × {{ $item['qty'] ?? 1 }}</span>
      </td>
      @if(!empty($item['price']))
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#333;text-align:right;white-space:nowrap;">
        ${{ number_format($item['price'] * ($item['qty'] ?? 1), 0, ',', '.') }}
      </td>
      @endif
    </tr>
    @endforeach
  </table>
  @endif

  {{-- CTA --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="text-align:center;padding:8px 0;">
        <a href="{{ $checkoutUrl }}"
          style="display:inline-block;background:#397B9C;color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;">
          Completar mi compra
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
    Si ya completaste tu compra, ignorá este mensaje.<br>
    <a href="{{ $checkoutUrl }}" style="color:#397B9C;">shop.artdent.com.ar</a>
  </p>
@endsection
