'use client';

import { useState, useEffect } from 'react';
import { getOrdersAction, updateOrderStatusAction, getDeliveryAgentsAction, assignAgentToOrderAction } from '@/app/actions/admin';
import { Search, Filter, Truck, Loader2, User, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<'active' | 'history' | 'all'>('active');
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const fetchData = async () => {
        setLoading(true);
        const [ordersRes, agentsRes] = await Promise.all([
            getOrdersAction(page, 10, filter),
            getDeliveryAgentsAction()
        ]);

        if (ordersRes.success) {
            setOrders(ordersRes.orders || []);
            setPagination(ordersRes.pagination || { total: 0, pages: 1 });
        }
        if (agentsRes.success) setAgents(agentsRes.agents || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        const res = await updateOrderStatusAction(orderId, newStatus);
        if (res.success) fetchData();
        else alert('Failed to update status');
        setUpdatingOrderId(null);
    };

    const handleAgentAssign = async (orderId: string, agentId: string) => {
        setUpdatingOrderId(orderId);
        const res = await assignAgentToOrderAction(orderId, agentId);
        if (res.success) fetchData();
        else alert('Failed to assign agent');
        setUpdatingOrderId(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage);
        }
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

                {/* Stats / Counts could go here */}
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
                {/* Status Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-md self-start">
                    <button
                        onClick={() => { setFilter('active'); setPage(1); }}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${filter === 'active' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Active Tasks
                    </button>
                    <button
                        onClick={() => { setFilter('history'); setPage(1); }}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${filter === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => { setFilter('all'); setPage(1); }}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        All
                    </button>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter visible orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Loading orders...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-gray-100 border-dashed">
                            <Clock size={48} className="mx-auto mb-3 text-gray-200" />
                            <p className="text-gray-400 font-medium">No orders found in this view.</p>
                            <p className="text-xs text-gray-400 mt-1">Try changing the filter tab.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:border-gray-300 transition-colors">
                                <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-serif font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-50 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                            {order.trackingNumber && (
                                                <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                                                    <Truck size={12} /> {order.trackingNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-2xl font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</p>

                                        <div className="flex items-center gap-2">
                                            {updatingOrderId === order.id && <Loader2 className="animate-spin text-gray-400" size={16} />}

                                            {/* Status Dropdown */}
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updatingOrderId === order.id}
                                                className={`text-xs font-bold uppercase tracking-wide py-1.5 px-3 rounded-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-white text-gray-700 border-gray-200 hover:border-black'
                                                    }`}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1 space-y-6">
                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Customer Details</h4>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {order.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{order.user?.name || 'Guest'}</p>
                                                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                                                </div>
                                            </div>

                                            {order.deliveryAddress ? (
                                                <div className="bg-white p-3 rounded-md border border-gray-100 text-xs text-gray-600 leading-relaxed shadow-sm">
                                                    <p className="font-bold text-gray-900 mb-1">{order.deliveryAddress.tag || 'Address'}</p>
                                                    <p>{order.deliveryAddress.street}</p>
                                                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}</p>
                                                    <p className="mt-1 font-medium text-gray-900">Ph: {order.deliveryAddress.phone}</p>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400 italic">No address provided</div>
                                            )}
                                        </div>

                                        {/* Agent Assignment */}
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Logistics Partner</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                                    <User size={14} />
                                                </div>
                                                <select
                                                    value={order.deliveryAgentId || ''}
                                                    onChange={(e) => handleAgentAssign(order.id, e.target.value)}
                                                    disabled={updatingOrderId === order.id}
                                                    className="bg-white border hover:border-gray-300 text-sm rounded p-2 flex-1 focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="">Select Delivery Agent...</option>
                                                    {agents.map(agent => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.name} {agent.isAvailable ? '• Available' : '• Busy'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-[2] border-l border-gray-100 pl-8">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Order Summary</h4>
                                        <ul className="space-y-3">
                                            {order.items.map((item: any) => (
                                                <li key={item.id} className="flex items-center justify-between text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white border border-gray-100 rounded overflow-hidden shrink-0">
                                                            {item.product.images[0] && (
                                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-900 group-hover:text-black transition-colors">{item.product.name}</span>
                                                                <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-100 px-1 rounded">{item.product.gender}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Qty: {item.quantity} • {item.product.category?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-900 font-medium">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-900">
                                            <span>Total Amount</span>
                                            <span>₹{Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8 border-t border-gray-100">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Page {page} of {pagination.pages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.pages}
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        aria-label="Next Page"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
