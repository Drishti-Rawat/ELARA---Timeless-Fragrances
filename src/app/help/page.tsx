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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-32 pb-12 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">How can we help you?</h1>
                            <p className="text-gray-600 text-sm">Find answers to common questions or contact our support team</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'faq' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            FAQ
                            {activeTab === 'faq' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'contact' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
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
                                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                            }`}
                                    >
                                        <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Instagram Support */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                        <Instagram className="text-white" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">Instagram Support</h3>
                                        <p className="text-sm text-gray-600 mb-3">Get quick assistance via Instagram DM</p>
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500 mb-1">Follow & Message Us</p>
                                            <a
                                                href="https://instagram.com/elara"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-lg text-primary hover:underline"
                                            >
                                                @elara
                                            </a>
                                        </div>
                                        <a
                                            href="https://instagram.com/elara"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2 transition-all"
                                        >
                                            <Instagram size={16} /> Visit Instagram
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email Support */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="text-primary" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">Email Support</h3>
                                        <p className="text-sm text-gray-600 mb-3">Send us a detailed message</p>
                                        <a href="mailto:support@elara.com" className="text-primary hover:underline font-medium">
                                            support@elara.com
                                        </a>
                                        <p className="text-xs text-gray-500 mt-2">We typically respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
                                <h3 className="font-bold mb-3 text-gray-900">Quick Tips</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <span className="text-primary font-bold shrink-0">1</span>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">Check our FAQ section first</p>
                                            <p className="text-xs text-gray-600">Most common questions are already answered</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-primary font-bold shrink-0">2</span>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">Provide detailed information</p>
                                            <p className="text-xs text-gray-600">Include screenshots or error messages when reporting issues</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-primary font-bold shrink-0">3</span>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">Instagram for urgent matters</p>
                                            <p className="text-xs text-gray-600">Get faster responses for time-sensitive issues</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agency Promotion Section */}
            <div className="py-16 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white mt-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-block bg-primary/20 px-4 py-1 rounded-full text-sm font-medium mb-4">
                                Built by Professionals
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to Build Something Like This?</h2>
                            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                                This e-commerce platform was crafted by our expert web development team.
                                We specialize in building custom, scalable solutions for businesses of all sizes.
                            </p>
                        </motion.div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20"
                        >
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                                <Code size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Custom Development</h3>
                            <p className="text-gray-300 text-sm">Tailored web applications built with modern technologies like Next.js, React, and Node.js</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20"
                        >
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <Palette size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">UI/UX Design</h3>
                            <p className="text-gray-300 text-sm">Beautiful, intuitive interfaces that provide exceptional user experiences</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20"
                        >
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Performance Optimization</h3>
                            <p className="text-gray-300 text-sm">Lightning-fast applications optimized for speed and SEO</p>
                        </motion.div>
                    </div>

                    {/* Contact CTA */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h3>
                                <p className="text-gray-300 mb-6">
                                    Let's discuss how we can bring your vision to life. Our team is ready to help you build
                                    a powerful digital presence.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-primary" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-400">Email Us</p>
                                            <a href="mailto:contact@yourdevagency.com" className="font-medium hover:text-primary transition-colors">
                                                contact@yourdevagency.com
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="text-primary" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-400">Call Us</p>
                                            <a href="tel:+919205189679" className="font-medium hover:text-primary transition-colors">
                                                +91 9205189679
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-primary" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-400">Visit Website</p>
                                            <a href="https://yourdevagency.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary transition-colors">
                                                www.yourdevagency.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-6">
                                <h4 className="font-bold mb-4">Why Choose Us?</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Shield className="text-green-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="font-medium text-sm">Secure & Scalable</p>
                                            <p className="text-xs text-gray-300">Enterprise-grade security and infrastructure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="text-purple-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="font-medium text-sm">Dedicated Support</p>
                                            <p className="text-xs text-gray-300">24/7 maintenance and support services</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Award className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="font-medium text-sm">Proven Track Record</p>
                                            <p className="text-xs text-gray-300">50+ successful projects delivered</p>
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
