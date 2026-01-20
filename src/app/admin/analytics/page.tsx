'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsDataAction, AnalyticsPeriod } from '@/app/actions/analytics';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, PieChart as PieIcon, LineChart as LineIcon, Users, AlertTriangle, Package, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<AnalyticsPeriod>('week');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const res = await getAnalyticsDataAction(period);
        if (res.success) {
            setData(res);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Analytics</h2>
                    <p className="text-gray-500 mt-1">Monitor your store's performance.</p>
                </div>

                {/* Period Selector */}
                <div className="bg-white p-1 rounded-md border border-gray-200 flex items-center shadow-sm w-fit">
                    {(['week', 'month', 'year'] as AnalyticsPeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all capitalize ${period === p
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center text-gray-400">Loading data...</div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                    <DollarSign size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Revenue</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                ₹{Number(data?.totalRevenue || 0).toFixed(2)}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <TrendingUp size={14} className="text-purple-500" />
                                Total earnings for this {period}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                                    <ShoppingBag size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Orders</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                {data?.totalOrders || 0}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar size={14} className="text-teal-500" />
                                Orders placed this {period}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">AOV</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                ₹{Number(data?.averageOrderValue || 0).toFixed(2)}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <DollarSign size={14} className="text-amber-500" />
                                Average order value
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <Users size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">New Customers</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                {data?.newCustomersCount || 0}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar size={14} className="text-blue-500" />
                                Joined this {period}
                            </p>
                        </motion.div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Revenue Trend - Line Chart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm lg:col-span-2"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Track your revenue performance over time. Shows daily/monthly trends based on selected period.">
                                    <LineIcon size={18} className="text-gray-400" /> Revenue Trend
                                </h3>
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">INR (₹)</span>
                            </div>
                            <div className="h-[300px] w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickMargin={10} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} dot={{ r: 4, fill: '#8884d8' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Top Selling Products - Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Top 5 products ranked by quantity sold. Helps identify your most popular items.">
                                    <BarChart3 size={18} className="text-gray-400" /> Best Sellers
                                </h3>
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">By Quantity</span>
                            </div>
                            <div className="h-[300px] w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.productData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="sales" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Category Distribution - Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Distribution of sales across product categories. Shows which categories are most popular.">
                                    <PieIcon size={18} className="text-gray-400" /> Category Breakdown
                                </h3>
                            </div>
                            <div className="h-[300px] w-full text-xs relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data?.categoryData?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any, props: any) => [`${value} sold`, props.payload.name]} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center">
                                    <span className="text-2xl font-bold text-gray-900">{data?.categoryData?.reduce((a: any, b: any) => a + b.value, 0) || 0}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-gray-400">Total Items</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Fulfillment Rate - Completed vs Cancelled */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Success rate: Completed orders vs Cancelled orders. Green indicates successful deliveries, Red shows cancellations.">
                                    <PieIcon size={18} className="text-gray-400" /> Fulfillment Rate
                                </h3>
                            </div>
                            <div className="h-[300px] w-full text-xs relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data?.statusData?.map((entry: any, index: number) => {
                                                const color = entry.name === 'Cancelled' ? '#ff4d4f' : '#52c41a';
                                                return <Cell key={`cell-${index}`} fill={color} stroke="none" />;
                                            })}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any, props: any) => [`${value} orders`, props.payload.name]} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center">
                                    <span className="text-2xl font-bold text-gray-900">{data?.statusData?.reduce((a: any, b: any) => a + b.value, 0) || 0}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-gray-400">Total Orders</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Gender Distribution - Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Revenue breakdown by product gender category (Men's, Women's, Unisex). Helps identify target audience preferences.">
                                    <PieIcon size={18} className="text-gray-400" /> Revenue by Gender
                                </h3>
                            </div>
                            <div className="h-[300px] w-full text-xs relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.genderData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                        >
                                            {data?.genderData?.map((entry: any, index: number) => {
                                                let color = '#8884d8';
                                                if (entry.name === 'MEN') color = '#1890ff';
                                                else if (entry.name === 'WOMEN') color = '#ff85c0';
                                                else color = '#52c41a';

                                                return <Cell key={`cell-${index}`} fill={color} stroke="none" />;
                                            })}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any, props: any) => [`₹${Number(value).toFixed(2)}`, props.payload.name]} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center">
                                    <span className="text-2xl font-bold text-gray-900">₹{data?.genderData?.reduce((a: any, b: any) => a + b.revenue, 0).toFixed(0) || 0}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-gray-400">Total Revenue</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Low Stock Alert */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Products with stock below 10 units. Reorder these items soon to avoid running out.">
                                    <AlertTriangle size={18} className="text-orange-500" /> Low Stock Alert
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                                    data.lowStockProducts.map((product: any) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-md border border-orange-100">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">₹{Number(product.price).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-orange-500" />
                                                <span className="text-sm font-bold text-orange-600">{product.stock}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">All products are well-stocked!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Rating Analytics */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 cursor-help" title="Customer satisfaction ratings for this period. Shows average rating and distribution across all star levels.">
                                    <Star size={18} className="text-gray-400" /> Customer Ratings
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {/* Average Rating */}
                                <div className="text-center pb-4 border-b border-gray-100">
                                    <div className="text-4xl font-bold text-gray-900 mb-1">
                                        {data?.averageRating ? data.averageRating.toFixed(1) : '0.0'}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={star <= Math.round(data?.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">{data?.totalReviews || 0} reviews</p>
                                </div>

                                {/* Rating Distribution */}
                                <div className="space-y-2">
                                    {data?.ratingDistribution?.map((item: any) => {
                                        const percentage = data.totalReviews > 0
                                            ? (item.count / data.totalReviews) * 100
                                            : 0;
                                        return (
                                            <div key={item.rating} className="flex items-center gap-2">
                                                <span className="text-xs text-gray-600 w-6">{item.rating}★</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </>
            )}
        </div>
    );
}
