'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { ChevronDown, Mail, Phone, Instagram, Globe, Code, Palette, Zap, Shield, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
    {
        question: "How do I track my order?",
        answer: "Once your order is shipped, you'll receive a tracking number via email. You can also view your tracking number by visiting the 'My Orders' section in your account."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused products in their original packaging. Contact our support team to initiate a return."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes! We ship to over 50 countries worldwide. International shipping times vary by location but typically take 7-14 business days."
    },
    {
        question: "How can I cancel my order?",
        answer: "You can cancel your order if it's still in 'PENDING' or 'PROCESSING' status. Go to 'My Orders', find your order, and click the 'Cancel' button."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed securely."
    },
    {
        question: "How do I change my delivery address?",
        answer: "If your order is still in 'PENDING' or 'PROCESSING' status, you can edit the delivery address from your order details page."
    }
];

export default function HelpSupportPage() {
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-32 pb-12 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-foreground">How can we help you?</h1>
                            <p className="text-neutral-500 text-sm font-light">Find answers to common questions or contact our support team</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-neutral-200">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`pb-3 px-1 font-medium text-xs uppercase tracking-widest transition-colors relative ${activeTab === 'faq' ? 'text-primary' : 'text-neutral-400 hover:text-foreground'
                                }`}
                        >
                            FAQ
                            {activeTab === 'faq' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`pb-3 px-1 font-medium text-xs uppercase tracking-widest transition-colors relative ${activeTab === 'contact' ? 'text-primary' : 'text-neutral-400 hover:text-foreground'
                                }`}
                        >
                            Contact Us
                            {activeTab === 'contact' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    {activeTab === 'faq' ? (
                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-sm border border-neutral-100 overflow-hidden group hover:border-primary/30 transition-all">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface/50 transition-colors"
                                    >
                                        <span className={`font-medium pr-4 font-serif transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>{faq.question}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-neutral-400 shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-primary' : ''
                                                }`}
                                        />
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                            }`}
                                    >
                                        <div className="px-6 py-4 bg-surface text-neutral-600 text-sm border-t border-neutral-100 font-light leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Instagram Support */}
                            {/* Instagram Support */}
                            <div className="bg-white rounded-sm border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-primary border border-primary/20">
                                        <Instagram size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif font-bold mb-1 text-foreground">Instagram Support</h3>
                                        <p className="text-sm text-neutral-500 mb-3 font-light">Get quick assistance via Instagram DM</p>
                                        <div className="mb-3">
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Follow & Message Us</p>
                                            <a
                                                href="https://www.instagram.com/tristella.studio"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-serif text-lg text-primary hover:underline"
                                            >
                                                @tristella.studio
                                            </a>
                                        </div>
                                        <a
                                            href="https://www.instagram.com/tristella.studio"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-black hover:bg-primary text-white px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 transition-all"
                                        >
                                            <Instagram size={14} /> Visit Instagram
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email Support */}
                            {/* Email Support */}
                            <div className="bg-white rounded-sm border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-primary border border-primary/20">
                                        <Mail size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif font-bold mb-1 text-foreground">Email Support</h3>
                                        <p className="text-sm text-neutral-500 mb-3 font-light">Send us a detailed message</p>
                                        <a href="mailto:hello@tristella.studio" className="text-primary hover:underline font-serif text-lg">
                                            hello@tristella.studio
                                        </a>
                                        <p className="text-[10px] text-neutral-400 mt-2 uppercase tracking-wide">We typically respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            {/* Quick Tips */}
                            <div className="bg-primary/5 rounded-sm border border-primary/10 p-6">
                                <h3 className="font-serif font-bold mb-4 text-primary">Quick Tips</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <span className="text-primary font-serif font-bold shrink-0">1.</span>
                                        <div>
                                            <p className="font-bold text-sm text-foreground mb-0.5">Check our FAQ section first</p>
                                            <p className="text-xs text-neutral-500 font-light">Most common questions are already answered</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-primary font-serif font-bold shrink-0">2.</span>
                                        <div>
                                            <p className="font-bold text-sm text-foreground mb-0.5">Provide detailed information</p>
                                            <p className="text-xs text-neutral-500 font-light">Include screenshots or error messages when reporting issues</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-primary font-serif font-bold shrink-0">3.</span>
                                        <div>
                                            <p className="font-bold text-sm text-foreground mb-0.5">Instagram for urgent matters</p>
                                            <p className="text-xs text-neutral-500 font-light">Get faster responses for time-sensitive issues</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agency Promotion Section */}
            <div className="py-20 px-4 bg-foreground text-white mt-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-block bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-primary">
                                Built by Professionals
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-white">Want to Build Something Like This?</h2>
                            <p className="text-neutral-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                                This e-commerce platform was crafted by our expert web development team.
                                We specialize in building custom, scalable solutions for businesses of all sizes.
                            </p>
                        </motion.div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-sm border border-white/10 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-transparent border border-white/20 rounded-full flex items-center justify-center mb-6 text-white group-hover:text-primary group-hover:border-primary transition-colors">
                                <Code size={20} />
                            </div>
                            <h3 className="font-serif text-xl mb-3 text-white">Custom Development</h3>
                            <p className="text-neutral-400 text-sm font-light leading-relaxed">Tailored web applications built with modern technologies like Next.js, React, and Node.js</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-sm border border-white/10 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-transparent border border-white/20 rounded-full flex items-center justify-center mb-6 text-white group-hover:text-primary group-hover:border-primary transition-colors">
                                <Palette size={20} />
                            </div>
                            <h3 className="font-serif text-xl mb-3 text-white">UI/UX Design</h3>
                            <p className="text-neutral-400 text-sm font-light leading-relaxed">Beautiful, intuitive interfaces that provide exceptional user experiences</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-sm border border-white/10 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-transparent border border-white/20 rounded-full flex items-center justify-center mb-6 text-white group-hover:text-primary group-hover:border-primary transition-colors">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-serif text-xl mb-3 text-white">Performance Optimization</h3>
                            <p className="text-neutral-400 text-sm font-light leading-relaxed">Lightning-fast applications optimized for speed and SEO</p>
                        </motion.div>
                    </div>

                    {/* Contact CTA */}
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-sm border border-white/10 p-10 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

                        <div className="grid md:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h3 className="text-3xl font-serif text-white mb-6">Ready to Start Your Project?</h3>
                                <p className="text-neutral-400 mb-8 font-light leading-relaxed">
                                    Let's discuss how we can bring your vision to life. Our team is ready to help you build
                                    a powerful digital presence.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Inquiries</p>
                                            <a href="mailto:hello@tristella.studio" className="font-serif text-lg text-white hover:text-primary transition-colors">
                                                hello@tristella.studio
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Visit Studio</p>
                                            <a href="https://tristella.studio" target="_blank" rel="noopener noreferrer" className="font-serif text-lg text-white hover:text-primary transition-colors">
                                                tristella.studio
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-sm p-8 border border-white/5">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 border-b border-white/10 pb-4">Why Choose Us?</h4>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Shield className="text-primary shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-bold text-white text-sm mb-1">Modern Architecture</p>
                                            <p className="text-xs text-neutral-400 font-light">Built with the latest, scalable web technologies.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Users className="text-primary shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-bold text-white text-sm mb-1">Personalized Approach</p>
                                            <p className="text-xs text-neutral-400 font-light">Direct collaboration and undivided attention.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Award className="text-primary shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-bold text-white text-sm mb-1">Commitment to Quality</p>
                                            <p className="text-xs text-neutral-400 font-light">We don't just build sites; we craft digital legacies.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
