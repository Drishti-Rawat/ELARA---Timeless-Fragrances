'use client';

import { Truck, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth-custom';
import { useRouter } from 'next/navigation';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const handleLogout = async () => {
        await logoutAction();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface)] flex flex-col font-sans">
            {/* Mobile Header - Premium Glass */}
            <header className="fixed top-0 left-0 right-0 z-40 glass h-16 flex items-center justify-between px-5 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm">
                        <Truck size={16} />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-lg text-[var(--color-foreground)] leading-none tracking-tight">ELARA</h1>
                        <p className="text-[10px] text-[var(--color-primary)] font-medium tracking-[0.2em] uppercase">Delivery</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-[var(--color-foreground)] rounded-full transition-colors"
                        aria-label="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-surface-highlight)] border border-white flex items-center justify-center text-xs font-serif font-bold text-[var(--color-primary)] ring-1 ring-neutral-100 ring-offset-1">
                        DA
                    </div>
                </div>
            </header>

            {/* Content - Padded for fixed header */}
            <main className="flex-1 pt-20 pb-8 px-4 max-w-lg mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
