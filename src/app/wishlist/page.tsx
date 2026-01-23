'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getWishlistAction, toggleWishlistAction, addToCartAction } from '../actions/shop';
import { getUserSessionAction } from '../actions/auth-custom';
import { Heart, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '@/components/Loading';

interface WishlistItem {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
        stock: number;
        isOnSale: boolean;
        salePercentage: number;
        category?: {
            name: string;
        };
    };
}

interface UserSession {
    userId: string;
    role: string;
    name: string | null;
    email: string | null;
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserSession | null>(null);

    // Animation states
    const [flyAnimation, setFlyAnimation] = useState<{ src: string, start: { x: number, y: number }, target: { x: number, y: number } } | null>(null);
    const [showToast, setShowToast] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        const session = await getUserSessionAction();
        setUser(session as UserSession);
        if (session) {
            const res = await getWishlistAction(1, 9);
            if (res.success && res.items) {
                setItems(res.items as WishlistItem[]);
                setHasMore((res.items?.length || 0) === 9);
                setPage(1);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => {
            await loadInitialData();
        })();
    }, [loadInitialData]);

    const loadMore = useCallback(async () => {
        if (isFetchingMore || !hasMore || !user) return;

        setIsFetchingMore(true);
        const nextPage = page + 1;
        const res = await getWishlistAction(nextPage, 9);

        if (res.success && res.items) {
            const newItems = res.items as WishlistItem[];
            if (newItems.length > 0) {
                setItems(prev => [...prev, ...newItems]);
                setPage(nextPage);
            }
            setHasMore(newItems.length === 9);
        }
        setIsFetchingMore(false);
    }, [isFetchingMore, hasMore, user, page]);

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
    }, [hasMore, loading, isFetchingMore, loadMore]);

    const handleRemove = async (productId: string) => {
        // Optimistic update
        setItems((prev: WishlistItem[]) => prev.filter((item) => item.productId !== productId));
        await toggleWishlistAction(productId);
    };

    if (loading) return <Loading text="Loading Your Collection" />;

    if (!user) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <div className="pt-32 pb-20 px-4 text-center">
                    <h2 className="text-3xl font-serif mb-4 text-foreground">Your Sanctuary</h2>
                    <p className="text-neutral-500 mb-8 font-light">Please sign in to access your curated collection of essences.</p>
                    <Link href="/login" className="inline-block bg-foreground text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary transition-colors">
                        Enter
                    </Link>
                </div>
            </div>
        );
    }

    if (!loading && items.length === 0) {
        return (
            <div className="min-h-screen bg-surface flex flex-col">
                <Navbar />
                <div className="grow flex flex-col items-center justify-center px-4 text-center pt-24 pb-12">
                    <div className="w-20 h-20 bg-white border border-dashed border-neutral-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <Heart size={32} className="text-neutral-300" />
                    </div>
                    <h2 className="text-3xl font-serif mb-3 text-foreground">Your collection is empty</h2>
                    <p className="text-neutral-500 mb-8 max-w-sm font-light leading-relaxed">
                        Explore our fragrances and save your favorites here for a timeless collection.
                    </p>
                    <Link href="/shop" className="inline-block bg-foreground text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary transition-colors">
                        Discover Scents
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <div className="pt-28 pb-10 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Your Collection</p>
                            <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
                                Wishlist
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400 text-sm">
                            <span className="font-serif italic text-foreground">{items.length}</span>
                            <span>Essences Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
                    <AnimatePresence>
                        {items.map((item) => {
                            const product = item.product;
                            const isOnSale = product.isOnSale;
                            const salePrice = isOnSale ? Number(product.price) * (1 - (product.salePercentage / 100)) : null;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="group flex flex-col h-full"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-4/5 overflow-hidden bg-white mb-6 border border-neutral-200/60 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-sm">
                                        <Link href={`./shop/${product.id}`} className="block w-full h-full">
                                            {/* Primary Image */}
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 w-full h-full bg-[#f4f1ea] flex items-center justify-center text-neutral-300 font-serif italic text-3xl">
                                                    Elara
                                                </div>
                                            )}

                                            {/* Secondary Image for Hover Effect */}
                                            {product.images[1] ? (
                                                <Image
                                                    src={product.images[1]}
                                                    alt={product.name}
                                                    fill
                                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                                                />
                                            ) : null}
                                        </Link>

                                        {/* Wishlist Button - Removal Mode */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemove(product.id);
                                            }}
                                            className="absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 bg-white text-red-500 hover:bg-neutral-100 shadow-sm"
                                            title="Remove from Wishlist"
                                        >
                                            <Heart size={16} className="fill-red-500" />
                                        </button>

                                        {/* Sale Badge */}
                                        {isOnSale && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-red-700 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">
                                                    Sale
                                                </span>
                                            </div>
                                        )}

                                        {/* Sold Out Overlay */}
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                <div className="bg-white border border-neutral-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                    Sold Out
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col grow">
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">
                                            {product.category?.name}
                                        </p>

                                        <Link href={`./shop/${product.id}`} className="group-hover:text-[#c6a87c] transition-colors">
                                            <h3 className="font-serif text-xl text-neutral-900 leading-tight mb-2">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Price */}
                                        <div className="mb-6 flex items-baseline gap-3">
                                            {isOnSale ? (
                                                <>
                                                    <span className="text-base text-red-700 font-medium">${salePrice?.toFixed(2)}</span>
                                                    <span className="text-xs text-neutral-400 line-through">${Number(product.price).toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="text-base text-neutral-600 font-medium">${Number(product.price).toFixed(2)}</span>
                                            )}
                                            {product.stock > 0 && product.stock <= 5 && (
                                                <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wider ml-auto">
                                                    Low Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Add To Cart */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    // Capture elements
                                                    const btn = e.currentTarget;
                                                    const cardEl = btn.closest('.group');

                                                    if (product.stock <= 0) return;

                                                    const result = await addToCartAction(product.id, 1);
                                                    if (result.success) {
                                                        // Visual Feedback
                                                        const originalHTML = btn.innerHTML;
                                                        btn.innerHTML = '<span class="flex items-center gap-2">Added <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
                                                        btn.classList.add('bg-[#1a1a1a]', 'text-white', 'border-[#1a1a1a]');

                                                        // Animation Trigger logic
                                                        const imgEl = cardEl?.querySelector('img');
                                                        const cartEl = document.getElementById('nav-cart-icon');

                                                        if (imgEl && cartEl) {
                                                            const imgRect = imgEl.getBoundingClientRect();
                                                            const cartRect = cartEl.getBoundingClientRect();

                                                            setFlyAnimation({
                                                                src: (imgEl as HTMLImageElement).src,
                                                                start: { x: imgRect.left, y: imgRect.top },
                                                                target: { x: cartRect.left, y: cartRect.top }
                                                            });

                                                            setTimeout(() => {
                                                                setFlyAnimation(null);
                                                                setShowToast(true);
                                                                setTimeout(() => setShowToast(false), 3000);
                                                            }, 800);
                                                        } else {
                                                            setShowToast(true);
                                                            setTimeout(() => setShowToast(false), 3000);
                                                        }

                                                        setTimeout(() => {
                                                            btn.innerHTML = originalHTML;
                                                            btn.classList.remove('bg-[#1a1a1a]', 'text-white', 'border-[#1a1a1a]');
                                                        }, 2000);
                                                    }
                                                }}
                                                disabled={product.stock <= 0}
                                                className="w-full py-3 border border-neutral-300 text-neutral-900 text-[10px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:border-[#c6a87c] hover:text-[#c6a87c] transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Scroll Trigger */}
                <div id="scroll-trigger" className="w-full py-20 flex flex-col items-center justify-center">
                    {isFetchingMore && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-px h-12 bg-gray-200 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-[#c6a87c] animate-bounce" />
                            </div>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Unveiling More</span>
                        </div>
                    )}
                    {!hasMore && items.length > 0 && (
                        <div className="flex flex-col items-center gap-4 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-neutral-300" />
                            <span className="font-serif italic text-neutral-400">End of Collection</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-[9999] bg-[#1a1a1a] text-white px-8 py-4 flex items-center gap-4 shadow-2xl"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#c6a87c] flex items-center justify-center text-black">
                            <ShoppingBag size={14} fill="currentColor" />
                        </div>
                        <div>
                            <span className="block font-serif text-lg leading-none mb-1">Added to Collection</span>
                            <span className="text-[10px] uppercase tracking-widest text-[#999]">View your cart</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fly Animation */}
            {flyAnimation && flyAnimation.src && (
                <motion.div
                    initial={{
                        position: 'fixed',
                        left: flyAnimation.start.x,
                        top: flyAnimation.start.y,
                        width: 200,
                        opacity: 1,
                        zIndex: 9999
                    }}
                    animate={{
                        left: flyAnimation.target.x,
                        top: flyAnimation.target.y,
                        width: 20,
                        height: 20,
                        opacity: 0.5
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="pointer-events-none rounded-full overflow-hidden shadow-xl"
                >
                    <Image
                        src={flyAnimation.src}
                        alt="Essence Travel"
                        fill
                        className="object-cover"
                    />
                </motion.div>
            )}
        </div>
    );
}
