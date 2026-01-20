'use client';

import { useState, useEffect } from 'react';
import { getOrdersAction, updateOrderStatusAction } from '@/app/actions/admin';
import { Search, Filter, Truck, Loader2 } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getOrdersAction();
        if (res.success) setOrders(res.orders || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        // We pass undefined for tracking number so backend keeps existing or auto-generates if needed
        const res = await updateOrderStatusAction(orderId, newStatus);

        if (res.success) {
            // Optimistically update local state or re-fetch
            fetchOrders();
        } else {
            alert('Failed to update status');
        }
        setUpdatingOrderId(null);
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
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
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                            {order.trackingNumber && (
                                                <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                                                    <Truck size={12} /> Tracking: {order.trackingNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-2xl font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>

                                        <div className="flex items-center gap-2">
                                            {updatingOrderId === order.id && <Loader2 className="animate-spin text-gray-400" size={16} />}
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updatingOrderId === order.id}
                                                className={`text-xs font-bold uppercase tracking-wide py-1 px-3 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500' :
                                                    order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-500' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500' :
                                                                'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500'
                                                    }`}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Customer & Delivery</h4>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {order.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                                <p className="text-xs text-gray-500">{order.user?.email}</p>
                                            </div>
                                        </div>

                                        {/* Delivery Address */}
                                        {order.deliveryAddress ? (
                                            <div className="text-xs text-gray-600 space-y-0.5 bg-white p-3 rounded border border-gray-100">
                                                <p className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                                                    <span className="opacity-50">📍</span> {order.deliveryAddress.tag}
                                                </p>
                                                <p>{order.deliveryAddress.street}</p>
                                                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}</p>
                                                <p>{order.deliveryAddress.country}</p>
                                                <p className="mt-1">Ph: {order.deliveryAddress.phone}</p>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 italic">No address provided</div>
                                        )}
                                    </div>
                                    <div className="flex-[2]">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Order Items</h4>
                                        <ul className="space-y-2">
                                            {order.items.map((item: any) => (
                                                <li key={item.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                                                            {item.product.images[0] && (
                                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-900">{item.product.name}</span>
                                                                <span className="text-[10px] uppercase font-bold text-gray-400 border px-1 rounded">{item.product.gender}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.quantity} x ${Number(item.price).toFixed(2)} • {item.product.category?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-900 font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
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
