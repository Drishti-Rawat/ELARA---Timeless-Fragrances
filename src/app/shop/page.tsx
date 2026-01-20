'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getShopProducts } from '../actions/shop';
import { getCategoriesAction } from '../actions/admin';
import { Filter, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedGender, setSelectedGender] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Load initial data
        getCategoriesAction().then(res => {
            if (res.success) setCategories(res.categories || []);
        });
    }, []);

    useEffect(() => {
        // Fetch products whenever filters change
        const fetchProducts = async () => {
            setLoading(true);
            const res = await getShopProducts({
                categoryId: selectedCategory || undefined,
                gender: selectedGender,
                search: searchQuery
            });
            if (res.success) setProducts(res.products || []);
            setLoading(false);
        };

        // Debounce search
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, selectedGender, searchQuery]);

    return (
        <div className="min-h-screen bg-background pt-0">
            <Navbar />
            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
                            <div>
                                <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                                    <Filter size={18} /> Filters
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {products.map(product => (
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
                                                        Ashbloom
                                                    </div>
                                                )}
                                                {product.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                        <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">Sold Out</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 mb-2">{product.category?.name}</p>
                                                <p className="font-medium text-foreground">${Number(product.price).toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
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
