'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsAction, getUsersAction, getOrdersAction } from '../actions/admin';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    // Data State
    const [stats, setStats] = useState({
        products: 0,
        users: 0,
        orders: 0,
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const [prods, usrs, ords] = await Promise.all([
                getProductsAction(),
                getUsersAction(),
                getOrdersAction()
            ]);

            const productsCount = prods.success && prods.products ? prods.products.length : 0;
            const usersCount = usrs.success && usrs.users ? usrs.users.length : 0;
            const ordersList = ords.success && ords.orders ? ords.orders : [];

            // Calculate Revenue
            const totalRevenue = ordersList.reduce((acc: number, order: any) => acc + Number(order.total), 0);

            setStats({
                products: productsCount,
                users: usersCount,
                orders: ordersList.length,
                revenue: totalRevenue
            });

            setRecentOrders(ordersList.slice(0, 5));
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center text-gray-400">Loading dashboard data...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Welcome back, Admin.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`$${stats.revenue.toFixed(2)}`}
                    icon={<TrendingUp className="text-emerald-600" size={24} />}
                />
                <StatCard
                    label="Total Orders"
                    value={stats.orders.toString()}
                    icon={<ShoppingBag className="text-blue-600" size={24} />}
                />
                <StatCard
                    label="Platform Users"
                    value={stats.users.toString()}
                    icon={<Users className="text-purple-600" size={24} />}
                />
                <StatCard
                    label="Products"
                    value={stats.products.toString()}
                    icon={<Package className="text-orange-600" size={24} />}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Orders Widget */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-lg font-bold text-gray-900">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-xs font-medium text-gray-500 hover:text-black cursor-pointer">View All</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No orders yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">${Number(order.total).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="relative z-10">
                        <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
                        <p className="text-gray-500 text-sm mb-6">Manage your store efficiently.</p>

                        <div className="space-y-3">
                            <Link href="/admin/products" className="group w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors border border-gray-100 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-full text-gray-400 group-hover:text-black transition-colors shadow-sm border border-gray-100">
                                    <Package size={16} />
                                </span>
                                <span className="text-gray-700 group-hover:text-black">Add New Product</span>
                            </Link>
                            <Link href="/admin/orders" className="group w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors border border-gray-100 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-full text-gray-400 group-hover:text-black transition-colors shadow-sm border border-gray-100">
                                    <ShoppingBag size={16} />
                                </span>
                                <span className="text-gray-700 group-hover:text-black">Process Pending Orders</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">{value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-md group-hover:bg-gray-100 transition-colors">
                    {icon}
                </div>
            </div>
        </div>
    );
}
