'use client';

import { useState, useEffect } from 'react';
import { getOrdersAction } from '@/app/actions/admin';
import { Search, Filter } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const res = await getOrdersAction();
            if (res.success) setOrders(res.orders || []);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Orders</h2>
                    <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading orders...</div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No orders found.</div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:border-gray-300 transition-colors">
                                <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-serif font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">{order.items.length} items</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Customer Details</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                                {order.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                                <p className="text-xs text-gray-500">{order.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-[2]">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Order Items</h4>
                                        <ul className="space-y-2">
                                            {order.items.map((item: any) => (
                                                <li key={item.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                                                        <span className="text-gray-600">{item.product.name}</span>
                                                    </div>
                                                    <span className="text-gray-900 font-medium">${Number(item.price).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
