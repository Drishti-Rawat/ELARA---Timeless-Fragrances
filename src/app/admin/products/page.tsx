'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createProductAction, getProductsAction, getCategoriesAction } from '@/app/actions/admin';
import { Plus, Loader2, Search } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
            getProductsAction(),
            getCategoriesAction()
        ]);
        if (prodRes.success) setProducts(prodRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('products').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const file = (e.currentTarget.elements.namedItem('imageFile') as HTMLInputElement)?.files?.[0];

            if (file) {
                const url = await uploadImage(file);
                if (url) formData.set('imageUrl', url);
            }

            const res = await createProductAction(formData);
            if (res.success) {
                fetchData();
                (e.target as HTMLFormElement).reset();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create product');
        }
        setIsSubmitting(false);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Products</h2>
                    <p className="text-gray-500 mt-1">Manage inventory and product details.</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-4 flex items-center gap-2 text-gray-900">
                    <Plus size={18} /> Add New Product
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</label>
                            <input name="name" type="text" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
                            <select name="categoryId" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border bg-white">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gender</label>
                            <select name="gender" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border bg-white">
                                <option value="UNISEX">Unisex</option>
                                <option value="MEN">Men</option>
                                <option value="WOMEN">Women</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
                        <textarea name="description" rows={3} required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price ($)</label>
                            <input name="price" type="number" step="0.01" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</label>
                            <input name="stock" type="number" defaultValue={10} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Image</label>
                            <input name="imageFile" type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Search and List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading inventory...</div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map(prod => (
                                    <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                                                    {prod.images[0] && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={prod.images[0]} alt={prod.name} className="object-cover w-full h-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900">{prod.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {prod.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${prod.isOnSale ? 'text-red-600' : 'text-gray-900'}`}>
                                                    ${prod.isOnSale ? (Number(prod.price) * (1 - prod.salePercentage / 100)).toFixed(2) : Number(prod.price).toFixed(2)}
                                                </span>
                                                {prod.isOnSale && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 line-through">${Number(prod.price).toFixed(2)}</span>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase">-{prod.salePercentage}% Sale</span>
                                                        {prod.saleEndDate && (
                                                            <span className="text-[10px] text-amber-600">Ends: {new Date(prod.saleEndDate).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${prod.stock > 10 ? 'bg-green-100 text-green-800' :
                                                prod.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {prod.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 hover:text-gray-600 cursor-pointer">
                                            Edit
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No products found matching &ldquo;{searchTerm}&rdquo;
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
