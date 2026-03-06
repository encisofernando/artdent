import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, items }) {
    // Note: ensure your controller passes 'ecommerce-orders' data as 'items' paginator or array.
    // If it passes ecommerce-orders, change `items` prop above to match!
    const data = items?.data || items || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">EcommerceOrder List</h2>}
        >
            <Head title="EcommerceOrder List" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <Link href={route('ecommerce-orders.create')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Create EcommerceOrder
                        </Link>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">company_id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">customer_id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">coupon_id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">shipping_method_id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">order_number</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.company_id }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.customer_id }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.coupon_id }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.shipping_method_id }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.order_number }</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('ecommerce-orders.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                                                {/* Implement delete with Inertia link method="delete" if needed */}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan="100%" className="text-center py-4 text-gray-500">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}