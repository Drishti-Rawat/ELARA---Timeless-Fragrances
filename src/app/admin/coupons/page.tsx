'use client';

import { useState, useEffect } from 'react';
import { getAllCouponsAction, createCouponAction, toggleCouponStatusAction, deleteCouponAction } from '@/app/actions/coupons';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        discountValue: '',
        minOrderValue: '',
        maxUses: '',
        firstOrderOnly: false,
        excludeSaleItems: true,
        expiresAt: ''
    });

    const loadCoupons = async () => {
        setLoading(true);
        const res = await getAllCouponsAction();
        if (res.success) {
            setCoupons(res.coupons || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await createCouponAction({
            code: formData.code,
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
            maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
            firstOrderOnly: formData.firstOrderOnly,
            excludeSaleItems: formData.excludeSaleItems,
            expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
        });

        if (res.success) {
            alert('Coupon created successfully!');
            setShowForm(false);
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: '',
                minOrderValue: '',
                maxUses: '',
                firstOrderOnly: false,
                excludeSaleItems: true,
                expiresAt: ''
            });
            loadCoupons();
        } else {
            alert(res.error || 'Failed to create coupon');
        }
    };

    const handleToggleStatus = async (id: string) => {
        const res = await toggleCouponStatusAction(id);
        if (res.success) {
            loadCoupons();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        const res = await deleteCouponAction(id);
        if (res.success) {
            alert('Coupon deleted successfully!');
            loadCoupons();
        } else {
            alert(res.error || 'Failed to delete coupon');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Discount Coupons</h2>
                    <p className="text-gray-500 mt-1">Create and manage promotional discount codes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Create Coupon
                </button>
            </div>

            {/* Create Coupon Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                    <h3 className="font-bold text-lg mb-4">New Coupon</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="WELCOME10"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (₹)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.minOrderValue}
                                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.firstOrderOnly}
                                    onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">First Order Only (for new customers)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.excludeSaleItems}
                                    onChange={(e) => setFormData({ ...formData, excludeSaleItems: e.target.checked })}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">Exclude Sale Items (cannot apply to products on sale)</span>
                            </label>
                        </div>

                        <div className="md:col-span-2 flex gap-2">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                            >
                                Create Coupon
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Coupons List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg border border-gray-100 text-center">
                        <Tag size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No coupons created yet</p>
                    </div>
                ) : (
                    coupons.map((coupon, index) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-mono text-xl font-bold text-primary">{coupon.code}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                        {coupon.firstOrderOnly && (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                FIRST ORDER
                                            </span>
                                        )}
                                        {coupon.excludeSaleItems && (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                NO SALE ITEMS
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Discount</p>
                                            <p className="font-bold text-gray-900">
                                                {coupon.discountType === 'PERCENTAGE'
                                                    ? `${Number(coupon.discountValue)}%`
                                                    : `₹${Number(coupon.discountValue)}`
                                                }
                                            </p>
                                        </div>

                                        {coupon.minOrderValue && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Min Order</p>
                                                <p className="font-bold text-gray-900">₹{Number(coupon.minOrderValue)}</p>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Users size={12} /> Usage
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                                            </p>
                                        </div>

                                        {coupon.expiresAt && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Calendar size={12} /> Expires
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {new Date(coupon.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(coupon.id)}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {coupon.isActive ? (
                                            <ToggleRight size={20} className="text-green-600" />
                                        ) : (
                                            <ToggleLeft size={20} className="text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
