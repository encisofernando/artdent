import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, Plus, Minus, Printer, Tag, Trash2, ChevronDown } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    printHtmlWithElectron,
    openBrowserPrint,
    getStoredTicketFormat,
    getStoredPrintBackend,
} from '@/lib/print';
import axios from 'axios';

/* ── Brand tokens ───────────────────────────────────────────────────────── */
const BLUE  = '#397B9C';
const TEAL  = '#5AAD9C';
const LIGHT = '#ACD6CE';

/* ── Husares A4 templates ───────────────────────────────────────────────── */
// w × h in mm, cols × rows as printed on the physical sheet
const HUSARES_TEMPLATES = [
    { id: '14',  code: '34214/34114', count: 14, w: 99.0, h: 38.1, cols: 2, rows:  7 },
    { id: '16',  code: '34216/34116', count: 16, w: 99.0, h: 33.9, cols: 2, rows:  8 },
    { id: '21',  code: '34221/34121', count: 21, w: 63.5, h: 38.1, cols: 3, rows:  7 },
    { id: '24',  code: '34224/34134', count: 24, w: 64.0, h: 33.9, cols: 3, rows:  8 },
    { id: '27',  code: '34227/34127', count: 27, w: 70.0, h: 31.0, cols: 3, rows:  9 },
    { id: '30',  code: '34230/34130', count: 30, w: 64.0, h: 25.4, cols: 3, rows: 10 },
    { id: '33',  code: '34233/34133', count: 33, w: 70.0, h: 25.4, cols: 3, rows: 11 },
    { id: '36',  code: '34236/34136', count: 36, w: 52.5, h: 32.8, cols: 4, rows:  9 },
    { id: '40',  code: '34240/34140', count: 40, w: 48.0, h: 25.4, cols: 4, rows: 10 },
    { id: '64',  code: '34264/34164', count: 64, w: 48.5, h: 16.9, cols: 4, rows: 16 },
    { id: '65',  code: '34265/34165', count: 65, w: 38.1, h: 21.2, cols: 5, rows: 13 },
    { id: '80',  code: '34280/34180', count: 80, w: 35.6, h: 16.9, cols: 5, rows: 16 },
];

// Design tier based on label height
function tier(hMm) {
    if (hMm < 20) return 'xs';  // 64, 80 labels
    if (hMm < 27) return 'sm';  // 40, 65 labels
    if (hMm < 34) return 'md';  // 27, 30, 33, 36 labels
    return 'lg';                 // 14, 16, 21, 24 labels
}

/* ── Barcode SVG (preview) ──────────────────────────────────────────────── */
function BarcodeSvg({ value, width = 1.8, height = 50 }) {
    const ref = useRef(null);
    const [err, setErr] = useState(false);

    useEffect(() => {
        if (!ref.current || !value) return;
        setErr(false);
        import('jsbarcode').then(({ default: JsBarcode }) => {
            try {
                JsBarcode(ref.current, String(value), {
                    format: 'CODE128', width, height,
                    margin: 0, displayValue: false,
                    background: 'transparent', lineColor: '#1a1a1a',
                });
            } catch { setErr(true); }
        }).catch(() => setErr(true));
    }, [value, width, height]);

    if (err || !value) return <span style={{ fontSize: 8, color: '#f87171' }}>Sin código</span>;
    return <svg ref={ref} />;
}

