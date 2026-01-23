'use client';

import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CheckCircle, Navigation, LogOut, Truck, User } from 'lucide-react';
import { markAsOutForDelivery, completeDelivery, updateAgentProfileAction } from '@/app/actions/delivery';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Order = {
    id: string;
    status: string;
    total: string;
    deliveryAddress: {
        tag: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
    } | null;
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
        } catch {
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
        } catch {
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
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface pb-20 font-sans text-foreground">
            {/* Header Section */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-neutral-100 mb-8">
                <div className="max-w-xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-1">Logistics Portal</span>
                            <h1 className="font-serif text-2xl text-foreground">
                                Hello, {agentProfile?.name?.split(' ')[0] || 'Agent'}
                            </h1>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface border border-neutral-200 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-6 space-y-8">

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-sm border border-neutral-100 shadow-sm text-center">
                        <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Pending</span>
                        <span className="font-serif text-3xl block text-foreground">{activeOrders.length}</span>
                    </div>
                    <div className="p-4 bg-white rounded-sm border border-neutral-100 shadow-sm text-center">
                        <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Done</span>
                        <span className="font-serif text-3xl block text-foreground">{completedOrders.length}</span>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-sm border border-primary/20 shadow-sm text-center">
                        <span className="block text-[10px] uppercase tracking-widest text-primary mb-2">Earned</span>
                        <span className="font-serif text-3xl block text-primary">₹{completedOrders.length * 50}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 pb-4 text-xs font-bold uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'active' ? 'text-foreground' : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        Active Tasks
                        {activeTab === 'active' && (
                            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 pb-4 text-xs font-bold uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'completed' ? 'text-foreground' : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        History
                        {activeTab === 'completed' && (
                            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Order List */}
                <AnimatePresence mode="popLayout">
                    {(activeTab === 'active' ? activeOrders : completedOrders).length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-20 opacity-50"
                        >
                            <Package size={48} strokeWidth={1} className="mx-auto mb-4 text-neutral-300" />
                            <p className="font-serif text-lg text-neutral-400">No shipments found</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {(activeTab === 'active' ? activeOrders : completedOrders).map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-6 rounded-sm border border-neutral-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-500 animate-pulse' : order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-primary'}`} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <h3 className="font-serif text-xl">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-serif text-lg block">₹{Number(order.total).toFixed(0)}</span>
                                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{order.items.length} ITEM{order.items.length !== 1 && 'S'}</span>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="space-y-4 border-t border-neutral-50 pt-4 mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-neutral-400 shrink-0 mt-1">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{order.user.name}</p>
                                                <p className="text-xs text-neutral-400">Customer</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-neutral-400 shrink-0 mt-1">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-neutral-600 leading-relaxed">
                                                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                                                </p>
                                                <p className="text-xs text-neutral-400">{order.deliveryAddress?.zip}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <a href={`tel:${order.deliveryAddress?.phone || order.user.phone}`} className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 hover:bg-neutral-50 transition-colors rounded-sm text-neutral-600">
                                            <Phone size={14} /> Call
                                        </a>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 hover:bg-neutral-50 transition-colors rounded-sm text-neutral-600">
                                            <Navigation size={14} /> Navigate
                                        </a>
                                    </div>

                                    {/* Primary Action Button */}
                                    {activeTab === 'active' && (
                                        <>
                                            {['PROCESSING', 'SHIPPED'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleStartDelivery(order.id)}
                                                    disabled={loading}
                                                    className="w-full bg-foreground text-surface py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors flex items-center justify-center gap-2 rounded-sm"
                                                >
                                                    {loading ? 'Updating...' : 'Start Delivery'} <Truck size={14} />
                                                </button>
                                            )}
                                            {order.status === 'OUT_FOR_DELIVERY' && (
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="w-full bg-green-700 text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-green-600 transition-colors flex items-center justify-center gap-2 rounded-sm"
                                                >
                                                    Complete Delivery <CheckCircle size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* OTP Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface w-full max-w-sm p-8 rounded-sm shadow-2xl overflow-hidden relative"
                        >
                            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-foreground transition-colors">
                                <LogOut size={20} className="rotate-180" />
                            </button>

                            <div className="text-center mb-8">
                                <h3 className="font-serif text-2xl mb-1">Verify Delivery</h3>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Ask customer for the PIN</p>
                            </div>

                            <form onSubmit={handleCompleteDelivery} className="flex flex-col items-center">
                                <input
                                    type="text"
                                    pattern="\d{4}"
                                    maxLength={4}
                                    placeholder="0 0 0 0"
                                    className="w-48 text-center text-4xl font-serif tracking-[0.4em] py-2 bg-transparent border-b border-neutral-300 focus:border-primary focus:outline-none transition-colors mb-2 text-foreground placeholder:text-neutral-200"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                                {error && <p className="text-red-500 text-xs mt-2 animate-bounce">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={otp.length !== 4 || loading}
                                    className="w-full mt-8 bg-foreground text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50 rounded-sm"
                                >
                                    {loading ? 'Verifying...' : 'Confirm'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Setup Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-sm p-8 rounded-sm text-center"
                        >
                            <User size={48} className="mx-auto text-primary mb-4" strokeWidth={1} />
                            <h2 className="font-serif text-2xl mb-2">Complete Profile</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-8">
                                One-time setup
                            </p>

                            <form onSubmit={handleSaveProfile} className="space-y-6 text-left">
                                <div>
                                    <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-transparent border-b border-neutral-200 pb-2 font-serif text-lg focus:outline-none focus:border-primary transition-colors placeholder:text-neutral-300"
                                        placeholder="+91..."
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-2">Vehicle Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-transparent border-b border-neutral-200 pb-2 font-serif text-lg focus:outline-none focus:border-primary transition-colors placeholder:text-neutral-300"
                                        placeholder="MH 02 ..."
                                        value={vehicle}
                                        onChange={e => setVehicle(e.target.value)}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-foreground text-white py-4 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors rounded-sm">
                                    {loading ? 'Saving...' : 'Start Dashboard'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
