import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Plus, Minus, Printer, Tag, Trash2 } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    printElementWithElectron,
    getStoredTicketFormat,
    buildPrintHtml,
    openBrowserPrint,
    getStoredPrintBackend,
} from '@/lib/print';
import axios from 'axios';

/**
 * Renders a Code128 barcode SVG using JsBarcode.
 * Falls back to showing the raw value if the library fails.
 */
function BarcodeSvg({ value, width = 2, height = 60, fontSize = 12 }) {
    const ref = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!ref.current || !value) return;
        setError(false);
        import('jsbarcode').then(({ default: JsBarcode }) => {
            try {
                JsBarcode(ref.current, String(value), {
                    format: 'CODE128',
                    width,
                    height,
                    fontSize,
                    margin: 2,
                    displayValue: false,
                    background: '#fff',
                    lineColor: '#000',
                });
            } catch {
                setError(true);
            }
        }).catch(() => setError(true));
    }, [value, width, height, fontSize]);

    if (error || !value) {
        return (
            <div className="flex items-center justify-center text-[10px] text-red-500 border border-dashed border-red-300 rounded px-2 py-1">
                Sin código
            </div>
        );
    }

    return <svg ref={ref} />;
}

/**
 * Single barcode label — used in both preview and the print zone.
 */
function BarcodeLabel({ product, qty, format, forPrint = false }) {
    const barcodeValue = product.barcode || product.sku || String(product.id);
    const price = Number(product.price || 0);

    // Width in px for preview — print CSS overrides with mm
    const previewWidth = format === '57mm' ? 170 : format === '80mm' ? 240 : 280;
    const barcodeH = format === '57mm' ? 40 : 50;
    const barcodeW = format === '57mm' ? 1.5 : 1.8;

    const labelStyle = forPrint
        ? { display: 'inline-block', verticalAlign: 'top', background: '#fff', color: '#000', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '3px', padding: '4px 6px', margin: '2px', pageBreakInside: 'avoid', breakInside: 'avoid' }
        : { width: previewWidth, background: '#fff', color: '#000', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 8px', fontFamily: 'sans-serif', flexShrink: 0 };

    return (
        <div style={labelStyle}>
            {/* Product name */}
            <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: 28 }}>
                {product.name}
            </div>

            {/* Barcode */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                <BarcodeSvg value={barcodeValue} width={barcodeW} height={barcodeH} fontSize={10} />
            </div>

            {/* Barcode value */}
            <div style={{ textAlign: 'center', fontSize: 8, letterSpacing: 1, color: '#555', marginBottom: 3 }}>
                {barcodeValue}
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 900, borderTop: '1px solid #e5e7eb', paddingTop: 3 }}>
                ${price.toLocaleString('es-AR')}
            </div>

            {/* Qty indicator - only in preview */}
            {!forPrint && qty > 1 && (
                <div style={{ textAlign: 'right', fontSize: 8, color: '#888', marginTop: 2 }}>
                    ×{qty}
                </div>
            )}
        </div>
    );
}

/**
 * Generates the full HTML for the print zone with all expanded labels.
 */
