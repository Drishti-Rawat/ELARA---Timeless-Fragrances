'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, User, Search, LogOut, LayoutDashboard, Heart, HelpCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserSessionAction, logoutAction } from '@/app/actions/auth-custom';
import { getCartAction } from '@/app/actions/shop';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ isLanding = false }: { isLanding?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<{ userId: string; role: string; name?: string | null; email?: string | null } | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        const fetchCartCount = () => {
            getCartAction().then(res => {
                if (res.success && res.cart) {
                    const count = res.cart.items.reduce((acc, item) => acc + item.quantity, 0);
                    setCartCount(count);
                }
            });
        };

        // Fetch session and initial cart count
        getUserSessionAction().then(session => {
            setUser(session);
            if (session) {
                fetchCartCount();
            }
        });

        // Listen for cart updates
        window.addEventListener('cart-updated', fetchCartCount);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cart-updated', fetchCartCount);
        };
    }, []);

    // Navbar Background Logic
    const glassStyle = 'bg-surface/80 backdrop-blur-xl py-4';
    const navBackground = isLanding
        ? scrolled ? glassStyle : 'bg-transparent py-6'
        : glassStyle;

    // Logo Visibility Logic (for Landing Page animation)
    const logoOpacity = isLanding
        ? scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'
        : 'opacity-100 translate-y-0 pointer-events-auto';

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${navBackground} px-4 md:px-6`}>
                <div className="container flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            className="md:hidden text-neutral-900 hover:text-primary transition-colors relative z-50"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </motion.div>
                        </button>
                        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.15em] text-neutral-600">
                            <Link href="/shop" className="hover:text-primary transition-colors">SHOP</Link>
                            <Link href="/#collections" className="hover:text-primary transition-colors">COLLECTIONS</Link>
                            <Link href="/#story" className="hover:text-primary transition-colors">STORY</Link>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className={`absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-serif font-bold tracking-[0.2em] text-neutral-900 hover:text-primary transition-all duration-700 ${logoOpacity} z-50`}
                    >
                        ELARA
                    </Link>

                    <div className="flex items-center gap-3 md:gap-6 text-neutral-900 relative z-50">


                        <Link href="/help" className="hover:text-primary transition-colors hidden md:block" title="Help & Support">
                            <HelpCircle size={20} />
                        </Link>

                        {user ? (
                            <Link href="/wishlist" className="hover:text-primary transition-colors group">
                                <Heart size={20} className="group-hover:fill-primary/20 transition-colors" />
                            </Link>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} className="hover:text-primary transition-colors group">
                                <Heart size={20} className="group-hover:fill-primary/20 transition-colors" />
                            </button>
                        )}

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                        {user.name ? user.name.slice(0, 2).toUpperCase() : <User size={14} />}
                                    </div>
                                    <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
                                        {user.name || 'Account'}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl border border-neutral-100 rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                                    <div className="px-4 py-3 border-b border-neutral-50 mb-1">
                                        <p className="text-sm font-bold text-neutral-900 truncate">{user.name || 'User'}</p>
                                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                    </div>

                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin" className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary font-medium flex items-center gap-2">
                                            <LayoutDashboard size={14} /> Admin Dashboard
                                        </Link>
                                    )}

                                    <Link href="/orders" className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary font-medium flex items-center gap-2">
                                        <ShoppingBag size={14} /> My Orders
                                    </Link>

                                    <Link href="/help" className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary font-medium flex items-center gap-2 md:hidden">
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

                        {user ? (
                            <Link href="/cart" id="nav-cart-icon" className="hover:text-primary transition-colors flex items-center gap-2 relative">
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} id="nav-cart-icon" className="hover:text-primary transition-colors flex items-center gap-2 relative">
                                <ShoppingBag size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 bg-surface/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                                }
                            }}
                            className="flex flex-col items-center gap-6 text-2xl font-serif text-neutral-900"
                        >
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Shop</Link>
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                <Link href="/#collections" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Collections</Link>
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                <Link href="/#story" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Story</Link>
                            </motion.div>

                            {user && (
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-px bg-neutral-200 my-2" />
                                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors text-lg">My Orders</Link>
                                    <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors text-lg">Wishlist</Link>
                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors text-lg">Admin Dashboard</Link>
                                    )}
                                    <button
                                        onClick={async () => {
                                            await logoutAction();
                                            setUser(null);
                                            setMobileMenuOpen(false);
                                            window.location.href = '/';
                                        }}
                                        className="text-red-500 hover:text-red-600 transition-colors text-lg mt-2"
                                    >
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}

                            {!user && (
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors text-lg font-sans uppercase tracking-widest mt-4">
                                        Sign In
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors text-sm font-sans uppercase tracking-widest text-neutral-400 mt-8">Help & Support</Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-8 md:p-12 max-w-sm w-full shadow-2xl relative text-center border border-neutral-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <User size={24} />
                            </div>

                            <h3 className="font-serif text-2xl text-neutral-900 mb-2">Member Access</h3>
                            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                                Please sign in to access your account and exclusive collections.
                            </p>

                            <Link
                                href="/login"
                                className="block w-full bg-neutral-900 text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors mb-4"
                            >
                                Sign In
                            </Link>

                            <p className="text-xs text-neutral-400">
                                New here? <Link href="/login" className="text-neutral-900 underline hover:text-primary transition-colors">Create an account</Link>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
