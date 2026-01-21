'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getShopProducts } from '../actions/shop';
import { getCategoriesAction } from '../actions/admin';
import { Filter, Search, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedGender, setSelectedGender] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
        // Load initial data
        getCategoriesAction().then(res => {
            if (res.success) setCategories(res.categories || []);
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
                setProducts(res.products || []);
                setHasMore((res.products?.length || 0) === 9);
                setPage(1);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchInitialProducts, 400);
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, selectedGender, searchQuery, minPrice, maxPrice]);

    const loadMore = async () => {
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
            const newProducts = res.products || [];
            if (newProducts.length > 0) {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(nextPage);
            }
            setHasMore(newProducts.length === 9);
        }
        setIsFetchingMore(false);
    };

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
    }, [hasMore, loading, isFetchingMore, page, selectedCategory, selectedGender, searchQuery, minPrice, maxPrice]);

    return (
        <div className="min-h-screen bg-background pt-0">
            <Navbar />
            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
                            <div>
                                <h3 className="font-serif text-lg font-bold mb-4 flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2"><Filter size={18} /> Filters</span>
                                    {(selectedCategory || selectedGender !== 'ALL' || minPrice || maxPrice) && (
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('');
                                                setSelectedGender('ALL');
                                                setMinPrice('');
                                                setMaxPrice('');
                                            }}
                                            className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-black transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </h3>

                                {/* Gender Filter */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Gender</h4>
                                    <div className="space-y-2">
                                        {['ALL', 'WOMEN', 'MEN', 'UNISEX'].map(gender => (
                                            <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${selectedGender === gender ? 'border-primary' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                    {selectedGender === gender && <div className="w-2 h-2 bg-primary rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    className="hidden"
                                                    checked={selectedGender === gender}
                                                    onChange={() => setSelectedGender(gender)}
                                                />
                                                <span className={`text-sm ${selectedGender === gender ? 'font-medium text-foreground' : 'text-gray-600'}`}>
                                                    {gender.charAt(0) + gender.slice(1).toLowerCase()}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Collection</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${selectedCategory === '' ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                                                {selectedCategory === '' && <span className="text-[10px]">✓</span>}
                                            </div>
                                            <input type="radio" name="category" className="hidden" onChange={() => setSelectedCategory('')} checked={selectedCategory === ''} />
                                            <span className={`text-sm ${selectedCategory === '' ? 'font-medium' : 'text-gray-600'}`}>All Collections</span>
                                        </label>
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                                                    {selectedCategory === cat.id && <span className="text-[10px]">✓</span>}
                                                </div>
                                                <input type="radio" name="category" className="hidden" onChange={() => setSelectedCategory(cat.id)} checked={selectedCategory === cat.id} />
                                                <span className={`text-sm ${selectedCategory === cat.id ? 'font-medium' : 'text-gray-600'}`}>{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="mt-8">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex justify-between">
                                        Price Range
                                        <span className="text-primary font-bold">₹{minPrice || 0} - ₹{maxPrice || 15000}</span>
                                    </h4>

                                    <div className="px-1 relative h-6 group">
                                        {/* Custom Slider Track */}
                                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="absolute h-full bg-primary/20 transition-all duration-300"
                                                style={{
                                                    left: `${(Number(minPrice) / 15000) * 100}%`,
                                                    right: `${100 - (Number(maxPrice || 15000) / 15000) * 100}%`
                                                }}
                                            />
                                        </div>

                                        {/* Min Input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="15000"
                                            step="500"
                                            value={minPrice || 0}
                                            onChange={(e) => {
                                                const val = Math.min(Number(e.target.value), Number(maxPrice || 15000) - 500);
                                                setMinPrice(val.toString());
                                            }}
                                            className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                                        />

                                        {/* Max Input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="15000"
                                            step="500"
                                            value={maxPrice || 15000}
                                            onChange={(e) => {
                                                const val = Math.max(Number(e.target.value), Number(minPrice || 0) + 500);
                                                setMaxPrice(val.toString());
                                            }}
                                            className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                                        />
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <span className="text-[10px] text-gray-400 font-medium">₹0</span>
                                        <span className="text-[10px] text-gray-400 font-medium">₹15k+</span>
                                    </div>

                                    {(minPrice || (maxPrice && maxPrice !== '15000')) && (
                                        <button
                                            onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                                            className="text-[10px] text-primary underline mt-4 uppercase tracking-widest font-bold"
                                        >
                                            Reset Price
                                        </button>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-1">
                            {/* Search Bar */}
                            <div className="mb-8 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search fragrances..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light"
                                />
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-sm" />
                                    ))}
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {products.map(product => {
                                            const salePrice = product.isOnSale
                                                ? Number(product.price) * (1 - product.salePercentage / 100)
                                                : null;

                                            return (
                                                <Link href={`./shop/${product.id}`} key={product.id} className="group">
                                                    <div className="relative aspect-3/4 overflow-hidden bg-white mb-4 rounded-sm">
                                                        {product.images[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-serif italic">
                                                                ELARA
                                                            </div>
                                                        )}

                                                        {/* Sale Badge */}
                                                        {product.isOnSale && (
                                                            <div className="absolute top-3 left-3 z-10">
                                                                <span className="bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                                                                    {product.salePercentage}% OFF
                                                                </span>
                                                            </div>
                                                        )}

                                                        {product.stock <= 0 && (
                                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                                                                <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">Sold Out</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                                                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 mb-2">{product.category?.name}</p>

                                                        {/* Rating Display */}
                                                        {(product as any).reviewCount > 0 && (
                                                            <div className="flex items-center justify-center gap-1 mb-2">
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            size={12}
                                                                            className={star <= Math.round((product as any).averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs text-gray-500">({(product as any).reviewCount})</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-center gap-2">
                                                            {product.isOnSale ? (
                                                                <>
                                                                    <span className="font-medium text-red-600">${salePrice?.toFixed(2)}</span>
                                                                    <span className="text-sm text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
                                                                </>
                                                            ) : (
                                                                <p className="font-medium text-foreground">${Number(product.price).toFixed(2)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    {/* Scroll Trigger */}
                                    <div id="scroll-trigger" className="w-full h-20 flex items-center justify-center mt-12">
                                        {isFetchingMore && (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gently uncovering more...</span>
                                            </div>
                                        )}
                                        {!hasMore && products.length > 0 && (
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <div className="h-px w-24 bg-gray-200" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End of the collection</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-24">
                                    <h3 className="font-serif text-2xl text-gray-400 mb-2">No fragrances found</h3>
                                    <p className="text-gray-500">Try adjusting your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
