'use client';

import { useState, useEffect } from 'react';
import { getCategoriesAction } from '@/app/actions/admin';
import {
    bulkApplySaleByCategoryAction,
    bulkApplySaleByPriceAction,
    bulkApplySaleByGenderAction,
    clearAllSalesAction,
    getProductsCountByFilterAction
} from '@/app/actions/sales';
import { Percent, Tag, TrendingDown, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSalesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewCount, setPreviewCount] = useState(0);

    // Form states
    const [categoryFilter, setCategoryFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState<'MEN' | 'WOMEN' | 'UNISEX' | ''>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [salePercentage, setSalePercentage] = useState('');
    const [saleEndDate, setSaleEndDate] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const res = await getCategoriesAction();
        if (res.success) {
            setCategories(res.categories || []);
        }
    };

    const handlePreview = async () => {
        const filter: any = {};
        if (categoryFilter) filter.categoryId = categoryFilter;
        if (genderFilter) filter.gender = genderFilter;
        if (minPrice) filter.minPrice = parseFloat(minPrice);
        if (maxPrice) filter.maxPrice = parseFloat(maxPrice);

        const res = await getProductsCountByFilterAction(filter);
        if (res.success) {
            setPreviewCount(res.count);
        }
    };

    const handleApplySale = async () => {
        if (!salePercentage || parseFloat(salePercentage) <= 0) {
            alert('Please enter a valid sale percentage');
            return;
        }

        const percentage = parseFloat(salePercentage);
        const endDate = saleEndDate ? new Date(saleEndDate) : undefined;
        setLoading(true);

        let res;

        // Priority: Category > Gender > Price Range
        if (categoryFilter) {
            res = await bulkApplySaleByCategoryAction(categoryFilter, percentage, endDate);
        } else if (genderFilter) {
            res = await bulkApplySaleByGenderAction(genderFilter, percentage, endDate);
        } else if (minPrice || maxPrice) {
            const min = minPrice ? parseFloat(minPrice) : 0;
            const max = maxPrice ? parseFloat(maxPrice) : 999999;
            res = await bulkApplySaleByPriceAction(min, max, percentage, endDate);
        } else {
            alert('Please select at least one filter (Category, Gender, or Price Range)');
            setLoading(false);
            return;
        }

        setLoading(false);

        if (res.success) {
            alert(`✅ Sale applied successfully to ${res.count} products!`);
            // Reset form
            setCategoryFilter('');
            setGenderFilter('');
            setMinPrice('');
            setMaxPrice('');
            setSalePercentage('');
            setSaleEndDate('');
            setPreviewCount(0);
        } else {
            alert('❌ ' + (res.error || 'Failed to apply sale'));
        }
    };

    const handleClearAllSales = async () => {
        if (!confirm('Are you sure you want to remove ALL sales from ALL products? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        const res = await clearAllSalesAction();
        setLoading(false);

        if (res.success) {
            alert(`✅ All sales cleared! ${res.count} products updated.`);
        } else {
            alert('❌ Failed to clear sales');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Bulk Sale Management</h2>
                    <p className="text-gray-500 mt-1">Apply sales to multiple products at once</p>
                </div>
                <button
                    onClick={handleClearAllSales}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    <Trash2 size={18} /> Clear All Sales
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                        setGenderFilter('MEN');
                        setSalePercentage('25');
                        const res = await getProductsCountByFilterAction({ gender: 'MEN' });
                        if (res.success) setPreviewCount(res.count);
                    }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <Sparkles className="mb-2" size={24} />
                    <h3 className="font-bold text-lg">25% Off Men&apos;s</h3>
                    <p className="text-sm opacity-90">Quick apply to all men&apos;s fragrances</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                        setGenderFilter('WOMEN');
                        setSalePercentage('25');
                        const res = await getProductsCountByFilterAction({ gender: 'WOMEN' });
                        if (res.success) setPreviewCount(res.count);
                    }}
                    className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <Sparkles className="mb-2" size={24} />
                    <h3 className="font-bold text-lg">25% Off Women&apos;s</h3>
                    <p className="text-sm opacity-90">Quick apply to all women&apos;s fragrances</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                        setMinPrice('3000');
                        setSalePercentage('30');
                        const res = await getProductsCountByFilterAction({ minPrice: 3000 });
                        if (res.success) setPreviewCount(res.count);
                    }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <TrendingDown className="mb-2" size={24} />
                    <h3 className="font-bold text-lg">30% Off Premium</h3>
                    <p className="text-sm opacity-90">Products above ₹3000</p>
                </motion.button>
            </div>

            {/* Custom Bulk Sale Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag size={20} /> Custom Bulk Sale
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Gender Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Gender</label>
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value as any)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Genders</option>
                            <option value="MEN">Men</option>
                            <option value="WOMEN">Women</option>
                            <option value="UNISEX">Unisex</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., 1000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., 5000"
                        />
                    </div>

                    {/* Sale Percentage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Percent size={16} className="inline mr-1" />
                            Sale Percentage *
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={salePercentage}
                            onChange={(e) => setSalePercentage(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., 25"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter 0 to remove sale from matching products</p>
                    </div>

                    {/* Sale End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sale End Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={saleEndDate}
                            onChange={(e) => setSaleEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Sale will auto-expire after this date</p>
                    </div>
                </div>

                {/* Preview & Apply */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePreview}
                        className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        Preview
                    </button>

                    {previewCount > 0 && (
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                            📊 {previewCount} products match your filters
                        </div>
                    )}

                    <button
                        onClick={handleApplySale}
                        disabled={loading || !salePercentage}
                        className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 ml-auto"
                    >
                        {loading ? 'Applying...' : 'Apply Sale'}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-900 mb-2">💡 How it works:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                    <li>• <strong>Category filter</strong>: Apply sale to all products in a category</li>
                    <li>• <strong>Gender filter</strong>: Apply sale to Men&apos;s, Women&apos;s, or Unisex products</li>
                    <li>• <strong>Price range</strong>: Apply sale to products within a price range</li>
                    <li>• <strong>Combine filters</strong>: Use multiple filters together for precise targeting</li>
                    <li>• <strong>Set to 0%</strong>: Remove sale from matching products</li>
                </ul>
            </div>
        </div>
    );
}
