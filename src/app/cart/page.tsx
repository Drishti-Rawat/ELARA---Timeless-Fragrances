'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCartAction, updateCartItemAction, placeOrderAction } from '../actions/shop';
import { getUserAddressesAction, addAddressAction, deleteAddressAction } from '../actions/address';
import { getUserSessionAction } from '../actions/auth-custom';
import { Loader2, Trash2, ArrowRight, ShoppingBag, CheckCircle2, MapPin, Plus, Home, Briefcase, User } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Address State
    const [addresses, setAddresses] = useState<any[]>([]);
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

    const loadData = async () => {
        setLoading(true);
        const session = await getUserSessionAction();
        setUser(session);
        if (session) {
            const [cartRes, addrRes] = await Promise.all([
                getCartAction(session.userId),
                getUserAddressesAction(session.userId)
            ]);

            if (cartRes.success) setCart(cartRes.cart);
            if (addrRes.success) {
                setAddresses(addrRes.addresses || []);
                // Select default or first address if available
                const defaultAddr = addrRes.addresses?.find((a: any) => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (addrRes.addresses && addrRes.addresses.length > 0) setSelectedAddressId(addrRes.addresses[0].id);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        await updateCartItemAction(itemId, newQty);
        // Refresh cart only
        const res = await getCartAction(user.userId);
        if (res.success) setCart(res.cart);
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setAddingAddress(true);

        const res: any = await addAddressAction(user.userId, newAddress);
        if (res.success) {
            // Refresh addresses
            const addrRes = await getUserAddressesAction(user.userId);
            if (addrRes.success) {
                setAddresses(addrRes.addresses || []);
                if (res.address) setSelectedAddressId(res.address.id); // Select the new one
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
        await deleteAddressAction(id, user.userId);

        const addrRes = await getUserAddressesAction(user.userId);
        if (addrRes.success) {
            const updated = addrRes.addresses || [];
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

        const total = cart.items.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);

        // Pass snapshot of address
        const res = await placeOrderAction(user.userId, total, cart.items, selectedAddr);

        if (res.success) {
            setOrderPlaced(true);
            setCart(null);
        } else {
            alert('Failed to place order. Please try again.');
        }
        setProcessing(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-gray-400" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 text-center">
                <h2 className="text-2xl font-serif mb-4">Your Shopping Bag</h2>
                <p className="text-gray-500 mb-8">Please sign in to view your bag.</p>
                <Link href="/login" className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium">Sign In</Link>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h1 className="text-3xl font-serif mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Thank you for your purchase. We have received your order and are processing it. Cash on delivery selected.</p>
                <Link href="/shop" className="text-sm font-bold border-b border-black pb-1 hover:text-gray-600 transition-colors">Continue Shopping</Link>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <ShoppingBag size={24} />
                </div>
                <h2 className="text-2xl font-serif mb-2">Your bag is empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added any fragrances to your collection yet.</p>
                <Link href="/shop" className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors">Explore Collection</Link>
            </div>
        );
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);
    const shipping: number = 0; // Free shipping
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-white pt-24 pb-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <h1 className="font-serif text-3xl mb-12">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: items + Address */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Address Section */}
                        <section>
                            <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                                <MapPin size={20} /> Delivery Address
                            </h2>

                            {/* Address List */}
                            {!showAddressForm && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-4 border rounded-sm cursor-pointer transition-all relative group ${selectedAddressId === addr.id ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {addr.tag === 'Home' && <Home size={14} />}
                                                    {addr.tag === 'Work' && <Briefcase size={14} />}
                                                    {addr.tag === 'Other' && <User size={14} />}
                                                    <span className="font-bold text-xs uppercase tracking-wide">{addr.tag}</span>
                                                </div>
                                                <button onClick={(e) => handleDeleteAddress(addr.id, e)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-800 font-medium mb-1">{addr.street}</p>
                                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                                            <p className="text-sm text-gray-600 font-medium mt-2">Ph: {addr.phone}</p>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="h-full min-h-[140px] border border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors"
                                    >
                                        <Plus size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Add New Address</span>
                                    </button>
                                </div>
                            )}

                            {/* Add Address Form */}
                            {showAddressForm && (
                                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                                    <h3 className="font-bold text-sm uppercase tracking-wide mb-4">New Address</h3>
                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-1/3">
                                                <label className="block text-xs uppercase text-gray-500 mb-1">Tag</label>
                                                <select
                                                    value={newAddress.tag}
                                                    onChange={e => setNewAddress({ ...newAddress, tag: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                >
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs uppercase text-gray-500 mb-1">Phone</label>
                                                <input required type="tel" placeholder="10-digit mobile number" className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                    value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1">Street Address</label>
                                            <input required type="text" placeholder="House No, Building, Street Area" className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-1">City</label>
                                                <input required type="text" className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                    value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-1">State</label>
                                                <input required type="text" className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                    value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-1">Zip Code</label>
                                                <input required type="text" className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                                                    value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-1">Country</label>
                                                <input disabled type="text" value="India" className="w-full p-2 border border-gray-300 rounded-sm text-sm bg-gray-100" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input type="checkbox" id="def" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                                            <label htmlFor="def" className="text-sm text-gray-600">Make this my default address</label>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-white text-gray-600">Cancel</button>
                                            <button type="submit" disabled={addingAddress} className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50">
                                                {addingAddress ? 'Saving...' : 'Save Address'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </section>

                        {/* Cart Items Review */}
                        <section>
                            <h2 className="font-serif text-xl mb-6">Shopping Bag ({cart.items.length})</h2>
                            <div className="space-y-6">
                                {cart.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-6 last:border-0">
                                        <div className="w-24 h-32 bg-gray-50 shrink-0">
                                            {item.product.images[0] && (
                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-serif text-lg text-gray-900">{item.product.name}</h3>
                                                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{item.product.category?.name}</p>
                                                </div>
                                                <p className="font-medium text-gray-900">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-6">
                                                <div className="flex items-center border border-gray-200 rounded-sm">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500 disabled:opacity-30"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button onClick={() => handleUpdateQuantity(item.id, 0)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-8 rounded-sm sticky top-24">
                            <h3 className="font-serif text-xl mb-6">Payment Details</h3>

                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded bg-white cursor-pointer">
                                    <div className="pt-0.5">
                                        <div className="w-4 h-4 rounded-full border border-primary bg-primary flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block font-medium text-gray-900 text-sm">Cash on Delivery</span>
                                        <span className="block text-xs text-gray-500 mt-1">Pay when you receive your order.</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {processing ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Place Order <ArrowRight size={16} /></>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                By placing an order, you agree to our Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
