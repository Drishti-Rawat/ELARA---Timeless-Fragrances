'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAction } from '../actions/auth-custom';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        await logoutAction();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-surface p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-2">Welcome back. Overview of your boutique.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="btn btn-outline">View Site</Link>
                        <button
                            onClick={handleLogout}
                            className="btn bg-black text-white hover:bg-gray-800"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Products Card */}
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                            <span className="text-xl font-serif">P</span>
                        </div>
                        <h2 className="text-xl font-serif mb-4">Products</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">Manage your perfume collection. Add new scents, update pricing, and manage inventory stock.</p>
                        <button className="btn btn-primary w-full">Manage Products</button>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                            <span className="text-xl font-serif">O</span>
                        </div>
                        <h2 className="text-xl font-serif mb-4">Orders</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">Track and fulfill customer orders. Print shipping labels and manage returns.</p>
                        <button className="btn btn-outline w-full">View Orders</button>
                    </div>

                    {/* Users Card */}
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                            <span className="text-xl font-serif">C</span>
                        </div>
                        <h2 className="text-xl font-serif mb-4">Customers</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">View your VIP client list, manage accounts, and respond to inquiries.</p>
                        <button className="btn btn-outline w-full">View Customers</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
