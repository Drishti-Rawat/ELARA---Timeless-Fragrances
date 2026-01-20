'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createCategoryAction, getCategoriesAction } from '@/app/actions/admin';
import { Plus, Loader2 } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        const res = await getCategoriesAction();
        if (res.success) setCategories(res.categories || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('categories').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('categories').getPublicUrl(filePath);
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
                if (url) formData.set('image', url);
            }

            const res = await createCategoryAction(formData);
            if (res.success) {
                fetchCategories();
                (e.target as HTMLFormElement).reset();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create category');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Categories</h2>
                    <p className="text-gray-500 mt-1">Manage your product collections.</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-4 flex items-center gap-2 text-gray-900">
                    <Plus size={18} /> Add New Category
                </h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</label>
                        <input name="name" type="text" placeholder="e.g. Floral" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Image</label>
                        <input name="imageFile" type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Add'}
                    </button>
                </form>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading categories...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-[4/3] bg-gray-100 relative">
                                {cat.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Plus size={24} className="opacity-20" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <p className="text-white text-xs font-medium">ID: {cat.id.slice(0, 6)}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-serif font-medium text-gray-900">{cat.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{cat.products?.length || 0} Products</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
