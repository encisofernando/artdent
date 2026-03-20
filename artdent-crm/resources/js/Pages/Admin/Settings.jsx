import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Settings({ company }) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name || '',
        fantasy_name: company.fantasy_name || '',
        cuit: company.cuit || '',
        email: company.email || '',
        phone: company.phone || '',
        whatsapp_phone_number_id: company.whatsapp_phone_number_id || '',
        whatsapp_access_token: company.whatsapp_access_token || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configuración de la Empresa" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg max-w-3xl">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-xl font-semibold mb-6">Configuración de la Empresa</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Razón Social</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre de Fantasía</label>
                                        <input
                                            type="text"
                                            value={data.fantasy_name}
                                            onChange={e => setData('fantasy_name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CUIT</label>
                                        <input
                                            type="text"
                                            value={data.cuit}
                                            onChange={e => setData('cuit', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Integración WhatsApp Cloud API</h3>
                                    <p className="text-sm text-gray-500 mb-6">Configura tus credenciales de Meta for Developers para enviar notificaciones automáticas BSUID a clientes.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number ID</label>
                                            <input
                                                type="text"
                                                value={data.whatsapp_phone_number_id}
                                                onChange={e => setData('whatsapp_phone_number_id', e.target.value)}
                                                placeholder="Ej: 104598...23"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.whatsapp_phone_number_id && <div className="text-red-600 text-sm mt-1">{errors.whatsapp_phone_number_id}</div>}
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Access Token (Permanente)</label>
                                            <input
                                                type="password"
                                                value={data.whatsapp_access_token}
                                                onChange={e => setData('whatsapp_access_token', e.target.value)}
                                                placeholder="EAAMb..."
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.whatsapp_access_token && <div className="text-red-600 text-sm mt-1">{errors.whatsapp_access_token}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Guardar Configuración'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
