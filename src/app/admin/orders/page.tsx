'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateInvoiceDataAction } from '@/app/actions/invoice';
import { downloadInvoiceHTML, InvoiceData } from '@/components/InvoiceButton';
import Loading from '@/components/Loading';
import { getOrdersAction, updateOrderStatusAction, getDeliveryAgentsAction, assignAgentToOrderAction } from '@/app/actions/admin';
import { Search, Truck, Loader2, User, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';

interface OrderItem {
    id: string;
    product: {
        id: string;
        name: string;
        images: string[];
        gender: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: string;
    createdAt: string | Date;
    trackingNumber?: string | null;
    total: number;
    subtotal?: number;
    discount: number;
    couponCode?: string | null;
    deliveryAddress?: {
        tag?: string | null;
        street: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    } | null;
    user?: {
        name?: string | null;
        email: string;
    } | null;
    items: OrderItem[];
    deliveryAgentId?: string | null;
}

interface DeliveryAgent {
    id: string;
    name: string;
    isAvailable: boolean;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [agents, setAgents] = useState<DeliveryAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<'active' | 'history' | 'all'>('active');
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [ordersRes, agentsRes] = await Promise.all([
                getOrdersAction(page, 10, filter),
                getDeliveryAgentsAction()
            ]);

            if (ordersRes.success && ordersRes.orders) {
                setOrders(ordersRes.orders as Order[]);
                setPagination(ordersRes.pagination || { total: 0, pages: 1 });
            }
            if (agentsRes.success && agentsRes.agents) {
                setAgents(agentsRes.agents as DeliveryAgent[]);
            }
        } catch (err) {
            console.error("Order Page Data Fetch Error:", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            const res = await updateOrderStatusAction(orderId, newStatus);
            if (res.success) {
                await fetchData(false);
            } else {
                alert(res.error || 'Failed to update status');
            }
        } catch {
            alert('An unexpected error occurred');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleAgentAssign = async (orderId: string, agentId: string) => {
        setUpdatingOrderId(orderId);
        try {
            const res = await assignAgentToOrderAction(orderId, agentId);
            if (res.success) {
                await fetchData(false);
            } else {
                alert(res.error || 'Failed to assign agent');
            }
        } catch {
            alert('An unexpected error occurred');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDownloadInvoice = async (orderId: string) => {
        setDownloadingInvoiceId(orderId);
        try {
            const res = await generateInvoiceDataAction(orderId);
            if (res.success && res.invoice) {
                downloadInvoiceHTML(res.invoice as InvoiceData);
            } else {
                alert(res.error || 'Failed to generate invoice');
            }
        } catch {
            alert('An unexpected error occurred');
        } finally {
            setDownloadingInvoiceId(null);
        }
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
                <Loading text="Loading orders..." fullScreen={false} />
            ) : (
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-surface rounded-sm border border-neutral-200 border-dashed">
                            <Clock size={48} className="mx-auto mb-4 text-neutral-300" />
                            <p className="text-neutral-500 font-serif text-lg">No orders found</p>
                            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Adjust filters to see results</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-sm border border-neutral-200 hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
                                {/* Order Header */}
                                <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row gap-6 justify-between items-start bg-surface/30">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-serif font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-primary/10 text-primary border border-primary/20'
                                                }`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-neutral-500 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                <span className="mx-2 text-neutral-300">|</span>
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                            {order.trackingNumber && (
                                                <p className="text-xs text-primary flex items-center gap-1.5 mt-1 font-medium">
                                                    <Truck size={12} /> {order.trackingNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-2xl font-serif font-bold text-foreground">₹{Number(order.total).toFixed(2)}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            {/* Invoice Button */}
                                            <button
                                                onClick={() => handleDownloadInvoice(order.id)}
                                                disabled={downloadingInvoiceId === order.id}
                                                className="h-9 px-3 border border-neutral-200 rounded-sm text-neutral-600 hover:text-primary hover:border-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white"
                                                title="Download Invoice"
                                            >
                                                {downloadingInvoiceId === order.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <FileText size={14} />
                                                )}
                                                <span className="hidden sm:inline">Invoice</span>
                                            </button>

                                            {/* Status Dropdown */}
                                            <div className="relative">
                                                {updatingOrderId === order.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                        <Loader2 className="animate-spin text-primary" size={16} />
                                                    </div>
                                                )}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="h-9 pl-3 pr-8 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest rounded-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-neutral-800 transition-colors"
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
                                </div>

                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Customer & Address */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Customer Details</h4>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface text-primary border border-neutral-100 flex items-center justify-center text-sm font-serif font-bold shrink-0">
                                                    {order.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground mb-0.5">{order.user?.name || 'Guest'}</p>
                                                    <p className="text-xs text-neutral-500 font-medium">{order.user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Delivery Address</h4>
                                            {order.deliveryAddress ? (
                                                <div className="text-sm text-neutral-600 leading-relaxed font-light">
                                                    <p className="font-bold text-foreground mb-1 uppercase text-xs tracking-wide">{order.deliveryAddress.tag || 'Address'}</p>
                                                    <p>{order.deliveryAddress.street}</p>
                                                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                                                    <p className="mb-2">{order.deliveryAddress.zip}</p>
                                                    <p className="text-xs font-medium text-neutral-400 flex items-center gap-2">
                                                        <User size={12} /> {order.deliveryAddress.phone}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-neutral-400 italic">No address provided</div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Logistics Partner</h4>
                                            <div className="flex gap-2">
                                                <select
                                                    value={order.deliveryAgentId || ''}
                                                    onChange={(e) => handleAgentAssign(order.id, e.target.value)}
                                                    disabled={updatingOrderId === order.id}
                                                    className="w-full p-2.5 bg-surface border border-neutral-200 text-xs font-medium rounded-sm focus:border-primary outline-none transition-all"
                                                >
                                                    <option value="">Select Delivery Agent...</option>
                                                    {agents.map(agent => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.name} {agent.isAvailable ? '(Available)' : '(Busy)'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="lg:col-span-2 border-l border-neutral-100 lg:pl-8">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Order Summary</h4>
                                        <div className="space-y-4 mb-6">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-start justify-between group">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-16 bg-surface rounded-sm overflow-hidden shrink-0 relative">
                                                            {item.product.images[0] ? (
                                                                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[8px]">NO IMG</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors font-serif">{item.product.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold uppercase text-neutral-400 border border-neutral-200 px-1.5 py-0.5 rounded-sm">{item.product.gender}</span>
                                                                <span className="text-xs text-neutral-500">Qty: {item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-surface p-4 rounded-sm space-y-2">
                                            <div className="flex justify-between text-xs text-neutral-500">
                                                <span>Subtotal</span>
                                                <span>₹{Number(order.subtotal || order.total).toFixed(2)}</span>
                                            </div>
                                            {order.discount > 0 && (
                                                <div className="flex justify-between text-xs text-primary">
                                                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                                    <span>-₹{Number(order.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-dashed border-neutral-200 flex justify-between text-sm font-bold text-foreground">
                                                <span>Grand Total</span>
                                                <span>₹{Number(order.total).toFixed(2)}</span>
                                            </div>
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