function buildLabelsHtml(items, format) {
    // Each entry in items is { product, qty } — expand qty copies
    const expanded = items.flatMap(({ product, qty }) =>
        Array.from({ length: qty }, (_, i) => ({ ...product, _key: `${product.id}-${i}` }))
    );

    const isA4 = format === 'a4';
    const labelWidthMm = format === '57mm' ? 44 : format === '80mm' ? 68 : 88;
    const labelHeightMm = format === '57mm' ? 28 : format === '80mm' ? 32 : 38;
    const barcodeH = format === '57mm' ? 35 : format === '80mm' ? 42 : 52;
    const barcodeW = format === '57mm' ? 1.2 : format === '80mm' ? 1.5 : 1.8;
    const columns = isA4 ? 2 : 1;

    const labelsHtml = expanded.map(p => {
        const barcodeValue = p.barcode || p.sku || String(p.id);
        const price = Number(p.price || 0).toLocaleString('es-AR');

        return `<div class="label">
  <div class="label-name">${escapeHtml(p.name)}</div>
  <div class="barcode-wrap"><svg class="barcode" data-barcode="${escapeHtml(barcodeValue)}" data-width="${barcodeW}" data-height="${barcodeH}"></svg></div>
  <div class="barcode-val">${escapeHtml(barcodeValue)}</div>
  <div class="price">$${price}</div>
</div>`;
    }).join('\n');

    const pageSize = isA4 ? 'a4' : `${format === '57mm' ? '50mm' : '74mm'} auto`;
    const containerWidth = isA4 ? '190mm' : `${format === '57mm' ? '46mm' : '70mm'}`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: ${pageSize}; margin: ${isA4 ? '5mm' : '2mm'}; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .container { width: ${containerWidth}; display: flex; flex-wrap: wrap; gap: 2mm; }
  .label {
    width: ${labelWidthMm}mm;
    height: ${labelHeightMm}mm;
    background: white;
    border: 0.3mm solid #aaa;
    border-radius: 1mm;
    padding: 1.5mm 2mm;
    page-break-inside: avoid;
    break-inside: avoid;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .label-name { font-size: 7pt; font-weight: 700; line-height: 1.2; max-height: 8mm; overflow: hidden; margin-bottom: 1mm; }
  .barcode-wrap { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; }
  .barcode-wrap svg { max-width: 100%; height: auto; }
  .barcode-val { font-size: 5pt; text-align: center; letter-spacing: 0.5px; color: #444; margin-bottom: 1mm; }
  .price { font-size: 12pt; font-weight: 900; text-align: center; border-top: 0.3mm solid #ddd; padding-top: 0.5mm; }
</style>
</head>
<body>
<div class="container">${labelsHtml}</div>
<script>
(function() {
  var els = document.querySelectorAll('svg[data-barcode]');
  function tryRender(attempt) {
    if (typeof JsBarcode === 'undefined') {
      if (attempt < 30) setTimeout(function() { tryRender(attempt + 1); }, 100);
      return;
    }
    els.forEach(function(svg) {
      try {
        JsBarcode(svg, svg.getAttribute('data-barcode'), {
          format: 'CODE128',
          width: parseFloat(svg.getAttribute('data-width')),
          height: parseFloat(svg.getAttribute('data-height')),
          margin: 2,
          displayValue: false,
          background: '#fff',
          lineColor: '#000',
        });
      } catch(e) {}
    });
  }
  tryRender(0);
})();
</script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js" onload="(function(){var els=document.querySelectorAll('svg[data-barcode]');els.forEach(function(svg){try{JsBarcode(svg,svg.getAttribute('data-barcode'),{format:'CODE128',width:parseFloat(svg.getAttribute('data-width')),height:parseFloat(svg.getAttribute('data-height')),margin:2,displayValue:false,background:'#fff',lineColor:'#000'});}catch(e){}});})()"></script>
</body>
</html>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ── Main modal ─────────────────────────────────────────────────────────── */

export default function BarcodeLabelModal({ isOpen, onClose, initialProducts = [] }) {
    const { isDark } = useTheme();

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // [{ product, qty }]
    const [format, setFormat] = useState(getStoredTicketFormat('80mm') === '57mm' ? '57mm' : '80mm');
    const [printing, setPrinting] = useState(false);
    const [printError, setPrintError] = useState(null);

    // Pre-populate with initialProducts
    useEffect(() => {
        if (!isOpen) return;
        if (initialProducts.length > 0) {
            setSelectedItems(initialProducts.map(p => ({ product: p, qty: 1 })));
        }
    }, [isOpen, initialProducts]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setSearchResults([]);
            setSelectedItems([]);
            setPrintError(null);
        }
    }, [isOpen]);

    // Search products via API
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await axios.get(route('products.index'), {
                    params: { search: search.trim(), status: 'active', page: 1 },
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                setSearchResults((data.items?.data || []).slice(0, 20));
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const addProduct = useCallback((product) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { product, qty: 1 }];
        });
        setSearch('');
        setSearchResults([]);
    }, []);

    const removeItem = useCallback((productId) => {
        setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
    }, []);

    const updateQty = useCallback((productId, delta) => {
        setSelectedItems(prev => prev.map(i => {
            if (i.product.id !== productId) return i;
            const newQty = Math.max(1, Math.min(99, i.qty + delta));
            return { ...i, qty: newQty };
        }));
    }, []);

    const setQtyDirect = useCallback((productId, value) => {
        const n = parseInt(value, 10);
        if (!isNaN(n) && n >= 1) {
            setSelectedItems(prev => prev.map(i =>
                i.product.id === productId ? { ...i, qty: Math.min(99, n) } : i
            ));
        }
    }, []);

    const totalLabels = selectedItems.reduce((s, i) => s + i.qty, 0);

    const handlePrint = async () => {
        if (selectedItems.length === 0) return;
        setPrinting(true);
        setPrintError(null);
        try {
            const html = buildLabelsHtml(selectedItems, format);
            const backend = getStoredPrintBackend();

            if (backend === 'browser' || format === 'a4') {
                openBrowserPrint(html, { delay: 600 });
            } else {
                // Use electron print server
                const { printHtmlWithElectron } = await import('@/lib/print');
                const result = await printHtmlWithElectron({ html, mode: format });
                if (!result.ok) {
                    // Fallback to browser
                    openBrowserPrint(html, { delay: 600 });
                }
            }
        } catch (err) {
            setPrintError(err?.message || 'Error al imprimir');
        } finally {
            setPrinting(false);
        }
    };

    if (!isOpen) return null;

    const cardBase = isDark ? 'bg-slate-900 border-slate-700/60 text-slate-200' : 'bg-white border-slate-200 text-slate-800';
    const inputBase = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${cardBase}`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <Tag size={18} className="text-violet-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base">Etiquetas de Código de Barras</h2>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Seleccioná productos y elegí el formato de impresión
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

                    {/* Left: product selector */}
                    <div className={`w-full md:w-80 shrink-0 flex flex-col border-b md:border-b-0 md:border-r ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        {/* Search */}
                        <div className="p-4 shrink-0">
                            <div className="relative">
                                <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className={`${inputBase} pl-9`}
                                />

                                {/* Dropdown results */}
                                {(searchResults.length > 0 || searching) && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-10 max-h-52 overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        {searching ? (
                                            <div className={`px-3 py-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Buscando...</div>
                                        ) : searchResults.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => addProduct(p)}
                                                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-800'}`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{p.name}</div>
                                                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {p.barcode || p.sku || `#${p.id}`} · ${Number(p.price || 0).toLocaleString('es-AR')}
                                                    </div>
                                                </div>
                                                <Plus size={14} className="shrink-0 text-violet-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected items list */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-0">
                            {selectedItems.length === 0 ? (
                                <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Buscá y agregá productos para generar etiquetas
                                </div>
                            ) : (
                                selectedItems.map(({ product, qty }) => (
                                    <div
                                        key={product.id}
                                        className={`flex items-center gap-2 p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs truncate">{product.name}</div>
                                            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {product.barcode || product.sku || `#${product.id}`}
                                            </div>
                                        </div>

                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => updateQty(product.id, -1)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                value={qty}
                                                onChange={e => setQtyDirect(product.id, e.target.value)}
                                                className={`w-9 text-center text-xs font-bold rounded-lg border py-0.5 outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                                            />
                                            <button
                                                onClick={() => updateQty(product.id, 1)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(product.id)}
                                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: preview */}
                    <div className="flex-1 flex flex-col min-h-0 min-w-0">
                        {/* Format selector */}
                        <div className={`px-4 py-3 border-b shrink-0 flex items-center gap-3 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Formato:</span>
                            <div className={`flex items-center p-0.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                {[
                                    { id: '57mm', label: '57 mm' },
                                    { id: '80mm', label: '80 mm' },
                                    { id: 'a4', label: 'A4' },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id)}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${format === f.id
                                            ? (isDark ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-violet-700 shadow-sm border border-violet-200')
                                            : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            {totalLabels > 0 && (
                                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-lg ${isDark ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
                                    {totalLabels} etiqueta{totalLabels !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Preview area */}
                        <div className={`flex-1 overflow-auto p-4 min-h-0 ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                            {selectedItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                                        <Tag size={28} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Las etiquetas aparecerán aquí
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {selectedItems.flatMap(({ product, qty }) =>
                                        Array.from({ length: qty }, (_, i) => (
                                            <BarcodeLabel
                                                key={`${product.id}-${i}`}
                                                product={product}
                                                qty={qty}
                                                format={format}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t shrink-0 flex items-center gap-3 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                    {printError && (
                        <span className="text-xs text-red-500 flex-1">{printError}</span>
                    )}
                    <div className="flex-1" />
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handlePrint}
                        disabled={selectedItems.length === 0 || printing}
                        className="text-white border-none shadow-md rounded-xl"
                        style={{ background: selectedItems.length === 0 ? undefined : 'linear-gradient(90deg, #7c3aed, #6d28d9)' }}
                    >
                        <Printer size={16} className="mr-2" />
                        {printing ? 'Imprimiendo...' : `Imprimir ${totalLabels > 0 ? totalLabels : ''} etiqueta${totalLabels !== 1 ? 's' : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
