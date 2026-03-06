import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Info, Package, DollarSign } from 'lucide-react';

export default function Edit({ auth, item }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        short_description: item.short_description || '',
        cost_price: item.cost_price || '',
        price: item.price || '',
        is_active: item.is_active !== undefined ? item.is_active : 1,
        track_stock: item.track_stock !== undefined ? item.track_stock : 1,
        stock_quantity: item.stocks && item.stocks.length > 0 ? item.stocks[0].quantity : '',
        images: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Since Laravel does not support multipart/form-data with PUT method, 
        // we use POST and specify _method=PUT to simulate a PUT request.
        post(route('products.update', item.id), {
            forceFormData: true,
            _method: 'put'
        });
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Producto - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Producto
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando detalles de <strong>{item.name}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('products.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Info size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Información General
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre del Producto *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Resina Compuesta A2"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Descripción Corta</label>
                                <textarea
                                    value={data.short_description}
                                    onChange={e => setData('short_description', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Breve descripción para listados..."
                                    rows="2"
                                />
                                {errors.short_description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.short_description}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Info size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Imágenes del Producto
                            </h2>
                        </div>

                        {item.product_images && item.product_images.length > 0 && (
                            <div className="mb-6">
                                <label className={labelClasses}>Imágenes Actuales</label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {item.product_images.map((img) => (
                                        <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <img src={img.url} className="w-full h-full object-cover" />
                                            {img.is_cover ? (
                                                <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[9px] font-bold text-center py-0.5">
                                                    PORTADA
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={labelClasses}>Subir Nuevas Imágenes</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => setData('images', Array.from(e.target.files))}
                                className={`w-full text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                                    ${isDark ? 'text-slate-300 file:bg-slate-800 file:text-teal-400' : 'text-slate-600'}
                                `}
                            />
                            {errors['images.0'] && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors['images.0']}</div>}
                            <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Las nuevas imágenes se añadirán a las existentes. Puedes seleccionar múltiples a la vez.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inventario Section */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
                                <Package size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Inventario y Códigos
                                </h2>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className={labelClasses}>SKU (Código Interno)</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Ej. ART-001"
                                    />
                                    {errors.sku && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.sku}</div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Código de Barras</label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={e => setData('barcode', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Ej. 7791234567890"
                                    />
                                    {errors.barcode && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.barcode}</div>}
                                </div>

                                {/* Stock Tracking Toggle */}
                                <div className="flex items-center mt-2">
                                    <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.track_stock === 1 || data.track_stock === true}
                                                onChange={e => setData('track_stock', e.target.checked ? 1 : 0)}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${(data.track_stock === 1 || data.track_stock === true)
                                                ? 'bg-blue-500'
                                                : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                                }`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.track_stock === 1 || data.track_stock === true) ? 'transform translate-x-4' : ''
                                                }`}></div>
                                        </div>
                                        <div className="ml-3 font-medium text-sm">
                                            Llevar Control de Stock
                                        </div>
                                    </label>
                                </div>

                                {/* Stock Manual Adjust */}
                                {(data.track_stock === 1 || data.track_stock === true) && (
                                    <div>
                                        <label className={labelClasses}>Stock Actual en Almacén</label>
                                        <input
                                            type="number"
                                            value={data.stock_quantity}
                                            onChange={e => setData('stock_quantity', e.target.value)}
                                            className={inputClasses}
                                            placeholder="Cantidad en almacén actual..."
                                        />
                                        {errors.stock_quantity && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.stock_quantity}</div>}
                                    </div>
                                )}

                                {/* Active Toggle */}
                                <div className="flex items-center mt-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.is_active === 1 || data.is_active === true}
                                                onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true)
                                                ? 'bg-emerald-500'
                                                : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                                }`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'transform translate-x-4' : ''
                                                }`}></div>
                                        </div>
                                        <div className="ml-3 font-medium text-sm">
                                            Producto Activo en Catálogo
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Precios Section */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
                                <DollarSign size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Precios
                                </h2>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className={labelClasses}>Precio de Venta (Público) *</label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold
                                            ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                        `}>
                                            $
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            className={`${inputClasses} pl-8 font-bold text-lg`}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.price && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.price}</div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Precio de Costo</label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold
                                            ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                        `}>
                                            $
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.cost_price}
                                            onChange={e => setData('cost_price', e.target.value)}
                                            className={`${inputClasses} pl-8`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.cost_price && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.cost_price}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('products.index')}>
                            <Button
                                type="button"
                                variant="outline"
                                className={isDark ? "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800" : ""}
                            >
                                Cancelar
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save className="mr-2" size={16} />
                            Actualizar Producto
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}