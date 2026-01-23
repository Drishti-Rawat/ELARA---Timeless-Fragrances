'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCartAction, updateCartItemAction, placeOrderAction } from '../actions/shop';
import { getUserAddressesAction, addAddressAction, deleteAddressAction } from '../actions/address';
import { validateCouponAction } from '../actions/coupons';
import { getUserSessionAction } from '../actions/auth-custom';
import Navbar from '@/components/Navbar';
import { Loader2, Trash2, ArrowRight, ShoppingBag, CheckCircle2, MapPin, Plus, Home, Briefcase, User, Tag, Minus } from 'lucide-react';
import Loading from '@/components/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Address {
    id: string;
    tag: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: number;
        isOnSale: boolean;
        salePercentage: number | null;
        images: string[];
        category: {
            name: string;
        } | null;
    };
}

interface Cart {
    items: CartItem[];
}

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
}

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [processing, setProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [scrolledToAddress, setScrolledToAddress] = useState(false);

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        tag: 'Home',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: '',
        isDefault: false
    });
    const [addingAddress, setAddingAddress] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const loadData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        const session = await getUserSessionAction();
        if (session) {
            setUser({
                id: session.userId,
                email: session.email,
                name: session.name
            });
            const [cartRes, addrRes] = await Promise.all([
                getCartAction(),
                getUserAddressesAction()
            ]);

            if (cartRes.success && cartRes.cart) setCart(cartRes.cart as Cart);
            if (addrRes.success) {
                const fetchedAddresses = addrRes.addresses as Address[] || [];
                setAddresses(fetchedAddresses);
                // Select default or first address if available
                const defaultAddr = fetchedAddresses.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (fetchedAddresses.length > 0) setSelectedAddressId(fetchedAddresses[0].id);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => {
            await loadData(true);
        })();
    }, [loadData]);

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        await updateCartItemAction(itemId, newQty);
        window.dispatchEvent(new CustomEvent('cart-updated'));
        // Refresh cart only
        const res = await getCartAction();
        if (res.success && res.cart) setCart(res.cart as Cart);
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setAddingAddress(true);

        const res = await addAddressAction(newAddress);
        if (res.success) {
            // Refresh addresses
            const addrRes = await getUserAddressesAction();
            if (addrRes.success) {
                const updatedAddresses = addrRes.addresses as Address[] || [];
                setAddresses(updatedAddresses);
                const addedAddress = (res as { success: boolean, address?: Address }).address;
                if (addedAddress) setSelectedAddressId(addedAddress.id); // Select the new one
            }
            setShowAddressForm(false);
            // Reset form
            setNewAddress({ tag: 'Home', street: '', city: '', state: '', zip: '', country: 'India', phone: '', isDefault: false });
        } else {
            alert('Failed to add address');
        }
        setAddingAddress(false);
    };

    const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this address?')) return;
        await deleteAddressAction(id);

        const addrRes = await getUserAddressesAction();
        if (addrRes.success) {
            const updated = addrRes.addresses as Address[] || [];
            setAddresses(updated);
            if (selectedAddressId === id) {
                setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
            }
        }
    };

    const handlePlaceOrder = async () => {
        if (!cart || !user) return;
        if (!selectedAddressId) {
            alert("Please select a delivery address.");
            return;
        }

        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddr) return;

        setProcessing(true);

        const itemSubtotal = cart.items.reduce((sum: number, item) => {
            let price = Number(item.product.price);
            if (item.product.isOnSale && item.product.salePercentage) {
                price = price * (1 - item.product.salePercentage / 100);
            }
            return sum + (price * item.quantity);
        }, 0);
        const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
        const finalTotal = itemSubtotal - discountAmount;

        // Pass snapshot of address and coupon info
        const res = await placeOrderAction(
            finalTotal,
            cart.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                product: {
                    price: item.product.price,
                    isOnSale: item.product.isOnSale,
                    salePercentage: item.product.salePercentage,
                    name: item.product.name
                }
            })),
            selectedAddr,
            appliedCoupon?.code,
            itemSubtotal,
            discountAmount
        );

        if (res.success) {
            setOrderPlaced(true);
            setCart(null);
            setAppliedCoupon(null);
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } else {
            alert('Failed to place order. Please try again.');
        }
        setProcessing(false);
    };

    const handleApplyCoupon = async () => {
        if (!cart) return;
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setValidatingCoupon(true);
        setCouponError('');

        const itemSubtotal = cart.items.reduce((sum: number, item) => {
            let price = Number(item.product.price);
            if (item.product.isOnSale && item.product.salePercentage) {
                price = price * (1 - item.product.salePercentage / 100);
            }
            return sum + (price * item.quantity);
        }, 0);
        const res = await validateCouponAction(couponCode, itemSubtotal, cart.items);

        if (res.success && res.coupon) {
            setAppliedCoupon(res.coupon);
            setCouponError('');
        } else {
            setCouponError(res.error || 'Invalid coupon');
            setAppliedCoupon(null);
        }

        setValidatingCoupon(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    if (loading) return <Loading text="Preparing Shopping Bag..." />;

    if (!user) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <div className="pt-32 pb-20 px-4 text-center">
                    <h2 className="text-3xl font-serif mb-4 text-foreground">Your Selection</h2>
                    <p className="text-neutral-500 mb-8 font-light">Please sign in to view your bag.</p>
                    <Link href="/login" className="inline-block bg-foreground text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary transition-colors">
                        Enter
                    </Link>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <div className="pt-32 pb-20 px-4 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-white border border-primary/30 rounded-full flex items-center justify-center text-primary mb-8 shadow-xl"
                    >
                        <CheckCircle2 size={32} />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Order Placed</h1>
                    <p className="text-neutral-500 max-w-md mx-auto mb-10 leading-relaxed font-light">
                        Thank you for your purchase. We have received your order and are preparing it with care.
                    </p>
                    <Link href="/shop" className="inline-block bg-foreground text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-surface flex flex-col">
                <Navbar />
                <div className="grow flex flex-col items-center justify-center px-4 text-center pt-24 pb-12">
                    <div className="w-20 h-20 bg-white border border-dashed border-neutral-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <ShoppingBag size={32} className="text-neutral-300" />
                    </div>
                    <h2 className="text-3xl font-serif mb-3 text-foreground">Your bag is empty</h2>
                    <p className="text-neutral-500 mb-8 max-w-sm font-light leading-relaxed">
                        Explore our fragrances and add your favorites to your collection.
                    </p>
                    <Link href="/shop" className="inline-block bg-foreground text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary transition-colors">
                        Discover Scents
                    </Link>
                </div>
            </div>
        );
    }

    const currentSubtotal = cart.items.reduce((sum: number, item) => {
        let price = Number(item.product.price);
        if (item.product.isOnSale && item.product.salePercentage) {
            price = price * (1 - item.product.salePercentage / 100);
        }
        return sum + (price * item.quantity);
    }, 0);
    const shippingCost: number = 0; // Free shipping
    const currentTotal = currentSubtotal + shippingCost;

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    const scrollToAddress = () => {
        const el = document.getElementById('address-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Highlight effect
            setScrolledToAddress(true);
            setTimeout(() => setScrolledToAddress(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <div className="pt-32 pb-12 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Shopping Bag</p>
                            <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
                                Your Selection
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400 text-sm">
                            <span className="font-serif italic text-foreground">{cart.items.length}</span>
                            <span>Items</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20">

                    {/* Left Column: Address + Items */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Address Section - NOW FIRST */}
                        <section id="address-section" className={`transition-all duration-500 ${scrolledToAddress ? 'ring-2 ring-primary p-2 rounded-sm' : ''}`}>
                            <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center text-xs font-bold">1</span>
                                Delivery Address
                            </h2>

                            {/* Address List */}
                            {!showAddressForm && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-3 border rounded-sm cursor-pointer transition-all relative group bg-white hover:shadow-sm ${selectedAddressId === addr.id ? 'border-primary ring-1 ring-primary bg-surface' : 'border-neutral-200 hover:border-primary/50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    {addr.tag === 'Home' && <Home size={12} className={selectedAddressId === addr.id ? "text-primary" : "text-neutral-400"} />}
                                                    {addr.tag === 'Work' && <Briefcase size={12} className={selectedAddressId === addr.id ? "text-primary" : "text-neutral-400"} />}
                                                    {addr.tag === 'Other' && <User size={12} className={selectedAddressId === addr.id ? "text-primary" : "text-neutral-400"} />}
                                                    <span className={`font-bold text-[10px] uppercase tracking-wide ${selectedAddressId === addr.id ? "text-primary" : "text-neutral-500"}`}>{addr.tag}</span>
                                                </div>
                                                <button onClick={(e) => handleDeleteAddress(addr.id, e)} className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-foreground font-medium leading-snug mb-0.5 line-clamp-1">{addr.street}</p>
                                            <p className="text-[10px] text-neutral-500 leading-snug font-light mb-2">{addr.city}, {addr.zip}</p>
                                            <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1"><User size={8} /> {addr.phone}</p>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="min-h-[100px] border border-dashed border-neutral-300 rounded-sm flex flex-col items-center justify-center text-neutral-400 hover:text-primary hover:border-primary hover:bg-white transition-all group gap-2 p-4"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                            <Plus size={16} className="group-hover:text-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">Add New</span>
                                    </button>
                                </div>
                            )}

                            {/* Add Address Form */}
                            {showAddressForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-white p-5 rounded-sm border border-neutral-200 shadow-sm"
                                >
                                    <h3 className="font-serif text-base mb-4 text-foreground">New Address</h3>
                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Label</label>
                                                <div className="relative">
                                                    <select
                                                        value={newAddress.tag}
                                                        onChange={e => setNewAddress({ ...newAddress, tag: e.target.value })}
                                                        className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none appearance-none bg-white font-medium"
                                                    >
                                                        <option value="Home">Home</option>
                                                        <option value="Work">Work</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                        <ArrowRight size={12} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Phone</label>
                                                <input required type="tel" placeholder="Mobile" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none"
                                                    value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Street Address</label>
                                            <input required type="text" placeholder="Address Details" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none"
                                                value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input required type="text" placeholder="City" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none"
                                                    value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                            </div>
                                            <div>
                                                <input required type="text" placeholder="Zip Code" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none"
                                                    value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input required type="text" placeholder="State" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs focus:border-primary outline-none"
                                                    value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                            </div>
                                            <div>
                                                <input disabled type="text" value="India" className="w-full p-2.5 border border-neutral-200 rounded-sm text-xs bg-neutral-50 text-neutral-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="def" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                    className="w-3.5 h-3.5 border-neutral-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="def" className="text-xs text-neutral-600 font-light cursor-pointer">Default</label>
                                            </div>

                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setShowAddressForm(false)} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 text-neutral-500 transition-colors">Cancel</button>
                                                <button type="submit" disabled={addingAddress} className="px-4 py-2 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary disabled:opacity-50 transition-colors rounded-sm">
                                                    {addingAddress ? '...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </section>

                        {/* Cart Items - NOW SECOND */}
                        <section>
                            <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-neutral-100 text-foreground flex items-center justify-center text-xs font-bold">2</span>
                                Review Items ({cart.items.length})
                            </h2>
                            <div className="space-y-8">
                                <AnimatePresence>
                                    {cart.items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="flex gap-6 md:gap-8 bg-white p-6 rounded-sm border border-neutral-100 shadow-sm"
                                        >
                                            <div className="w-24 h-32 md:w-32 md:h-40 bg-surface-highlight shrink-0 overflow-hidden relative">
                                                {item.product.images[0] && (
                                                    <Image
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">{item.product.category?.name}</p>
                                                        <Link href={`./shop/${item.product.id}`} className="hover:text-primary transition-colors">
                                                            <h3 className="font-serif text-xl text-foreground">{item.product.name}</h3>
                                                        </Link>
                                                    </div>
                                                    <div className="text-right">
                                                        {item.product.isOnSale && item.product.salePercentage ? (
                                                            <>
                                                                <p className="font-medium text-red-700 font-serif text-lg">₹{(Number(item.product.price) * (1 - item.product.salePercentage / 100) * item.quantity).toFixed(2)}</p>
                                                                <p className="text-xs text-neutral-400 line-through">₹{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                                                            </>
                                                        ) : (
                                                            <p className="font-medium text-foreground font-serif text-lg">₹{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                                                    <div className="flex items-center border border-neutral-200 rounded-sm">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-500 disabled:opacity-30 transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-500 transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => handleUpdateQuantity(item.id, 0)} className="text-neutral-300 hover:text-red-500 transition-colors p-2" title="Remove Item">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary & Payment */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-sm sticky top-28 border border-neutral-100 shadow-sm">
                            <h3 className="font-serif text-2xl mb-8 text-foreground">Order Summary</h3>

                            {/* Shipping To Preview */}
                            <div className="mb-8">
                                <div className="flex justify-between items-baseline mb-3">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Shipping To</label>
                                    <button
                                        onClick={scrollToAddress}
                                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>

                                {selectedAddress ? (
                                    <div className="p-4 border border-neutral-200 rounded-sm bg-surface/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            {selectedAddress.tag === 'Home' && <Home size={12} className="text-primary" />}
                                            {selectedAddress.tag === 'Work' && <Briefcase size={12} className="text-primary" />}
                                            {selectedAddress.tag === 'Other' && <User size={12} className="text-primary" />}
                                            <span className="font-bold text-xs uppercase text-foreground">{selectedAddress.tag}</span>
                                        </div>
                                        <p className="text-sm text-neutral-600 mb-0.5 line-clamp-1">{selectedAddress.street}</p>
                                        <p className="text-xs text-neutral-400">{selectedAddress.city}, {selectedAddress.zip}</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={scrollToAddress}
                                        className="w-full py-3 border border-dashed border-red-300 bg-red-50 text-red-500 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <MapPin size={14} /> Select Address
                                    </button>
                                )}
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-8">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Promo Code</label>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="w-full pl-9 pr-3 py-3 border border-neutral-200 rounded-sm text-sm focus:border-primary outline-none placeholder:font-light"
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon || !couponCode.trim()}
                                            className="px-5 py-3 bg-surface text-foreground border border-neutral-200 rounded-sm text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
                                        >
                                            {validatingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-surface/50 border border-primary/30 rounded-sm p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-primary mb-1">{appliedCoupon.code} Applied</p>
                                            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
                                                Savings: ₹{appliedCoupon.discount.toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><CheckCircle2 size={10} className="rotate-45" /> {couponError}</p>
                                )}
                            </div>

                            {/* Payment Summary */}
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-neutral-600 text-sm font-light">
                                    <span>Subtotal</span>
                                    <span>₹{currentSubtotal.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-primary text-sm">
                                        <span>Discount</span>
                                        <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-600 text-sm font-light">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'Complimentary' : `₹${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="h-px bg-neutral-100 my-4" />
                                <div className="flex justify-between font-serif text-xl text-foreground">
                                    <span>Total</span>
                                    <span>₹{(currentTotal - (appliedCoupon?.discount || 0)).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-8 p-4 border border-neutral-200 rounded-sm bg-surface/30">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="mt-1">
                                        <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-foreground text-sm uppercase tracking-wide mb-1">Cash on Delivery</span>
                                        <span className="block text-xs text-neutral-500 font-light">Pay comfortably upon receipt.</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="w-full bg-foreground text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group shadow-lg shadow-neutral-200"
                            >
                                {processing ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>Complete Order <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale">
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" width={24} height={16} className="h-4 w-auto" />
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/1200px-Visa.svg.png" alt="Visa" width={32} height={12} className="h-3 w-auto" />
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" width={48} height={12} className="h-3 w-auto" />
                            </div>

                            <p className="text-[10px] text-neutral-400 text-center mt-6 font-light">
                                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
