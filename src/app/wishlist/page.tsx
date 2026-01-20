'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWishlistAction, toggleWishlistAction } from '../actions/shop';
import { getUserSessionAction } from '../actions/auth-custom';
import { Loader2, Trash2, Heart, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function WishlistPage() {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        const session = await getUserSessionAction();
        setUser(session);
        if (session) {
            const res = await getWishlistAction(session.userId);
            if (res.success) setWishlist(res.wishlist);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRemove = async (productId: string) => {
        if (!user) return;
        // Optimistic update
        setWishlist((prev: any) => ({
            ...prev,
            items: prev.items.filter((item: any) => item.productId !== productId)
        }));
        await toggleWishlistAction(user.userId, productId);
        loadData(); // Sync
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-gray-400" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 pb-20 px-4 text-center">
                    <h2 className="text-2xl font-serif mb-4">Your Wishlist</h2>
                    <p className="text-gray-500 mb-8">Please sign in to view your wishlist.</p>
                    <Link href="/login" className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium">Sign In</Link>
                </div>
            </div>
        );
    }

    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 pb-20 px-4 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-300 mb-6">
                        <Heart size={24} className="fill-red-100" />
                    </div>
                    <h2 className="text-2xl font-serif mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">Save your favorite scents here to revisit them later.</p>
                    <Link href="/shop" className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors">Explore Collection</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20 px-4">
            <Navbar />
            <div className="container mx-auto max-w-5xl">
                <h1 className="font-serif text-3xl mb-12 flex items-center gap-3">
                    <Heart size={28} className="text-red-500 fill-red-500" /> Wishlist
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlist.items.map((item: any) => (
                        <div key={item.id} className="group relative">
                            <div className="aspect-3/4 bg-gray-50 mb-4 overflow-hidden relative rounded-sm">
                                {item.product.images[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-300 italic">Ashbloom</div>
                                )}

                                <button
                                    onClick={() => handleRemove(item.productId)}
                                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <Link href={`/shop/${item.product.id}`} className="block">
                                <h3 className="font-serif text-lg text-gray-900 group-hover:text-primary transition-colors">{item.product.name}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 mb-2">{item.product.category?.name}</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900">${Number(item.product.price).toFixed(2)}</p>
                                    <span className="text-xs font-bold underline flex items-center gap-1">View Product</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
