'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createProductAction, getProductsAction, getCategoriesAction, updateProductAction } from '@/app/actions/admin';
import { Plus, Loader2, Search, ChevronLeft, ChevronRight, X, Edit, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    // State for Modals
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
            getProductsAction(page, 10),
            getCategoriesAction()
        ]);
        if (prodRes.success) {
            setProducts(prodRes.products || []);
            setPagination(prodRes.pagination || { total: 0, pages: 1 });
        }
        if (catRes.success) setCategories(catRes.categories || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('products').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
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
                setIsCreating(false);
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

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.append('id', editingProduct.id);

            const res = await updateProductAction(formData);
            if (res.success) {
                fetchData();
                setEditingProduct(null);
            } else {
                alert(res.error);
            }
        } catch (error) {
            alert('Failed to update product');
        }
        setIsUpdating(false);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Products</h2>
                    <p className="text-gray-500 mt-1">Manage inventory and product details.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
                >
                    <Plus size={18} className="mr-2" />
                    Add Product
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter visible products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    {pagination.total > 0 && (
                        <p className="text-xs font-medium text-gray-500">
                            Total {pagination.total} items
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400 text-sm">Loading inventory...</p>
                    </div>
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
                                                    ₹{prod.isOnSale ? (Number(prod.price) * (1 - prod.salePercentage / 100)).toFixed(2) : Number(prod.price).toFixed(2)}
                                                </span>
                                                {prod.isOnSale && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 line-through">₹{Number(prod.price).toFixed(2)}</span>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase">-{prod.salePercentage}% Sale</span>
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
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setEditingProduct(prod)}
                                                className="text-black hover:text-gray-600 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            Page {page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === pagination.pages}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg w-full max-w-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="font-serif font-bold text-xl text-gray-900">Add New Product</h3>
                                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-black transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form onSubmit={handleCreate} className="space-y-5">
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
                                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price (₹)</label>
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

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-[2] w-full inline-flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit / Restock Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg w-full max-w-lg shadow-xl relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="font-serif font-bold text-xl text-gray-900">Edit / Restock Product</h3>
                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-black transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        defaultValue={editingProduct.name}
                                        required
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 border"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price (₹)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingProduct.price}
                                            required
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-blue-600 flex items-center gap-1">
                                            <Box size={12} /> Stock Quantity
                                        </label>
                                        <input
                                            name="stock"
                                            type="number"
                                            defaultValue={editingProduct.stock}
                                            required
                                            className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-blue-50 font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        defaultValue={editingProduct.description}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isOnSale"
                                            id="isOnSale"
                                            defaultChecked={editingProduct.isOnSale}
                                            className="rounded border-gray-300 text-black focus:ring-black"
                                        />
                                        <label htmlFor="isOnSale" className="text-xs font-bold uppercase tracking-wide text-gray-700">Put on Sale?</label>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sale Percentage (%)</label>
                                        <input
                                            name="salePercentage"
                                            type="number"
                                            defaultValue={editingProduct.salePercentage || 0}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sale End Date</label>
                                        <input
                                            name="saleEndDate"
                                            type="date"
                                            defaultValue={editingProduct.saleEndDate ? new Date(editingProduct.saleEndDate).toISOString().split('T')[0] : ''}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct(null)}
                                        className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-[2] py-3 bg-black text-white rounded-md text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                                    >
                                        {isUpdating ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
