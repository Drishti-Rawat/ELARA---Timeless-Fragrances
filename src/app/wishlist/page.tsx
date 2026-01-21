'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWishlistAction, toggleWishlistAction } from '../actions/shop';
import { getUserSessionAction } from '../actions/auth-custom';
import { Loader2, Trash2, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function WishlistPage() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const loadInitialData = async () => {
        setLoading(true);
        const session = await getUserSessionAction();
        setUser(session);
        if (session) {
            const res = await getWishlistAction(1, 9);
            if (res.success) {
                setItems(res.items || []);
                setHasMore((res.items?.length || 0) === 9);
                setPage(1);
            }
        }
        setLoading(false);
    };

    const loadMore = async () => {
        if (isFetchingMore || !hasMore || !user) return;

        setIsFetchingMore(true);
        const nextPage = page + 1;
        const res = await getWishlistAction(nextPage, 9);

        if (res.success) {
            const newItems = res.items || [];
            if (newItems.length > 0) {
                setItems(prev => [...prev, ...newItems]);
                setPage(nextPage);
            }
            setHasMore(newItems.length === 9);
        }
        setIsFetchingMore(false);
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const target = document.querySelector('#scroll-trigger');
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [hasMore, loading, isFetchingMore, page, user]);

    const handleRemove = async (productId: string) => {
        if (!user) return;
        // Optimistic update
        setItems((prev: any) => prev.filter((item: any) => item.productId !== productId));
        await toggleWishlistAction(productId);
        // We don't necessarily need to reload everything, but maybe sync once in a while
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

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

    if (!loading && items.length === 0) {
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
                <div className="flex items-center justify-between mb-12">
                    <h1 className="font-serif text-3xl flex items-center gap-3">
                        <Heart size={28} className="text-red-500 fill-red-500" /> Wishlist
                    </h1>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{items.length} items saved</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item: any) => (
                        <div key={item.id} className="group relative">
                            <div className="aspect-3/4 bg-gray-50 mb-4 overflow-hidden relative rounded-sm">
                                {item.product.images[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-300 italic">ELARA</div>
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

                {/* Scroll Trigger */}
                <div id="scroll-trigger" className="w-full h-20 flex items-center justify-center mt-12">
                    {isFetchingMore && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unveiling more favorites...</span>
                        </div>
                    )}
                    {!hasMore && items.length > 0 && (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                            <div className="h-px w-24 bg-gray-200" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End of your wishlist</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
