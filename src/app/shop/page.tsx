'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getShopProducts } from '../actions/shop';
import { getCategoriesAction } from '../actions/admin';
import { Search, X, Heart, ShoppingBag, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCartAction, toggleWishlistAction } from '../actions/shop';
import { getUserSessionAction } from '../actions/auth-custom';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
    category?: Category;
    gender: string;
    isOnSale: boolean;
    salePercentage: number;
    isInWishlist?: boolean;
}

interface UserSession {
    id: string;
    email: string;
    name?: string | null;
}



function ShopContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserSession | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [selectedGender, setSelectedGender] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Animation State
    const [flyAnimation, setFlyAnimation] = useState<{ src?: string, start: { x: number, y: number }, target: { x: number, y: number } } | null>(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Load initial data
        getCategoriesAction().then(res => {
            if (res.success) setCategories(res.categories as Category[] || []);
        });
        // Load user session
        getUserSessionAction().then(session => {
            setUser(session as UserSession | null);
        });
    }, []);

    useEffect(() => {
        // Reset and fetch when filters change
        const fetchInitialProducts = async () => {
            setLoading(true);
            const res = await getShopProducts({
                categoryId: selectedCategory || undefined,
                gender: selectedGender || 'ALL',
                search: searchQuery,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                page: 1,
                limit: 9
            });
            if (res.success) {
                setProducts(res.products as unknown as Product[] || []);
                setHasMore((res.products?.length || 0) === 9);
                setPage(1);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchInitialProducts, 400);
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, selectedGender, searchQuery, minPrice, maxPrice]);

    const loadMore = useCallback(async () => {
        if (isFetchingMore || !hasMore) return;

        setIsFetchingMore(true);
        const nextPage = page + 1;
        const res = await getShopProducts({
            categoryId: selectedCategory || undefined,
            gender: selectedGender || 'ALL',
            search: searchQuery,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            page: nextPage,
            limit: 9
        });

        if (res.success) {
            const newProducts = res.products as unknown as Product[] || [];
            if (newProducts.length > 0) {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(nextPage);
            }
            setHasMore(newProducts.length === 9);
        }
        setIsFetchingMore(false);
    }, [isFetchingMore, hasMore, page, selectedCategory, selectedGender, searchQuery, minPrice, maxPrice]);

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

    const activeFiltersCount = [selectedCategory, selectedGender !== 'ALL', minPrice, maxPrice].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-surface text-neutral-900 selection:bg-primary/30">
            <Navbar />

            {/* --- COSMIC HEADER --- */}
            <div className="relative pt-32 pb-6 sm:pb-20 px-6 overflow-hidden">
                {/* 1. Large Watermark Text - Fills the empty space */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-serif text-primary/5 pointer-events-none select-none whitespace-nowrap z-0 tracking-tighter">
                    TIMELESS
                </div>

                {/* 2. Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-neutral-200/50 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 opacity-50" />

                <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-primary" />
                            <span className="text-primary uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold">
                                Official Boutique
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-6 leading-[0.9] tracking-tight">
                            The <span className="italic text-neutral-400 font-light">Archive</span>
                        </h1>
                        <p className="text-neutral-500 font-light text-sm md:text-base max-w-md leading-relaxed ml-1">
                            A curated selection of olfactory masterpieces. Each fragrance is designed to transcend the ordinary.
                        </p>
                    </motion.div>

                    {/* Right Content - Stats Badge to fill right space */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden md:flex flex-col items-end text-right gap-4 mb-2"
                    >
                        <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center relative group cursor-default backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                            <div className="text-center">
                                <span className="block text-3xl font-serif text-neutral-900">{products.length}</span>
                                <span className="text-[9px] uppercase tracking-widest text-primary block mt-1">Elixirs</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 pb-24">

                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-8 sticky top-20 z-30">
                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-neutral-100 flex items-center justify-between pl-6 pr-2">
                        <span className="text-xs font-serif italic text-neutral-500">
                            {products.length} {products.length === 1 ? 'Elixir' : 'Elixirs'} Result(s)
                        </span>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-foreground text-surface rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all"
                        >
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="bg-surface text-foreground rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
                    {/* --- SIDEBAR FILTERS (DESKTOP) --- */}
                    <aside className="hidden md:block w-64 shrink-0 space-y-12 pt-2">
                        <div className="sticky top-32 space-y-10">

                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-b border-neutral-200 py-2 pl-6 text-sm font-medium focus:outline-none focus:border-primary transition-colors placeholder:font-light placeholder:text-neutral-400 placeholder:italic"
                                />
                            </div>

                            {/* Reset Button */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedGender('ALL');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSearchQuery('');
                                    }}
                                    className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-2 font-bold"
                                >
                                    <X size={12} /> Clear Filters
                                </button>
                            )}

                            {/* Gender Filter */}
                            <div>
                                <h4 className="font-serif text-lg text-neutral-900 mb-4">For</h4>
                                <div className="space-y-3">
                                    {['ALL', 'WOMEN', 'MEN', 'UNISEX'].map(gender => (
                                        <label key={gender} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-all ${selectedGender === gender ? 'border-primary bg-primary' : 'border-neutral-300 group-hover:border-neutral-400'}`}>
                                            </div>
                                            <input
                                                type="radio"
                                                name="gender"
                                                className="hidden"
                                                checked={selectedGender === gender}
                                                onChange={() => setSelectedGender(gender)}
                                            />
                                            <span className={`text-xs uppercase tracking-wider transition-colors ${selectedGender === gender ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-800'}`}>
                                                {gender.charAt(0) + gender.slice(1).toLowerCase()}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <h4 className="font-serif text-lg text-neutral-900 mb-4">Collection</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-all ${selectedCategory === '' ? 'border-primary bg-primary' : 'border-neutral-300 group-hover:border-neutral-400'}`}>
                                        </div>
                                        <input type="radio" name="category" className="hidden" onChange={() => setSelectedCategory('')} checked={selectedCategory === ''} />
                                        <span className={`text-xs uppercase tracking-wider transition-colors ${selectedCategory === '' ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-800'}`}>All Collections</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-all ${selectedCategory === cat.id ? 'border-primary bg-primary' : 'border-neutral-300 group-hover:border-neutral-400'}`}>
                                            </div>
                                            <input type="radio" name="category" className="hidden" onChange={() => setSelectedCategory(cat.id)} checked={selectedCategory === cat.id} />
                                            <span className={`text-xs uppercase tracking-wider transition-colors ${selectedCategory === cat.id ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-800'}`}>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h4 className="font-serif text-lg text-neutral-900 mb-4 flex justify-between items-end">
                                    <span>Price</span>
                                    <span className="text-[10px] text-primary font-sans tracking-widest">${minPrice || 0} - ${maxPrice || 500}</span>
                                </h4>

                                <div className="px-1 relative h-6 mb-6">
                                    {/* Track */}
                                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-neutral-200">
                                        <div
                                            className="absolute h-full bg-primary transition-all duration-300"
                                            style={{
                                                left: `${(Number(minPrice) / 500) * 100}%`,
                                                right: `${100 - (Number(maxPrice || 500) / 500) * 100}%`
                                            }}
                                        />
                                    </div>

                                    {/* Min Slider */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="25"
                                        value={minPrice || 0}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), Number(maxPrice || 500) - 25);
                                            setMinPrice(val.toString());
                                        }}
                                        className="absolute w-full h-0.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                                    />

                                    {/* Max Slider */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="25"
                                        value={maxPrice || 500}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), Number(minPrice || 0) + 25);
                                            setMaxPrice(val.toString());
                                        }}
                                        className="absolute w-full h-0.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>


                    {/* --- PRODUCT GRID --- */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="space-y-4">
                                        <div className="aspect-4/5 bg-neutral-100 animate-pulse rounded-sm" />
                                        <div className="h-4 bg-neutral-100 w-3/4 rounded-sm" />
                                        <div className="h-4 bg-neutral-100 w-1/2 rounded-sm" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12"
                                >
                                    {products.map((product, index) => {
                                        const salePrice = product.isOnSale
                                            ? Number(product.price) * (1 - product.salePercentage / 100)
                                            : null;

                                        return (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-50px" }}
                                                transition={{ duration: 0.6, delay: index * 0.05 }}
                                                className="group flex flex-col h-full"
                                            >
                                                {/* Image Container */}
                                                <div className="relative aspect-4/5 overflow-hidden bg-white mb-4 md:mb-6 border border-neutral-200/60 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-sm">
                                                    <Link href={`./shop/${product.id}`} className="block w-full h-full">
                                                        {/* Primary Image */}
                                                        {product.images[0] ? (
                                                            <div className="absolute inset-0 w-full h-full">
                                                                <Image
                                                                    id={`product-img-${product.id}`}
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                                    className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 w-full h-full bg-[#f4f1ea] flex items-center justify-center text-neutral-300 font-serif italic text-3xl">
                                                                Elara
                                                            </div>
                                                        )}

                                                        {/* Secondary Image (Hover) */}
                                                        {product.images[1] ? (
                                                            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105">
                                                                <Image
                                                                    src={product.images[1]}
                                                                    alt={product.name}
                                                                    fill
                                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105">
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* Wishlist Button - Top Right */}
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!user) {
                                                                setShowLoginModal(true);
                                                                return;
                                                            }

                                                            // Optimistic Update
                                                            const isCurrentlyWishlisted = product.isInWishlist;
                                                            setProducts(prev => prev.map(p =>
                                                                p.id === product.id
                                                                    ? { ...p, isInWishlist: !isCurrentlyWishlisted }
                                                                    : p
                                                            ));

                                                            const result = await toggleWishlistAction(product.id);
                                                            if (!result.success) {
                                                                // Revert on failure
                                                                setProducts(prev => prev.map(p =>
                                                                    p.id === product.id
                                                                        ? { ...p, isInWishlist: isCurrentlyWishlisted }
                                                                        : p
                                                                ));
                                                            }
                                                        }}
                                                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-red-500 ${product.isInWishlist ? "opacity-100 bg-white text-red-500" : "opacity-0 group-hover:opacity-100 bg-white/80 text-neutral-400"}`}
                                                    >
                                                        <Heart
                                                            size={16}
                                                            className={product.isInWishlist ? "fill-red-500 text-red-500" : ""}
                                                        />
                                                    </button>

                                                    {/* Sale Badge */}
                                                    {product.isOnSale && (
                                                        <div className="absolute top-4 left-4 z-10">
                                                            <span className="bg-red-700 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">
                                                                Sale
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Sold Out Overlay */}
                                                    {product.stock <= 0 && (
                                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                            <span className="text-neutral-900 border border-neutral-900 px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold">Sold Out</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="flex flex-col flex-1 pl-1">
                                                    {/* Category */}
                                                    <p className="text-[10px] text-primary uppercase tracking-[0.25em] font-bold mb-2">
                                                        {product.category?.name}
                                                    </p>

                                                    <Link href={`./shop/${product.id}`} className="group-hover:text-primary transition-colors">
                                                        <h3 className="font-serif text-sm md:text-2xl text-neutral-900 leading-tight mb-2">
                                                            {product.name}
                                                        </h3>
                                                    </Link>

                                                    {/* Price */}
                                                    <div className="mb-6 flex items-baseline gap-3">
                                                        {product.isOnSale ? (
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

                                                    {/* Push Button to Bottom of Flex Container */}
                                                    <div className="mt-auto">
                                                        <button
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();

                                                                // Capture elements before async operation
                                                                const btn = e.currentTarget;
                                                                const cardEl = btn.closest('.group');

                                                                if (!user) {
                                                                    setShowLoginModal(true);
                                                                    return;
                                                                }
                                                                if (product.stock <= 0) return;

                                                                const result = await addToCartAction(product.id, 1);
                                                                if (result.success) {
                                                                    // Visual Feedback
                                                                    const originalHTML = btn.innerHTML;
                                                                    btn.innerHTML = '<span class="flex items-center gap-2">Added <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
                                                                    btn.classList.add('bg-foreground', 'text-white', 'border-foreground');

                                                                    // Animation Trigger
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

                                                                        // Clear animation and show toast after duration
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
                                                                        btn.classList.remove('bg-foreground', 'text-white', 'border-foreground');
                                                                    }, 2000);
                                                                }
                                                            }}
                                                            disabled={product.stock <= 0}
                                                            className="w-full py-3 border border-neutral-300 text-neutral-900 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group/btn"
                                                        >
                                                            {product.stock > 0 ? (
                                                                <>
                                                                    Add to Cart
                                                                    {/* <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" /> */}
                                                                </>
                                                            ) : 'Unavailable'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                {/* Scroll Trigger & Loading State */}
                                <div id="scroll-trigger" className="w-full py-20 flex flex-col items-center justify-center">
                                    {isFetchingMore && (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-px h-12 bg-gray-200 overflow-hidden relative">
                                                <div className="absolute top-0 left-0 w-full h-1/2 bg-primary animate-bounce" />
                                            </div>
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Discovering More</span>
                                        </div>
                                    )}
                                    {!hasMore && products.length > 0 && (
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <div className="w-2 h-2 rounded-full bg-neutral-300" />
                                            <span className="font-serif italic text-neutral-400">End of Collection</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-32 border border-dashed border-neutral-200 rounded-sm"
                            >
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-200">
                                    <Search size={24} className="text-neutral-400" />
                                </div>
                                <h3 className="font-serif text-3xl text-neutral-400 mb-3">No essence found</h3>
                                <p className="text-neutral-500 mb-8 font-light text-sm">Refine your criteria to uncover hidden gems.</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedGender('ALL');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSearchQuery('');
                                    }}
                                    className="px-8 py-3 bg-foreground text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div >
            </div >

            {/* Mobile Filter Bottom Sheet - Cosmic Style */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-surface z-50 max-h-[85vh] overflow-hidden md:hidden rounded-t-4xl"
                        >
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1 bg-neutral-200 rounded-full" />
                            </div>

                            <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
                                <h3 className="font-serif text-3xl text-neutral-900">Refine</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                                >
                                    <X size={24} className="text-neutral-900" strokeWidth={1} />
                                </button>
                            </div>

                            <div className="overflow-y-auto px-8 py-8 space-y-10" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                                {/* Mobile Search */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Fragrance name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-neutral-200 p-4 text-sm font-serif placeholder:italic placeholder:text-neutral-300 focus:border-primary outline-none rounded-sm"
                                    />
                                </div>

                                {/* Mobile Gender */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">For</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['ALL', 'WOMEN', 'MEN', 'UNISEX'].map(gender => (
                                            <button
                                                key={gender}
                                                onClick={() => setSelectedGender(gender)}
                                                className={`px-4 py-2 border text-[10px] uppercase tracking-wider font-bold transition-all ${selectedGender === gender
                                                    ? 'bg-foreground text-white border-foreground'
                                                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900'
                                                    }`}
                                            >
                                                {gender}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Price */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex justify-between">
                                        <span>Price Range</span>
                                        <span className="text-neutral-900">${minPrice || 0} - ${maxPrice || 500}</span>
                                    </label>
                                    <div className="px-1 relative h-6 mb-6">
                                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-neutral-200">
                                            <div
                                                className="absolute h-full bg-primary transition-all duration-300"
                                                style={{
                                                    left: `${(Number(minPrice) / 500) * 100}%`,
                                                    right: `${100 - (Number(maxPrice || 500) / 500) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            step="25"
                                            value={minPrice || 0}
                                            onChange={(e) => {
                                                const val = Math.min(Number(e.target.value), Number(maxPrice || 500) - 25);
                                                setMinPrice(val.toString());
                                            }}
                                            className="absolute w-full h-0.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            step="25"
                                            value={maxPrice || 500}
                                            onChange={(e) => {
                                                const val = Math.max(Number(e.target.value), Number(minPrice || 0) + 25);
                                                setMaxPrice(val.toString());
                                            }}
                                            className="absolute w-full h-0.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-neutral-100 bg-white">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full py-4 bg-foreground text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors"
                                >
                                    View Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Login Required Modal - Consistent */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-surface p-10 max-w-sm w-full shadow-2xl relative text-center border border-white"
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                            >
                                <X size={20} strokeWidth={1} />
                            </button>

                            <div className="w-12 h-12 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <User size={20} strokeWidth={1} />
                            </div>

                            <h3 className="font-serif text-3xl text-neutral-900 mb-2">Member Access</h3>
                            <p className="text-xs text-neutral-500 mb-8 leading-relaxed font-light uppercase tracking-wide">
                                Join the inner circle to collect
                            </p>

                            <Link
                                href="/login"
                                className="block w-full bg-foreground text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors mb-4"
                            >
                                Sign In
                            </Link>

                            <p className="text-[10px] text-neutral-400 tracking-wider">
                                New here? <Link href="/signup" className="text-neutral-900 underline hover:text-primary transition-colors">Create Account</Link>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-9999 bg-foreground text-white px-8 py-4 flex items-center gap-4 shadow-2xl"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black">
                            <ShoppingBag size={14} fill="currentColor" />
                        </div>
                        <div>
                            <span className="block font-serif text-lg leading-none mb-1">Added to Collection</span>
                            <span className="text-[10px] uppercase tracking-widest text-[#999]">View your cart</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fly Animation Image */}
            {flyAnimation && flyAnimation.src && (
                <motion.img
                    src={flyAnimation.src}
                    initial={{
                        position: 'fixed',
                        left: flyAnimation.start.x,
                        top: flyAnimation.start.y,
                        width: 200, // Approximate starting width in grid
                        opacity: 1,
                        zIndex: 9999,
                        borderRadius: '0%'
                    }}
                    animate={{
                        left: flyAnimation.target.x,
                        top: flyAnimation.target.y,
                        width: 20,
                        height: 20,
                        opacity: 0.5,
                        borderRadius: '50%'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="pointer-events-none object-cover shadow-xl"
                />
            )}
        </div >
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-gray-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-primary animate-bounce" />
                    </div>
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
