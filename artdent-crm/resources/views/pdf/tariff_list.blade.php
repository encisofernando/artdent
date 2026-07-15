<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Arancel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}
:root {
    --blue: #397B9C;
    --green: #5AAD9C;
    --mint: #ACD6CE;
    --teal: #49949C;
    --mint-pale: #DAEEE3;
    --blue-pale: #DAE6F0;
    --slate: #7CA5C3;
    --ink: #223338;
}
body {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 9.3pt;
    color: var(--ink);
    background: #fff;
    padding: 0 14mm;
    position: relative;
}

.ribbon-mark { position: absolute; top: 2mm; right: 0; opacity: .07; width: 34mm; z-index: -1; }

.price-columns { column-count: 2; column-gap: 11mm; padding-top: 1.5mm; column-fill: auto; }
.cat-card { break-inside: avoid; margin: 0 0 6.5mm; }
.cat-card.tone-a .cat-header { background: var(--mint-pale); color: var(--blue); }
.cat-card.tone-b .cat-header { background: var(--blue-pale); color: var(--teal); }
.cat-header { font-weight: 800; font-size: 8.6pt; text-transform: uppercase; letter-spacing: .07em; text-align: center; padding: 5px 8px; border-radius: 4px; }
.cat-items { padding-top: 3px; }
.item-row { display: flex; align-items: flex-end; padding: 3.5px 1px; font-size: 9pt; }
.item-name { color: var(--ink); }
.item-dots { flex: 1 1 auto; min-width: 8px; border-bottom: 1px dotted #B7C4C8; margin: 0 5px 2px; }
.item-price { flex-shrink: 0; font-weight: 700; color: var(--blue); white-space: nowrap; }
.item-price.na { color: #8A9AA0; font-weight: 600; font-size: 8pt; }

.notes-block { break-inside: avoid-column; margin: 0 0 6.5mm; }
.notes-text { font-size: 8.6pt; line-height: 1.65; color: var(--ink); white-space: pre-line; margin-top: 3px; }
.notes-text b { color: var(--blue); }
.qr-wrap { break-inside: avoid-column; margin-top: 6mm; }
.qr-block { text-align: center; }
.qr-card { display: inline-block; background: var(--mint-pale); border-radius: 8px; padding: 10px 10px 8px; }
.qr-caption { font-size: 7.5pt; font-weight: 800; letter-spacing: .1em; color: var(--teal); margin-top: 5px; }
.ig-handle { text-align: center; font-size: 10pt; font-weight: 800; color: var(--blue); margin: 0 0 4mm; }
</style>
</head>
<body>

@php
    $fmt = fn (float $v) => $v > 0 ? '$'.number_format($v, 2, ',', '.') : null;
    $ribbon = '<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20 C50 8,30 3,14 11 C2 17,2 23,14 29 C30 37,50 32,50 20 Z" fill="#397B9C"/>
        <path d="M50 20 C50 8,70 3,86 11 C98 17,98 23,86 29 C70 37,50 32,50 20 Z" fill="#5AAD9C"/>
    </svg>';
@endphp

<div class="ribbon-mark">{!! $ribbon !!}</div>

<div class="price-columns">
    @foreach($categories as $category => $items)
        <div class="cat-card {{ $loop->even ? 'tone-a' : 'tone-b' }}">
            <div class="cat-header">{{ $category }}</div>
            <div class="cat-items">
                @foreach($items as $item)
                    <div class="item-row">
                        <span class="item-name">{{ $item->name }}</span>
                        <span class="item-dots"></span>
                        @if($fmt((float) $item->price))
                            <span class="item-price">{{ $fmt((float) $item->price) }}</span>
                        @else
                            <span class="item-price na">Consultar precio</span>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach

    @if($resolvedNotes || $igQrSrc || $waQrSrc)
        <div class="notes-block">
            <div class="cat-card tone-a">
                <div class="cat-header">Importante leer</div>
            </div>
            @if($resolvedNotes)
                <div class="notes-text">{{ $resolvedNotes }}</div>
            @endif
        </div>

        @if($igQrSrc || $waQrSrc)
            <div class="qr-wrap">
                @if($company->instagram_handle)
                    <div class="ig-handle">{{ '@'.ltrim($company->instagram_handle, '@') }}</div>
                @endif
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%;" class="qr-block">
                            @if($igQrSrc)
                                <div class="qr-card">
                                    <img src="{{ $igQrSrc }}" alt="Instagram" style="width: 70px; height: 70px; display: block;">
                                </div>
                                <div class="qr-caption">INSTAGRAM</div>
                            @endif
                        </td>
                        <td style="width: 50%;" class="qr-block">
                            @if($waQrSrc)
                                <div class="qr-card">
                                    <img src="{{ $waQrSrc }}" alt="WhatsApp" style="width: 70px; height: 70px; display: block;">
                                </div>
                                <div class="qr-caption">WHATSAPP</div>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        @endif
    @endif
</div>

</body>
</html>