/* ── Thermal label card (preview) ──────────────────────────────────────── */
function ThermalLabelCard({ product, format }) {
    const code     = product.barcode || product.sku || String(product.id);
    const W        = format === '57mm' ? 164 : format === '55x44' ? 200 : 234;
    const bH       = format === '57mm' ? 38  : format === '55x44' ? 44  : 46;
    const bW       = format === '57mm' ? 1.2 : format === '55x44' ? 1.3 : 1.5;
    const nameSz   = format === '57mm' ? 9   : format === '55x44' ? 10  : 11;
    const headerH  = format === '57mm' ? 26  : format === '55x44' ? 30  : 32;

    return (
        <div style={{ width: W, background: '#fff', borderRadius: 6, overflow: 'hidden', border: `1px solid ${LIGHT}`, boxShadow: '0 1px 4px rgba(57,123,156,0.12)', flexShrink: 0, fontFamily: "'Montserrat',Arial,sans-serif" }}>
            <div style={{ background: BLUE, height: headerH, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
                <img src="/assets/logo-artdent-blanco.png" alt="ArtDent" style={{ height: headerH - 8, objectFit: 'contain' }} />
                <div style={{ flex: 1 }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: format === '57mm' ? 5.5 : 6.5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.2 }}>
                    LABORATORIO<br />ODONTOLÓGICO
                </span>
            </div>
            <div style={{ padding: format === '57mm' ? '5px 7px 4px' : '7px 9px 5px' }}>
                <div style={{ fontSize: nameSz, fontWeight: 700, color: '#1e293b', lineHeight: 1.25, marginBottom: format === '57mm' ? 4 : 5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {product.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                    <BarcodeSvg value={code} width={bW} height={bH} />
                </div>
                <div style={{ textAlign: 'center', fontSize: format === '57mm' ? 6.5 : 7.5, color: '#64748b', letterSpacing: 1.5, fontFamily: 'monospace' }}>{code}</div>
            </div>
            <div style={{ height: 3, background: `linear-gradient(90deg,${BLUE},${TEAL})` }} />
        </div>
    );
}

/* ── A4 label card (preview — scaled) ──────────────────────────────────── */
function A4LabelCard({ product, tpl, scale }) {
    const code = product.barcode || product.sku || String(product.id);

    // Mirror exact same proportions as buildA4LabelsHtml
    const hdrMm      = Math.min(9.0, Math.max(3.0, tpl.h * 0.24));
    const acMm       = 1.0;
    const padMm      = Math.max(0.8, tpl.h * 0.04);
    const nameFontMm = Math.min(2.5, Math.max(1.4, tpl.h * 0.055));
    const valFontMm  = Math.min(1.8, Math.max(1.0, tpl.h * 0.038));
    const nameLines  = tpl.h >= 28 ? 2 : 1;
    const nameAreaMm = nameLines * nameFontMm * 1.35;
    const valAreaMm  = valFontMm * 1.3;
    const barcHmm    = Math.max(4, tpl.h - hdrMm - acMm - nameAreaMm - valAreaMm - padMm * 2.5);
    const barcW      = tpl.w > 70 ? 1.6 : tpl.w > 55 ? 1.3 : tpl.w > 42 ? 1.05 : 0.8;

    // Convert mm → px for preview
    const W      = tpl.w    * scale;
    const H      = tpl.h    * scale;
    const hdrH   = hdrMm    * scale;
    const acH    = acMm     * scale;
    const padPx  = padMm    * scale;
    const nameSz = nameFontMm * scale;
    const valSz  = valFontMm  * scale;
    const logoH  = Math.max(4, (hdrMm - 2.0) * scale);
    const barcH  = Math.max(6, barcHmm * scale);

    const showSub  = hdrMm >= 7.0;
    const showLogo = hdrMm >= 4.0;

    return (
        <div style={{ width: W, height: H, background: '#fff', border: `0.5px solid #ccc`, overflow: 'hidden', flexShrink: 0, fontFamily: "'Montserrat',Arial,sans-serif", display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: BLUE, height: hdrH, minHeight: hdrH, display: 'flex', alignItems: 'center', padding: `0 ${Math.max(1, tpl.w * 0.012) * scale}px`, gap: Math.max(1, scale * 0.5), flexShrink: 0, overflow: 'hidden' }}>
                {showLogo
                    ? <img src="/assets/logo-artdent-blanco.png" alt="" style={{ height: logoH, maxWidth: tpl.w * 0.52 * scale, objectFit: 'contain', flexShrink: 0 }} />
                    : <span style={{ color: '#fff', fontSize: hdrH * 0.38, fontWeight: 900, letterSpacing: 0.3, textTransform: 'uppercase' }}>ARTDENT</span>
                }
                {showSub && (
                    <>
                        <div style={{ flex: 1 }} />
                        <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: hdrH * 0.22, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.1 }}>
                            LAB.<br />ODONT.
                        </span>
                    </>
                )}
            </div>

            {/* Body */}
            <div style={{ flex: 1, minHeight: 0, padding: `${padPx}px ${Math.max(1.5, tpl.w * 0.018) * scale}px ${padPx * 0.5}px`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ fontSize: nameSz, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.25, textTransform: 'uppercase', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: nameLines, WebkitBoxOrient: 'vertical', flexShrink: 0, marginBottom: padPx * 0.3 }}>
                    {product.name}
                </div>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <BarcodeSvg value={code} width={barcW} height={barcH} />
                </div>
                <div style={{ textAlign: 'center', fontSize: valSz, color: '#555', letterSpacing: 0.8, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {code}
                </div>
            </div>

            {/* Accent */}
            <div style={{ height: acH, minHeight: acH, background: `linear-gradient(90deg,${BLUE},${TEAL})`, flexShrink: 0 }} />
        </div>
    );
}

/* ── HTML builders ──────────────────────────────────────────────────────── */
function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function buildThermalLabelsHtml(items, format, logoOrigin) {
    const expanded = items.flatMap(({ product, qty }) => Array.from({ length: qty }, () => product));

    const labelW  = format === '57mm' ? 44  : format === '55x44' ? 53  : 68;
    const labelH  = format === '57mm' ? 30  : format === '55x44' ? 42  : 36;
    const barcH   = format === '57mm' ? 32  : format === '55x44' ? 38  : 40;
    const barcW   = format === '57mm' ? 1.1 : format === '55x44' ? 1.3 : 1.4;
    const headerH = format === '57mm' ? 24  : format === '55x44' ? 28  : 30;
    const logoH   = headerH - 6;
    const nameSz  = format === '57mm' ? 6   : format === '55x44' ? 7   : 7.5;
    const pageSize = format === '57mm' ? '50mm auto' : format === '55x44' ? '55mm auto' : '74mm auto';
    const logoSrc = `${logoOrigin}/assets/logo-artdent-blanco.png`;

    const labelsHtml = expanded.map(p => {
        const code = escHtml(p.barcode || p.sku || String(p.id));
        return `<div class="lbl"><div class="hdr"><img src="${logoSrc}" class="logo"><div class="sub">LABORATORIO<br>ODONTOLÓGICO</div></div><div class="body"><div class="name">${escHtml(p.name)}</div><div class="bwrap"><svg class="bc" data-v="${code}" data-w="${barcW}" data-h="${barcH}"></svg></div><div class="bval">${code}</div></div><div class="accent"></div></div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;900&display=swap" rel="stylesheet">
<style>
@page{size:${pageSize};margin:2mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;padding:0;background:#fff;font-family:'Montserrat',Arial,sans-serif}
.lbl{width:${labelW}mm;height:${labelH}mm;background:#fff;border:.3mm solid ${LIGHT};border-radius:1.2mm;overflow:hidden;page-break-inside:avoid;break-inside:avoid;display:flex;flex-direction:column}
.hdr{background:${BLUE};height:${headerH}px;display:flex;align-items:center;padding:0 2.5mm;gap:1.5mm;flex-shrink:0}
.logo{height:${logoH}px;object-fit:contain;display:block}
.sub{margin-left:auto;color:rgba(255,255,255,.75);font-size:${format==='57mm'?'4.5pt':'5pt'};font-weight:600;letter-spacing:.4px;text-transform:uppercase;line-height:1.2;text-align:right}
.body{flex:1;padding:${format==='57mm'?'1mm 2mm .5mm':'1.5mm 2.5mm 1mm'};display:flex;flex-direction:column;justify-content:space-between}
.name{font-size:${nameSz}pt;font-weight:700;color:#1e293b;line-height:1.25;text-transform:uppercase;letter-spacing:.3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:${format==='57mm'?'.8mm':'1mm'}}
.bwrap{display:flex;align-items:center;justify-content:center;flex:1;min-height:0}.bwrap svg{max-width:100%;height:auto}
.bval{text-align:center;font-family:monospace;font-size:${format==='57mm'?'4.5pt':'5.5pt'};color:#64748b;letter-spacing:1.5px;margin-top:.5mm}
.accent{height:2.5px;background:linear-gradient(90deg,${BLUE},${TEAL});flex-shrink:0}
</style></head><body>
<div style="display:flex;flex-wrap:wrap;gap:2mm">${labelsHtml}</div>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<script>window.addEventListener('load',function(){document.querySelectorAll('svg.bc').forEach(function(s){try{JsBarcode(s,s.getAttribute('data-v'),{format:'CODE128',width:parseFloat(s.getAttribute('data-w')),height:parseFloat(s.getAttribute('data-h')),margin:0,displayValue:false,background:'transparent',lineColor:'#1a1a1a'});}catch(e){}});setTimeout(function(){window.print();},900);});</script>
</body></html>`;
}

function buildA4LabelsHtml(items, tplId, logoOrigin) {
    const tpl = HUSARES_TEMPLATES.find(t => t.id === tplId) || HUSARES_TEMPLATES[2];
    const expanded = items.flatMap(({ product, qty }) => Array.from({ length: qty }, () => product));

    const perPage  = tpl.cols * tpl.rows;
    const marginLR = Math.max(0, (210 - tpl.cols * tpl.w) / 2);
    const marginTB = Math.max(0, (297 - tpl.rows * tpl.h) / 2);

    // ── All sizes proportional to actual label height in mm ──────────────
    // Header: 24% of label height, clamped 3–9mm
    const hdrMm  = Math.min(9.0, Math.max(3.0, tpl.h * 0.24));
    // Accent bar: 1mm (tiny gradient strip)
    const acMm   = 1.0;
    // Inner padding: 4% each side, min 0.8mm
    const padMm  = Math.max(0.8, tpl.h * 0.04);
    // Font sizes: 5.5% and 4% of label height
    const nameFontMm = Math.min(2.5, Math.max(1.4, tpl.h * 0.055));
    const valFontMm  = Math.min(1.8, Math.max(1.0, tpl.h * 0.038));
    // Name lines: 2 for labels ≥ 28mm, 1 for smaller
    const nameLines  = tpl.h >= 28 ? 2 : 1;
    // Name area height = lines × font × line-height
    const nameAreaMm = nameLines * nameFontMm * 1.35;
    const valAreaMm  = valFontMm * 1.3;
    // Barcode takes remaining body space
    const barcHmm  = Math.max(4, tpl.h - hdrMm - acMm - nameAreaMm - valAreaMm - padMm * 2.5);
    const barcHpx  = Math.round(barcHmm * 3.78);  // approx 96dpi
    const barcW    = tpl.w > 70 ? 1.6 : tpl.w > 55 ? 1.3 : tpl.w > 42 ? 1.05 : 0.8;

    const logoH   = `${Math.max(2.0, hdrMm - 2.0)}mm`;
    const logoSrc = `${logoOrigin}/assets/logo-artdent-blanco.png`;

    // Sub-text only when header is tall enough
    const showSub  = hdrMm >= 7.0;
    const showLogo = hdrMm >= 4.0;
    const subFontMm = hdrMm * 0.22;

    const hdrInner = showLogo
        ? `<img src="${logoSrc}" class="logo">${showSub ? `<div style="flex:1"></div><span class="sub">LAB.<br>ODONT.</span>` : ''}`
        : `<span style="color:#fff;font-size:${hdrMm * 0.38}mm;font-weight:900;letter-spacing:.3px;text-transform:uppercase">ARTDENT</span>`;

    function labelHtml(p) {
        const code = escHtml(p.barcode || p.sku || String(p.id));
        return `<div class="lbl"><div class="hdr">${hdrInner}</div><div class="body"><div class="name">${escHtml(p.name)}</div><div class="bwrap"><svg class="bc" data-v="${code}" data-w="${barcW}" data-h="${barcHpx}"></svg></div><div class="bval">${code}</div></div><div class="accent"></div></div>`;
    }

    const pages = [];
    for (let i = 0; i < Math.max(1, expanded.length); i += perPage) {
        pages.push(expanded.slice(i, i + perPage));
    }

    const sheetsHtml = pages.map((page, pi) => {
        const cells = [...page];
        while (cells.length < perPage) cells.push(null);
        const cellsHtml = cells.map(p => p ? labelHtml(p) : `<div class="lbl-empty"></div>`).join('');
        return `<div class="sheet${pi < pages.length - 1 ? ' pb' : ''}">${cellsHtml}</div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;900&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;padding:0;background:#fff;font-family:'Montserrat',Arial,sans-serif}
.sheet{
  width:210mm;height:297mm;overflow:hidden;
  display:grid;
  grid-template-columns:repeat(${tpl.cols},${tpl.w}mm);
  grid-template-rows:repeat(${tpl.rows},${tpl.h}mm);
  padding:${marginTB}mm ${marginLR}mm;
  gap:0;
}
.pb{page-break-after:always;break-after:always}
.lbl{
  width:${tpl.w}mm;height:${tpl.h}mm;
  background:#fff;border:.12mm solid #d0d0d0;
  overflow:hidden;display:flex;flex-direction:column;
}
.lbl-empty{width:${tpl.w}mm;height:${tpl.h}mm;border:.12mm dashed #eee}
.hdr{
  background:${BLUE};
  height:${hdrMm}mm;min-height:${hdrMm}mm;max-height:${hdrMm}mm;
  display:flex;align-items:center;
  padding:0 ${Math.max(0.7, tpl.w * 0.012)}mm;
  gap:${Math.max(0.4, tpl.w * 0.008)}mm;
  flex-shrink:0;overflow:hidden;
}
.logo{
  height:${logoH};
  max-width:${tpl.w * 0.52}mm;
  object-fit:contain;display:block;flex-shrink:0;
}
.sub{
  color:rgba(255,255,255,.82);
  font-size:${subFontMm}mm;
  font-weight:700;text-transform:uppercase;
  line-height:1.1;text-align:right;
  white-space:nowrap;overflow:hidden;
}
.body{
  flex:1;min-height:0;
  padding:${padMm}mm ${Math.max(0.8, tpl.w * 0.018)}mm ${padMm * 0.5}mm;
  display:flex;flex-direction:column;overflow:hidden;
}
.name{
  font-size:${nameFontMm}mm;
  font-weight:700;color:#1a1a2e;
  line-height:1.25;text-transform:uppercase;letter-spacing:.1px;
  overflow:hidden;display:-webkit-box;
  -webkit-line-clamp:${nameLines};-webkit-box-orient:vertical;
  flex-shrink:0;margin-bottom:${padMm * 0.3}mm;
}
.bwrap{
  flex:1;min-height:0;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.bwrap svg{max-width:100%;max-height:100%;height:auto;display:block}
.bval{
  font-family:monospace;font-size:${valFontMm}mm;color:#555;
  text-align:center;letter-spacing:.8px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  flex-shrink:0;margin-top:${padMm * 0.2}mm;
}
.accent{height:${acMm}mm;min-height:${acMm}mm;background:linear-gradient(90deg,${BLUE},${TEAL});flex-shrink:0}
</style></head><body>
${sheetsHtml}
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<script>window.addEventListener('load',function(){document.querySelectorAll('svg.bc').forEach(function(s){try{JsBarcode(s,s.getAttribute('data-v'),{format:'CODE128',width:parseFloat(s.getAttribute('data-w')),height:parseFloat(s.getAttribute('data-h')),margin:0,displayValue:false,background:'transparent',lineColor:'#1a1a1a'});}catch(e){}});setTimeout(function(){window.print();},1000);});</script>
</body></html>`;
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function BarcodeLabels({ auth }) {
    const { isDark } = useTheme();

    const [search,        setSearch]        = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching,     setSearching]     = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [format,        setFormat]        = useState(() => {
        const s = getStoredTicketFormat('80mm');
        return ['57mm', '55x44', '80mm'].includes(s) ? s : '80mm';
    });
    const [husaresId,  setHusaresId]  = useState('21');
    const [printing,   setPrinting]   = useState(false);
    const [printError, setPrintError] = useState(null);

    const currentTpl = HUSARES_TEMPLATES.find(t => t.id === husaresId) || HUSARES_TEMPLATES[2];

    // Product search
    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await axios.get(route('products.index'), {
                    params: { search: search.trim(), status: 'active', page: 1 },
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                setSearchResults((data.items?.data || []).slice(0, 20));
            } catch { setSearchResults([]); }
            finally   { setSearching(false); }
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const addProduct = useCallback((product) => {
        setSelectedItems(prev => {
            const found = prev.find(i => i.product.id === product.id);
            if (found) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product, qty: 1 }];
        });
        setSearch('');
        setSearchResults([]);
    }, []);

    const removeItem   = useCallback((id) => setSelectedItems(prev => prev.filter(i => i.product.id !== id)), []);
    const updateQty    = useCallback((id, d) => setSelectedItems(prev =>
        prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, Math.min(99, i.qty + d)) } : i)
    ), []);
    const setQtyDirect = useCallback((id, v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= 1) setSelectedItems(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.min(99, n) } : i));
    }, []);

    const totalLabels = selectedItems.reduce((s, i) => s + i.qty, 0);

    const handlePrint = async () => {
        if (!selectedItems.length) return;
        setPrinting(true);
        setPrintError(null);
        try {
            const origin = window.location.origin;
            let html;
            if (format === 'a4') {
                html = buildA4LabelsHtml(selectedItems, husaresId, origin);
                openBrowserPrint(html, { delay: 1000 });
            } else {
                html = buildThermalLabelsHtml(selectedItems, format, origin);
                const backend = getStoredPrintBackend();
                if (backend === 'browser') {
                    openBrowserPrint(html, { delay: 900 });
                } else {
                    const result = await printHtmlWithElectron({ html, mode: format });
                    if (!result.ok) openBrowserPrint(html, { delay: 900 });
                }
            }
        } catch (err) {
            setPrintError(err?.message || 'Error al imprimir');
        } finally {
            setPrinting(false);
        }
    };

    // Styles
    const card   = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
    const text   = isDark ? 'text-slate-200' : 'text-slate-800';
    const sub    = isDark ? 'text-slate-400' : 'text-slate-500';
    const inp    = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400'}`;
    const itBg   = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200';
    const qBut   = isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300';
    const qInp   = isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800';

    // A4 preview: scale sheet to fit ~500px wide
    const a4PreviewW = 500;
    const a4Scale    = a4PreviewW / 210; // px per mm

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Etiquetas de Código de Barras" />

            <div className={`flex flex-col gap-4 ${text}`}>

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Etiquetas de Código de Barras
                        </h1>
                        <p className={`text-sm ${sub}`}>
                            Imprimí etiquetas de góndola en papel adhesivo 57 mm, 55×44 mm, 80 mm o en hojas A4 Húsares
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Format picker */}
                        <div className={`flex items-center p-0.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            {[
                                { id: '57mm',  label: '57 mm' },
                                { id: '55x44', label: '55×44 mm' },
                                { id: '80mm',  label: '80 mm' },
                                { id: 'a4',    label: 'A4 Húsares' },
                            ].map(f => (
                                <button key={f.id} onClick={() => setFormat(f.id)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${format === f.id
                                        ? (isDark ? 'bg-blue-700 text-white shadow-sm' : 'bg-white shadow-sm border text-blue-700 border-blue-200')
                                        : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <Button onClick={handlePrint} disabled={!selectedItems.length || printing}
                            className="text-white border-none shadow-md rounded-xl font-bold"
                            style={selectedItems.length ? { background: `linear-gradient(135deg,${BLUE},${TEAL})` } : {}}>
                            <Printer size={16} className="mr-2" />
                            {printing ? 'Imprimiendo…' : `Imprimir${totalLabels > 0 ? ` (${totalLabels})` : ''}`}
                        </Button>
                    </div>
                </div>

                {/* ── Husares template selector (only A4) ──────────── */}
                {format === 'a4' && (
                    <div className={`rounded-2xl border p-4 ${card}`}>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Plantilla Húsares</span>
                            <div className="flex flex-wrap gap-2 flex-1">
                                {HUSARES_TEMPLATES.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => setHusaresId(tpl.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${husaresId === tpl.id
                                            ? 'text-white border-transparent shadow-sm'
                                            : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}`}
                                        style={husaresId === tpl.id ? { background: `linear-gradient(135deg,${BLUE},${TEAL})` } : {}}
                                    >
                                        <span className="font-black">{tpl.count}</span>
                                        <span className={`ml-1 ${husaresId === tpl.id ? 'text-white/80' : sub}`}>
                                            {tpl.w}×{tpl.h}mm
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {/* Code badge */}
                            <div className={`text-[10px] font-mono px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                Cód. {currentTpl.code}
                            </div>
                        </div>

                        {/* Grid info */}
                        <div className={`mt-2 text-xs ${sub}`}>
                            {currentTpl.cols} col × {currentTpl.rows} fil · {currentTpl.count} etiquetas/hoja · {currentTpl.w}×{currentTpl.h} mm
                            {totalLabels > 0 && (
                                <span className="font-bold ml-2" style={{ color: BLUE }}>
                                    → {Math.ceil(totalLabels / currentTpl.count)} hoja{Math.ceil(totalLabels / currentTpl.count) !== 1 ? 's' : ''} necesarias
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {printError && (
                    <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {printError}
                    </div>
                )}

                {/* ── Body ───────────────────────────────────────────── */}
                <div className="flex gap-4 min-h-0" style={{ height: 'calc(100vh - 210px)' }}>

                    {/* Left: product selector */}
                    <div className={`w-72 shrink-0 flex flex-col rounded-2xl border shadow-sm overflow-hidden min-h-0 ${card}`}>
                        <div className={`px-4 pt-4 pb-3 border-b shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-sm">Productos</span>
                                {selectedItems.length > 0 && (
                                    <button onClick={() => setSelectedItems([])} className="text-[11px] font-semibold text-red-400 hover:text-red-600">
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
                                <input type="text" placeholder="Buscar nombre o SKU…" value={search}
                                    onChange={e => setSearch(e.target.value)} className={`${inp} pl-8 text-xs`} />
                                {(searchResults.length > 0 || searching) && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-20 max-h-60 overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        {searching
                                            ? <div className={`px-3 py-2 text-xs ${sub}`}>Buscando…</div>
                                            : searchResults.map(p => (
                                                <button key={p.id} onClick={() => addProduct(p)}
                                                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-800'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-xs truncate">{p.name}</div>
                                                        <div className={`text-[10px] ${sub}`}>{p.barcode || p.sku || `#${p.id}`}</div>
                                                    </div>
                                                    <Plus size={13} style={{ color: TEAL, flexShrink: 0 }} />
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
                            {selectedItems.length === 0
                                ? (
                                    <div className={`flex flex-col items-center gap-2 py-12 text-center ${sub}`}>
                                        <Tag size={28} className="opacity-25" />
                                        <p className="text-xs">Buscá un producto para agregarlo</p>
                                    </div>
                                )
                                : selectedItems.map(({ product, qty }) => (
                                    <div key={product.id} className={`flex items-center gap-2 p-2 rounded-xl border ${itBg}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-[11px] truncate">{product.name}</div>
                                            <div className={`text-[9px] ${sub}`}>{product.barcode || product.sku || `#${product.id}`}</div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => updateQty(product.id, -1)} className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${qBut}`}>
                                                <Minus size={9} />
                                            </button>
                                            <input type="text" inputMode="numeric" pattern="[0-9]*" value={qty}
                                                onChange={e => setQtyDirect(product.id, e.target.value)}
                                                className={`w-8 text-center text-xs font-bold rounded border py-0.5 outline-none ${qInp}`} />
                                            <button onClick={() => updateQty(product.id, 1)} className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${qBut}`}>
                                                <Plus size={9} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeItem(product.id)} className={`w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}>
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>

                        {selectedItems.length > 0 && (
                            <div className={`px-4 py-2 border-t text-xs font-bold shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`} style={{ color: BLUE }}>
                                {selectedItems.length} producto{selectedItems.length !== 1 ? 's' : ''} · {totalLabels} etiqueta{totalLabels !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {/* Right: preview */}
                    <div className={`flex-1 min-w-0 min-h-0 rounded-2xl border shadow-sm overflow-hidden flex flex-col ${card}`}>
                        <div className={`px-5 py-3 border-b flex items-center gap-3 shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                            <h3 className="font-bold text-sm">Vista Previa</h3>
                            {totalLabels > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${BLUE}18`, color: BLUE }}>
                                    {totalLabels} etiqueta{totalLabels !== 1 ? 's' : ''}
                                    {format === 'a4' && ` · ${Math.ceil(totalLabels / currentTpl.count)} hoja${Math.ceil(totalLabels / currentTpl.count) !== 1 ? 's' : ''}`}
                                </span>
                            )}
                            <span className={`ml-auto text-xs ${sub}`}>
                                {format === '57mm'  && 'Papel adhesivo 57 mm'}
                                {format === '55x44' && 'Rollo adhesivo 55×44 mm'}
                                {format === '80mm'  && 'Papel adhesivo 80 mm'}
                                {format === 'a4'    && `A4 Húsares · ${currentTpl.count} etiq/hoja · ${currentTpl.cols}×${currentTpl.rows}`}
                            </span>
                        </div>

                        <div className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
                            {selectedItems.length === 0
                                ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                                        <div style={{ width: 180, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${LIGHT}`, opacity: 0.45, boxShadow: '0 2px 8px rgba(57,123,156,0.1)' }}>
                                            <div style={{ background: BLUE, height: 28, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 3, height: 14, width: 70 }} />
                                            </div>
                                            <div style={{ background: '#fff', padding: '8px 10px 4px' }}>
                                                <div style={{ background: '#e2e8f0', borderRadius: 3, height: 10, width: '80%', marginBottom: 8 }} />
                                                <div style={{ background: '#e2e8f0', borderRadius: 3, height: 32, width: '100%', marginBottom: 4 }} />
                                                <div style={{ background: '#e2e8f0', borderRadius: 3, height: 6, width: '60%', margin: '0 auto' }} />
                                            </div>
                                            <div style={{ height: 3, background: `linear-gradient(90deg,${BLUE},${TEAL})` }} />
                                        </div>
                                        <p className={`text-sm ${sub}`}>Agregá productos para ver la vista previa</p>
                                    </div>
                                )
                                : format === 'a4'
                                ? (
                                    /* A4 sheet preview */
                                    <div className="flex flex-col items-center gap-4">
                                        {(() => {
                                            const expanded = selectedItems.flatMap(({ product, qty }) =>
                                                Array.from({ length: qty }, () => product)
                                            );
                                            const perPage = currentTpl.cols * currentTpl.rows;
                                            const pages = [];
                                            for (let i = 0; i < expanded.length; i += perPage) pages.push(expanded.slice(i, i + perPage));

                                            // Scale so A4 fits preview area (max width ~520px)
                                            const scaleF = Math.min(a4Scale, 2.47); // cap at 2.47 px/mm

                                            return pages.map((page, pi) => (
                                                <div key={pi}>
                                                    <div className={`text-xs font-bold mb-1 ${sub}`}>Hoja {pi + 1}</div>
                                                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                                                        style={{ width: 210 * scaleF, height: 297 * scaleF, position: 'relative' }}>
                                                        {/* Margin guides (faint) */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: (currentTpl.rows === 1 ? Math.max(0,(297-currentTpl.h)/2) : (297-currentTpl.rows*currentTpl.h)/2) * scaleF,
                                                            left: Math.max(0,(210-currentTpl.cols*currentTpl.w)/2) * scaleF,
                                                            display: 'grid',
                                                            gridTemplateColumns: `repeat(${currentTpl.cols},${currentTpl.w * scaleF}px)`,
                                                            gridTemplateRows: `repeat(${currentTpl.rows},${currentTpl.h * scaleF}px)`,
                                                            gap: 0,
                                                        }}>
                                                            {Array.from({ length: currentTpl.cols * currentTpl.rows }, (_, ci) => {
                                                                const product = page[ci];
                                                                return product
                                                                    ? <A4LabelCard key={ci} product={product} tpl={currentTpl} scale={scaleF} />
                                                                    : <div key={ci} style={{ width: currentTpl.w * scaleF, height: currentTpl.h * scaleF, border: '0.3px dashed #e2e8f0' }} />;
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )
                                : (
                                    /* Thermal paper preview */
                                    <div className="mx-auto bg-white rounded-xl shadow-lg border border-slate-200 p-3"
                                        style={{ width: format === '57mm' ? 186 : format === '55x44' ? 222 : 258, minHeight: 80 }}>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItems.flatMap(({ product, qty }) =>
                                                Array.from({ length: qty }, (_, i) => (
                                                    <ThermalLabelCard key={`${product.id}-${i}`} product={product} format={format} />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
