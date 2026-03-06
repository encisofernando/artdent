import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: '',
        code: '',
        type: '',
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        phone_alt: '',
        address: '',
        city: '',
        province: '',
        cuit: '',
        iva_condition: '',
        license_number: '',
        credit_limit: '',
        payment_days: '',
        is_active: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dentists.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Dentist</h2>}
        >
            <Head title="Create Dentist" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                <div>
                            <label className="block font-medium text-sm text-gray-700">company_id</label>
                            <input type="text" value={data.company_id} onChange={e => setData('company_id', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.company_id && <div className="text-red-500 text-xs mt-1">{errors.company_id}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.code && <div className="text-red-500 text-xs mt-1">{errors.code}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">type</label>
                            <input type="text" value={data.type} onChange={e => setData('type', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.type && <div className="text-red-500 text-xs mt-1">{errors.type}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">contact_name</label>
                            <input type="text" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.contact_name && <div className="text-red-500 text-xs mt-1">{errors.contact_name}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">email</label>
                            <input type="text" value={data.email} onChange={e => setData('email', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">phone</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">phone_alt</label>
                            <input type="text" value={data.phone_alt} onChange={e => setData('phone_alt', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.phone_alt && <div className="text-red-500 text-xs mt-1">{errors.phone_alt}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">address</label>
                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">city</label>
                            <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">province</label>
                            <input type="text" value={data.province} onChange={e => setData('province', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.province && <div className="text-red-500 text-xs mt-1">{errors.province}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">cuit</label>
                            <input type="text" value={data.cuit} onChange={e => setData('cuit', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.cuit && <div className="text-red-500 text-xs mt-1">{errors.cuit}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">iva_condition</label>
                            <input type="text" value={data.iva_condition} onChange={e => setData('iva_condition', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.iva_condition && <div className="text-red-500 text-xs mt-1">{errors.iva_condition}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">license_number</label>
                            <input type="text" value={data.license_number} onChange={e => setData('license_number', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.license_number && <div className="text-red-500 text-xs mt-1">{errors.license_number}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">credit_limit</label>
                            <input type="text" value={data.credit_limit} onChange={e => setData('credit_limit', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.credit_limit && <div className="text-red-500 text-xs mt-1">{errors.credit_limit}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">payment_days</label>
                            <input type="text" value={data.payment_days} onChange={e => setData('payment_days', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.payment_days && <div className="text-red-500 text-xs mt-1">{errors.payment_days}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">is_active</label>
                            <input type="text" value={data.is_active} onChange={e => setData('is_active', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.is_active && <div className="text-red-500 text-xs mt-1">{errors.is_active}</div>}
                        </div>

                        <div>
                            <label className="block font-medium text-sm text-gray-700">notes</label>
                            <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" />
                            {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
                        </div>
                                
                                <div className="flex items-center gap-4">
                                    <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                        Save
                                    </button>
                                    <Link href={route('dentists.index')} className="text-gray-600 hover:text-gray-900">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}