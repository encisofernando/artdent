import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, item }) {
    const { data, setData, put, processing, errors } = useForm({
        company_id: item.company_id || '',
        customer_id: item.customer_id || '',
        coupon_id: item.coupon_id || '',
        shipping_method_id: item.shipping_method_id || '',
        order_number: item.order_number || '',
        status: item.status || '',
        payment_status: item.payment_status || '',
        subtotal: item.subtotal || '',
        discount_amount: item.discount_amount || '',
        shipping_cost: item.shipping_cost || '',
        tax_amount: item.tax_amount || '',
        total: item.total || '',
        shipping_name: item.shipping_name || '',
        shipping_address: item.shipping_address || '',
        shipping_city: item.shipping_city || '',
        shipping_province: item.shipping_province || '',
        shipping_postal: item.shipping_postal || '',
        shipping_phone: item.shipping_phone || '',
        customer_notes: item.customer_notes || '',
        admin_notes: item.admin_notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('ecommerce-orders.update', item.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit EcommerceOrder</h2>}
        >
            <Head title="Edit EcommerceOrder" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                <div>
                            <label className="block font-medium text-sm text-gray-700">company_id</label>
                            <input type="text" value={data.company_id || ''} onChange={e => setData('company_id', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.company_id && <div className="text-red-500 text-xs mt-1">{errors.company_id}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">customer_id</label>
                            <input type="text" value={data.customer_id || ''} onChange={e => setData('customer_id', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.customer_id && <div className="text-red-500 text-xs mt-1">{errors.customer_id}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">coupon_id</label>
                            <input type="text" value={data.coupon_id || ''} onChange={e => setData('coupon_id', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.coupon_id && <div className="text-red-500 text-xs mt-1">{errors.coupon_id}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_method_id</label>
                            <input type="text" value={data.shipping_method_id || ''} onChange={e => setData('shipping_method_id', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_method_id && <div className="text-red-500 text-xs mt-1">{errors.shipping_method_id}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">order_number</label>
                            <input type="text" value={data.order_number || ''} onChange={e => setData('order_number', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.order_number && <div className="text-red-500 text-xs mt-1">{errors.order_number}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">status</label>
                            <input type="text" value={data.status || ''} onChange={e => setData('status', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">payment_status</label>
                            <input type="text" value={data.payment_status || ''} onChange={e => setData('payment_status', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.payment_status && <div className="text-red-500 text-xs mt-1">{errors.payment_status}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">subtotal</label>
                            <input type="text" value={data.subtotal || ''} onChange={e => setData('subtotal', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.subtotal && <div className="text-red-500 text-xs mt-1">{errors.subtotal}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">discount_amount</label>
                            <input type="text" value={data.discount_amount || ''} onChange={e => setData('discount_amount', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.discount_amount && <div className="text-red-500 text-xs mt-1">{errors.discount_amount}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_cost</label>
                            <input type="text" value={data.shipping_cost || ''} onChange={e => setData('shipping_cost', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_cost && <div className="text-red-500 text-xs mt-1">{errors.shipping_cost}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">tax_amount</label>
                            <input type="text" value={data.tax_amount || ''} onChange={e => setData('tax_amount', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.tax_amount && <div className="text-red-500 text-xs mt-1">{errors.tax_amount}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">total</label>
                            <input type="text" value={data.total || ''} onChange={e => setData('total', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.total && <div className="text-red-500 text-xs mt-1">{errors.total}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_name</label>
                            <input type="text" value={data.shipping_name || ''} onChange={e => setData('shipping_name', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_name && <div className="text-red-500 text-xs mt-1">{errors.shipping_name}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_address</label>
                            <input type="text" value={data.shipping_address || ''} onChange={e => setData('shipping_address', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_address && <div className="text-red-500 text-xs mt-1">{errors.shipping_address}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_city</label>
                            <input type="text" value={data.shipping_city || ''} onChange={e => setData('shipping_city', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_city && <div className="text-red-500 text-xs mt-1">{errors.shipping_city}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_province</label>
                            <input type="text" value={data.shipping_province || ''} onChange={e => setData('shipping_province', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_province && <div className="text-red-500 text-xs mt-1">{errors.shipping_province}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_postal</label>
                            <input type="text" value={data.shipping_postal || ''} onChange={e => setData('shipping_postal', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_postal && <div className="text-red-500 text-xs mt-1">{errors.shipping_postal}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">shipping_phone</label>
                            <input type="text" value={data.shipping_phone || ''} onChange={e => setData('shipping_phone', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.shipping_phone && <div className="text-red-500 text-xs mt-1">{errors.shipping_phone}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">customer_notes</label>
                            <input type="text" value={data.customer_notes || ''} onChange={e => setData('customer_notes', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.customer_notes && <div className="text-red-500 text-xs mt-1">{errors.customer_notes}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">admin_notes</label>
                            <input type="text" value={data.admin_notes || ''} onChange={e => setData('admin_notes', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.admin_notes && <div className="text-red-500 text-xs mt-1">{errors.admin_notes}</div>}
                        </div>
                                
                                <div className="flex items-center gap-4">
                                    <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                        Update
                                    </button>
                                    <Link href={route('ecommerce-orders.index')} className="text-gray-600 hover:text-gray-900">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}