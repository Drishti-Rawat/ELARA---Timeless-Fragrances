'use client';

import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CheckCircle, Navigation, LogOut, Truck, AlertTriangle, ChevronRight, Calendar, User } from 'lucide-react';
import { markAsOutForDelivery, completeDelivery, updateAgentProfileAction } from '@/app/actions/delivery';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Order = {
    id: string;
    status: string;
    total: string;
    deliveryAddress: any;
    user: {
        name: string | null;
        phone: string | null;
        email: string;
    };
    items: {
        quantity: number;
        product: {
            name: string;
            images: string[];
        };
    }[];
};

type AgentProfile = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    vehicleDetails: string | null;
} | null;

export default function DeliveryDashboard({ initialOrders, agentProfile }: { initialOrders: Order[], agentProfile: AgentProfile }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Profile Completion State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [phone, setPhone] = useState(agentProfile?.phone || '');
    const [vehicle, setVehicle] = useState(agentProfile?.vehicleDetails || '');

    const router = useRouter();

    const activeOrders = orders.filter(o => ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status));
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');

    useEffect(() => {
        if (agentProfile && !agentProfile.phone) {
            setShowProfileModal(true);
        }
    }, [agentProfile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateAgentProfileAction(phone, vehicle);
            if (res.success) {
                setShowProfileModal(false);
                router.refresh();
            }
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleStartDelivery = async (orderId: string) => {
        setLoading(true);
        try {
            const res = await markAsOutForDelivery(orderId);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'OUT_FOR_DELIVERY' } : o));
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setLoading(true);
        setError('');
        try {
            const res = await completeDelivery(selectedOrder.id, otp);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'DELIVERED' } : o));
                setSelectedOrder(null);
                setOtp('');
                router.refresh();
            } else {
                setError(res.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 font-sans pb-20">
            {/* Elegant Header Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="font-serif text-2xl text-[var(--color-foreground)] mb-1">
                            Hello, {agentProfile?.name || 'Agent'}
                        </h2>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary)] border border-gray-100">
                        <User size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 relative z-10">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">To Deliver</p>
                        <p className="text-3xl font-serif text-[var(--color-foreground)]">{activeOrders.length}</p>
                    </div>
                    <div className="border-l border-gray-100 pl-6">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Completed</p>
                        <p className="text-3xl font-serif text-[var(--color-foreground)]">{completedOrders.length}</p>
                    </div>
                    <div className="border-l border-gray-100 pl-6">
                        <p className="text-[10px] text-[var(--color-primary)] uppercase tracking-wider font-medium mb-1">Earnings</p>
                        <p className="text-3xl font-serif text-[var(--color-primary)]">₹{completedOrders.length * 50}</p>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-surface)] rounded-full -mr-16 -mt-16 opacity-50" />
            </motion.div>

            {/* Premium Tabs */}
            <div className="flex border-b border-gray-200 relative">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'active' ? 'text-[var(--color-foreground)]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Current Tasks
                    {activeTab === 'active' && (
                        <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-4 px-6 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'completed' ? 'text-[var(--color-foreground)]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    History
                    {activeTab === 'completed' && (
                        <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
                    )}
                </button>
            </div>

            {/* Order Cards List */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {(activeTab === 'active' ? activeOrders : completedOrders).length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <Package size={32} className="mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                            <p className="text-sm text-gray-400 font-medium">No orders found</p>
                        </motion.div>
                    )}

                    {(activeTab === 'active' ? activeOrders : completedOrders).map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white group overflow-hidden relative border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 rounded-lg"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-block w-2 h-2 rounded-full ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-500 animate-pulse' :
                                                    order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-amber-500'
                                                }`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <h3 className="font-serif text-lg text-[var(--color-foreground)]">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-serif text-lg text-[var(--color-foreground)]">₹{Number(order.total).toFixed(0)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{order.items.length} Items</p>
                                    </div>
                                </div>

                                {/* Customer & Address */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-gray-400 shrink-0">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--color-foreground)]">{order.user.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Customer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-gray-400 shrink-0">
                                            <MapPin size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {order.deliveryAddress?.street},<br />
                                                {order.deliveryAddress?.city} {order.deliveryAddress?.zip}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <a href={`tel:${order.deliveryAddress?.phone || order.user.phone}`}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-surface)] border border-transparent hover:border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 rounded transition-all">
                                        <Phone size={14} /> Call
                                    </a>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`)}`} target="_blank" rel="noreferrer"
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-surface)] border border-transparent hover:border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 rounded transition-all">
                                        <Navigation size={14} /> Map
                                    </a>
                                </div>

                                {/* Main Action Buttons */}
                                {activeTab === 'active' && (
                                    <div>
                                        {['PROCESSING', 'SHIPPED'].includes(order.status) && (
                                            <button
                                                onClick={() => handleStartDelivery(order.id)}
                                                disabled={loading}
                                                className="w-full bg-[var(--color-foreground)] text-white py-3.5 rounded font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-primary)] transition-colors flex items-center justify-center gap-2"
                                            >
                                                Start Delivery <Truck size={16} />
                                            </button>
                                        )}

                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-full bg-green-600 text-white py-3.5 rounded font-bold uppercase tracking-widest text-xs hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                Complete Delivery <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* OTP Verification Modal - Premium Glass */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-sm p-8 shadow-2xl relative border-t-4 border-[var(--color-primary)]"
                        >
                            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-300 hover:text-black transition-colors">
                                <LogOut size={20} className="rotate-180" />
                            </button>

                            <div className="text-center mb-10">
                                <h3 className="font-serif text-2xl text-[var(--color-foreground)] mb-2">Verification</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Enter OTP from customer</p>
                            </div>

                            <form onSubmit={handleCompleteDelivery} className="space-y-8">
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        pattern="\d{4}"
                                        maxLength={4}
                                        placeholder="0000"
                                        className="w-48 text-center text-4xl font-serif text-[var(--color-foreground)] tracking-[0.5em] py-2 border-b-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-transparent placeholder:text-gray-100"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-wide animate-pulse">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={otp.length !== 4 || loading}
                                    className="w-full bg-[var(--color-foreground)] text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Confirm Delivery'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm p-10 relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-[var(--color-primary)]" />
                        <h2 className="font-serif text-2xl mb-2">Setup Profile</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-8">Required to access dashboard</p>

                        <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5 focus-within:text-[var(--color-primary)] transition-colors">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full border-b border-gray-200 py-2 text-sm font-medium focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                    placeholder="+1 234 567 8900"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5 focus-within:text-[var(--color-primary)] transition-colors">Vehicle Details</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-2 text-sm font-medium focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                    placeholder="e.g. Blue Honda Bike (MH 12 AB 1234)"
                                    value={vehicle}
                                    onChange={e => setVehicle(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-[var(--color-foreground)] text-white py-4 mt-4 font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-primary)] transition-colors">
                                {loading ? 'Saving...' : 'Get Started'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
