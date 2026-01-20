'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, User, Search, LogOut, LayoutDashboard, Heart, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserSessionAction, logoutAction } from '@/app/actions/auth-custom';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<{ userId: string; role: string; name?: string | null; email?: string | null } | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Fetch session
        getUserSessionAction().then(session => {
            setUser(session);
        });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark py-3 shadow-sm' : 'bg-white/80 backdrop-blur-md py-4'} px-6`}>
            <div className="container flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button className="md:hidden text-foreground">
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
                        <Link href="/shop" className="hover:text-primary transition-colors">SHOP</Link>
                        <Link href="/collections" className="hover:text-primary transition-colors">COLLECTIONS</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">STORY</Link>
                    </div>
                </div>

                <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-serif font-bold tracking-widest hover:text-primary transition-colors text-foreground">
                    ASHBLOOM
                </Link>

                <div className="flex items-center gap-6 text-foreground">
                    <button className="hover:text-primary transition-colors">
                        <Search size={20} />
                    </button>

                    <Link href="/help" className="hover:text-primary transition-colors hidden md:block" title="Help & Support">
                        <HelpCircle size={20} />
                    </Link>

                    <Link href="/wishlist" className="hover:text-primary transition-colors group">
                        <Heart size={20} className="group-hover:fill-primary/20 transition-colors" />
                    </Link>

                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {user.name ? user.name.slice(0, 2).toUpperCase() : <User size={14} />}
                                </div>
                                <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
                                    {user.name || 'Account'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg border border-gray-100 rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>

                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium flex items-center gap-2">
                                        <LayoutDashboard size={14} /> Admin Dashboard
                                    </Link>
                                )}

                                <Link href="/orders" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium flex items-center gap-2">
                                    <ShoppingBag size={14} /> My Orders
                                </Link>

                                <Link href="/help" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium flex items-center gap-2 md:hidden">
                                    <HelpCircle size={14} /> Help & Support
                                </Link>

                                <button
                                    onClick={async () => {
                                        await logoutAction();
                                        setUser(null);
                                        window.location.href = '/';
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium flex items-center gap-2"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="hover:text-primary transition-colors flex items-center gap-2">
                            <User size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Sign In</span>
                        </Link>
                    )}

                    <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-2 relative">
                        <ShoppingBag size={20} />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
