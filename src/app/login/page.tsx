'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, User, Loader, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sendOtpAction, verifyOtpAction, registerUserAction } from '../actions/auth-custom';

type Step = 'EMAIL' | 'OTP' | 'NAME' | 'ADDRESS';

export default function AuthPage() {
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await sendOtpAction(email);
        if (res.success) {
            setStep('OTP');
        } else {
            setError(res.error || "Failed to send code");
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await verifyOtpAction(email, otp);

        if (!res.success) {
            setError(res.error || "Invalid code");
            setLoading(false);
            return;
        }

        if (res.status === 'EXISTING_USER') {
            // Existing user logic
            if (res.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } else {
            // New User
            setStep('NAME');
        }
        setLoading(false);
    };

    const handleRegister = async (skipAddress = false) => {
        setLoading(true);
        const res = await registerUserAction({
            email,
            name,
            phone,
            address: skipAddress ? undefined : address
        });

        if (res.success) {
            router.push('/');
        } else {
            setError(res.error || "Registration failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-surface">
            {/* Left Side - Image */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden">
                <Image
                    src="/auth-bg.png"
                    alt="Luxury Perfume"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-10 left-10 text-white z-10">
                    <p className="text-sm tracking-[0.3em] uppercase mb-2 opacity-90">Collection 2026</p>
                    <h2 className="text-4xl font-serif">Essence of <br /> Elegance</h2>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
                <Link href="/" className="absolute top-8 right-8 text-sm font-medium tracking-wide text-gray-500 hover:text-black transition-colors">
                    RETURN HOME
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-serif font-bold mb-3 text-foreground">
                            {step === 'EMAIL' && 'Welcome'}
                            {step === 'OTP' && 'Verify Identity'}
                            {step === 'NAME' && 'Complete Profile'}
                            {step === 'ADDRESS' && 'Add Address'}
                        </h1>
                        <p className="text-gray-500">
                            {step === 'EMAIL' && 'Enter your email to continue with ELARA.'}
                            {step === 'OTP' && `Enter the code sent to ${email}`}
                            {step === 'NAME' && 'Tell us what to call you.'}
                            {step === 'ADDRESS' && 'Where should we send your essence?'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'EMAIL' && (
                            <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="name@example.com" required />
                                    </div>
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button type="submit" disabled={loading} className="btn-block">
                                    {loading ? <Loader className="animate-spin" size={18} /> : 'Send Code'}
                                </button>
                            </motion.form>
                        )}

                        {step === 'OTP' && (
                            <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-6">
                                {/* Email Field (Read Only) */}
                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" value={email} disabled className="input-field bg-gray-50 cursor-not-allowed" />
                                    </div>
                                </div>

                                {/* OTP Input - Single Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Verification Code</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="input-field text-center text-2xl font-serif tracking-[0.75em] h-14 border-gray-300 focus:border-black transition-all placeholder:text-gray-200"
                                            placeholder="000000"
                                            required
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">Enter the 6-digit code sent to your email.</p>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                <button type="submit" disabled={loading} className="btn-block">
                                    {loading ? <Loader className="animate-spin" size={18} /> : 'Verify & Continue'}
                                </button>

                                <div className="flex justify-between items-center text-xs">
                                    <button type="button" onClick={() => setStep('EMAIL')} className="text-gray-400 hover:text-black transition-colors underline decoration-gray-300 underline-offset-4">
                                        Change Email
                                    </button>
                                    <button type="button" onClick={handleSendOtp} className="text-gray-400 hover:text-black transition-colors">
                                        Resend Code
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {step === 'NAME' && (
                            <motion.form key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={(e) => { e.preventDefault(); setStep('ADDRESS'); }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+1 234 567 8900" required />
                                    </div>
                                </div>
                                <button type="submit" className="btn-block">Continue</button>
                            </motion.form>
                        )}

                        {step === 'ADDRESS' && (
                            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-3">
                                    <input type="text" placeholder="Street Address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-field" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
                                        <input type="text" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-field" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="ZIP Code" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} className="input-field" />
                                        <input type="text" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="input-field" />
                                    </div>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <button onClick={() => handleRegister(false)} disabled={loading} className="btn-block">
                                        {loading ? <Loader className="animate-spin" size={18} /> : 'Save & Login'}
                                    </button>
                                    <button onClick={() => handleRegister(true)} disabled={loading} className="w-full text-center text-sm text-gray-500 hover:text-black">
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>

            <style jsx>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.75rem; /* Left padding for icons */
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.125rem;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 1px var(--primary);
        }
        .btn-block {
            width: 100%;
            background: var(--foreground);
            color: var(--background);
            padding: 0.875rem;
            border-radius: 0.125rem;
            font-weight: 500;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            border: none;
        }
        .btn-block:hover {
            background: var(--primary);
        }
        .btn-block:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
