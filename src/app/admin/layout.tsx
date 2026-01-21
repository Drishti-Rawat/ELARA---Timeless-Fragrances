'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, ShoppingBag, LogOut, BarChart3, Star, Tag, Percent, Truck, DollarSign } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth-custom';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logoutAction();
        router.push('/login');
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-foreground)]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex fixed h-full z-10 font-sans">
                <div className="p-8">
                    <h1 className="text-2xl font-serif font-bold text-[var(--color-foreground)] tracking-tight">ELARA</h1>
                    <p className="text-xs text-[var(--color-primary)] tracking-[0.2em] uppercase mt-1 pl-0.5">Admin Console</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <SidebarItem href="/admin" icon={<LayoutDashboard size={18} />} label="Overview" active={pathname === '/admin'} />
                    <SidebarItem href="/admin/analytics" icon={<BarChart3 size={18} />} label="Analytics & Sales" active={pathname.startsWith('/admin/analytics')} />
                    <SidebarItem href="/admin/categories" icon={<Package size={18} />} label="Categories" active={pathname.startsWith('/admin/categories')} />
                    <SidebarItem href="/admin/products" icon={<ShoppingBag size={18} />} label="Products" active={pathname.startsWith('/admin/products')} />
                    <SidebarItem href="/admin/users" icon={<Users size={18} />} label="Platform Users" active={pathname.startsWith('/admin/users')} />
                    <SidebarItem href="/admin/orders" icon={<ShoppingBag size={18} />} label="Orders" active={pathname.startsWith('/admin/orders')} />
                    <SidebarItem href="/admin/reviews" icon={<Star size={18} />} label="Reviews" active={pathname.startsWith('/admin/reviews')} />
                    <SidebarItem href="/admin/sales" icon={<Percent size={18} />} label="Sales" active={pathname.startsWith('/admin/sales')} />
                    <SidebarItem href="/admin/coupons" icon={<Tag size={18} />} label="Coupons" active={pathname.startsWith('/admin/coupons')} />
                    <SidebarItem href="/admin/agents" icon={<Truck size={18} />} label="Delivery Agents" active={pathname.startsWith('/admin/agents')} />
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full p-2.5 rounded-sm group">
                        <LogOut size={18} className="group-hover:stroke-red-600 transition-colors" />
                        Sign Out
                    </button>
                    <Link href="/" className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-black transition-colors w-full p-2.5 mt-1 rounded-sm">
                        <span className="w-4.5 flex justify-center text-lg leading-none">↗</span>
                        <span className="text-xs tracking-wide uppercase">Open Store</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen w-full bg-[var(--color-surface)]">
                <div className="max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm
            ${active
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
