'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Star, Sparkles, Droplets, Flower2, ShoppingBag, Clock, FlaskConical, Fingerprint, X, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { checkUserSession } from "@/app/actions/check-session";

interface LandingPageProps {
    categories: {
        id: string;
        name: string;
        image: string | null;
    }[];
    bestSellers: {
        id: string;
        name: string;
        price: number | string;
        description: string;
        images: string[];
    }[];
}

export default function LandingPage({ categories, bestSellers }: LandingPageProps) {
    const containerRef = useRef(null);
    const horizontalRef = useRef(null);
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const hasSession = await checkUserSession();
            setIsLoggedIn(hasSession);
        };
        checkSession();
    }, []);



    const handleProductClick = (productId: string) => {
        router.push(`/shop/${productId}`);
    };

    const handleCollectionClick = (categoryId: string) => {
        router.push(`/shop?category=${categoryId}`);
    };
    const [isProcessing, setIsProcessing] = useState(false);
    const [showStudioModal, setShowStudioModal] = useState(false);

    // Mouse position for 3D card effect (Centered)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Mouse position for Spotlight (Raw)
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        // Centered for rotation
        mouseX.set((clientX - left) - width / 2);
        mouseY.set((clientY - top) - height / 2);
        // Raw for spotlight
        cursorX.set(clientX - left);
        cursorY.set(clientY - top);
    }

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth spring physics for clearer animations
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // --- HERO ANIMATIONS (PRESERVED) ---
    // Bottle stays fixed initially, then scales slightly
    const bottleScale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);

    // 3D Rotation for the card
    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
    // Bottle moves down slightly as we scroll
    const bottleY = useTransform(smoothProgress, [0, 0.2], ["0%", "20%"]);

    // Text "ELARA" starts behind, massive, then scales down and reveals full opacity
    const titleScale = useTransform(smoothProgress, [0, 0.3], [1.5, 1]);
    const titleY = useTransform(smoothProgress, [0, 0.3], ["-10%", "-50%"]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.1], [0.5, 1]);

    // Content layers moving at different speeds (Parallax)
    const layer1Y = useTransform(smoothProgress, [0.05, 0.3], ["50%", "0%"]);
    const layerOpacity = useTransform(smoothProgress, [0.05, 0.25], [0, 1]);


    // --- HORIZONTAL SCROLL ANIMATION ---
    const { scrollYProgress: horizontalProgress } = useScroll({
        target: horizontalRef,
        offset: ["start end", "end start"]
    });
    const xTransform = useTransform(horizontalProgress, [0.2, 0.8], ["0%", "-75%"]);


    // --- ACTIONS ---


    return (
        <main
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="bg-surface text-neutral-900 selection:bg-primary/30 relative h-[300vh]"
        >
            <Navbar isLanding={true} />

            {/* --- CINEMATIC INTRO CURTAIN --- */}
            <motion.div
                initial={{ y: "0%" }}
                animate={{ y: "-100%" }}
                transition={{ delay: 2.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-50 bg-[#f4f1ea] flex flex-col items-center justify-center gap-4 pointer-events-none"
            >
                <div className="overflow-hidden">
                    <motion.h1
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="text-neutral-900 font-serif text-4xl sm:text-5xl md:text-7xl tracking-[0.2em]"
                    >
                        ELARA
                    </motion.h1>
                </div>
                <div className="overflow-hidden">
                    <motion.span
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                        className="block text-neutral-500 text-[10px] md:text-sm uppercase tracking-[0.5em] font-light text-center px-4"
                    >
                        Timeless Fragrance
                    </motion.span>
                </div>
            </motion.div>

            {/* --- HERO SECTION --- */}
            <div className="fixed top-0 left-0 w-full h-[120vh] overflow-hidden z-0 bg-surface">

                {/* Texture Overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                {/* 1. Spotlight (Subtle Interactive) */}
                <motion.div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: useMotionTemplate`radial-gradient(circle 600px at ${cursorX}px ${cursorY}px, rgba(198, 168, 124, 0.06), transparent 80%)`
                    }}
                />

                {/* 3. Hero Content Container */}
                <div className="relative w-full h-screen flex flex-col items-center justify-center">

                    {/* Massive Background Text */}
                    <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3, duration: 1.5 }}
                            style={{ y: titleY }}
                            className="text-[28vw] font-serif font-medium leading-none text-neutral-900/5 select-none tracking-tight"
                        >
                            ELARA
                        </motion.h1>
                    </div>

                    {/* Central Bottle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.2, duration: 1.5, ease: "easeOut" }}
                        style={{
                            rotateX: rotateX,
                            rotateY: rotateY,
                            y: bottleY,
                            scale: bottleScale
                        }}
                        className="relative z-10 w-[60vw] md:w-[45vh] max-w-[300px] md:max-w-none aspect-[1/1.4] flex items-center justify-center"
                    >
                        {/* Glowing Aura behind bottle */}
                        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-75 animate-pulse" />

                        <Image
                            src="/images/landing/hero_abstract_branded.png"
                            alt="Elara Signature"
                            fill
                            priority
                            className="object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.1)]"
                        />

                        {/* Floating Labels */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 4, duration: 1 }}
                            className="absolute -left-8 md:-left-12 top-1/3 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-400 -rotate-90 origin-right whitespace-nowrap"
                        >
                            Est. 1985
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 4.2, duration: 1 }}
                            className="absolute -right-16 md:-right-20 bottom-1/3 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-400 rotate-90 origin-left whitespace-nowrap"
                        >
                            Paris
                        </motion.div>
                    </motion.div>

                    {/* Scroll Line Connection */}
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 100, opacity: 1 }}
                        transition={{ delay: 4.5, duration: 1.5 }}
                        className="absolute bottom-0 w-px bg-linear-to-b from-neutral-300 to-transparent z-20"
                    />

                </div>

                {/* Gradient Fade to Content */}
                <div className="absolute bottom-0 w-full h-48 bg-linear-to-b from-transparent to-surface" />
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="relative z-20 w-full pt-[80vh]">

                {/* INTRO TEXT CARD */}
                <motion.div
                    style={{ y: layer1Y, opacity: layerOpacity }}
                    className="container mx-auto px-6 mb-16 md:mb-24 flex justify-center md:justify-end pointer-events-auto"
                >
                    <div className="bg-white/80 backdrop-blur-xl p-6 md:p-12 w-full max-w-lg shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 rounded-sm">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 md:mb-6 text-neutral-900">Captured Elegance</h2>
                        <p className="text-neutral-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                            Elara isn't just a fragrance; it's a statement. Born from the intersection of nature's purity and the cosmos' mystery. Our signature scent encapsulates the feeling of golden hour sunlight touching pristine glass.
                        </p>
                        <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase border-b border-neutral-900 pb-1 hover:text-[#c6a87c] hover:border-[#c6a87c] transition-colors">
                            Explore The Shop <ArrowRight size={14} />
                        </Link>
                    </div>
                </motion.div>


                {/* --- CATEGORIES --- */}
                <section id="collections" className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-white to-surface/95 pointer-events-auto">
                    {/* Background Watermark - Pushed down to sit behind images */}
                    <div className="absolute top-1/6 left-1/2 -translate-x-1/2 text-[15vw] md:text-[18rem] leading-none font-serif text-neutral-900/2 select-none pointer-events-none whitespace-nowrap z-0">
                        COLLECTIONS
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8"
                        >
                            <div className="text-center md:text-left w-full md:w-auto">
                                {/* Decorative Separator */}
                                <div className="h-12 w-px bg-neutral-200 mx-auto md:mx-0 mb-6" />

                                <span className="text-primary uppercase tracking-[0.3em] text-xs font-bold mb-3 block">Discover Your Scent</span>
                                <h3 className="text-4xl md:text-6xl font-serif text-neutral-900">Curated Collections</h3>
                            </div>

                            <Link
                                href="/shop"
                                className="group flex items-center gap-2 text-neutral-900 hover:text-primary transition-colors pb-2 border-b border-neutral-300 hover:border-primary"
                            >
                                <span className="uppercase tracking-[0.2em] text-xs font-medium">View All</span>
                                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Staggered Grid Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-0 ">
                            {categories.slice(0, 4).map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 100 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                                    onClick={() => handleCollectionClick(category.id)}
                                    className={`group relative aspect-[3/4] w-full rounded-2xl overflow-hidden cursor-pointer ${index % 2 === 1 ? 'lg:mt-12' : ''}`}
                                >
                                    {/* Image Container */}
                                    <div className="absolute inset-0 bg-neutral-200">
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-[1200ms] group-hover:scale-110 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                                <span className="text-neutral-300 font-serif text-2xl italic">Elara</span>
                                            </div>
                                        )}
                                        {/* Gradient for Vertical Text Readability */}
                                        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                                    </div>

                                    {/* Vertical Collection Name */}
                                    <div className="absolute bottom-8 left-8 origin-bottom-left -rotate-90 translate-x-[10px] z-10">
                                        <h4 className="text-3xl md:text-4xl font-serif text-white tracking-widest whitespace-nowrap drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                                            {category.name}
                                        </h4>
                                    </div>

                                    {/* Number & Explore Overlay */}
                                    <div className="absolute top-6 right-6 z-10 overflow-hidden">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-mono text-[10px] text-white/70">0{index + 1}</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-6 z-10">
                                        <div className="bg-white/10 backdrop-blur-md rounded-full p-3 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out border border-white/20">
                                            <ArrowRight size={18} className="text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>


                    </div>
                </section>


                {/* --- BEST SELLERS --- */}
                <section id="shop" className="py-24 bg-surface pointer-events-auto">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8 md:gap-12"
                        >
                            <div className="text-center md:text-left w-full md:w-auto">
                                {/* Decorative Element: Star + Line */}
                                <div className="flex flex-col items-center md:items-start gap-4 mb-6">

                                    <div className="h-12 w-px bg-neutral-200" />
                                </div>

                                <span className="text-primary uppercase tracking-[0.3em] text-xs font-bold mb-3 block">
                                    Most Loved
                                </span>
                                <h3 className="text-4xl md:text-7xl font-serif text-neutral-900 leading-tight">
                                    The <span className="italic text-neutral-400 font-light">Icons</span>
                                </h3>
                            </div>

                            <Link
                                href="/shop"
                                className="group flex items-center gap-3 text-neutral-900 hover:text-primary transition-colors pb-2 border-b border-neutral-300 hover:border-primary"
                            >
                                <span className="uppercase tracking-[0.2em] text-xs font-medium">Shop All</span>
                                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 lg:px-20">
                            {bestSellers.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    onClick={() => handleProductClick(product.id)}
                                    className="group cursor-pointer"
                                >
                                    {/* Image Card - Enhanced */}
                                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f1ea] rounded-2xl border border-neutral-200/60 shadow-sm transition-shadow duration-300 group-hover:shadow-md">



                                        {/* Add to Cart (Minimal) */}
                                        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(product.id);
                                                }}
                                                className="bg-white text-neutral-900 p-2.5 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all"
                                            >
                                                <ShoppingBag size={14} />
                                            </button>
                                        </div>

                                        {/* Primary Image */}
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0"
                                        />

                                        {/* Secondary Image (Reveal on Hover) - Fallback to same if only 1 exists */}
                                        <Image
                                            src={product.images[1] || product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover absolute inset-0 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Clean Editorial Info */}
                                    <div className="mt-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="text-base font-serif text-neutral-900 leading-tight group-hover:underline decoration-neutral-300 underline-offset-4 transition-all">{product.name}</h4>
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1">Eau de Parfum</p>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            ${typeof product.price === 'number' ? product.price.toFixed(0) : product.price}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* --- HORIZONTAL SCROLL / PARALLAX --- */}
                {/* --- HORIZONTAL SCROLL / PARALLAX - HERITAGE --- */}
                <section id="story" ref={horizontalRef} className="bg-[#f4f1ea] text-neutral-900 h-[300vh] relative pointer-events-auto">
                    <div className="sticky top-0 h-screen overflow-hidden flex items-center">

                        {/* Background Watermark Title */}
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-[15vw] font-serif opacity-5 pointer-events-none select-none text-[#c6a87c] whitespace-nowrap">
                            LEGACY
                        </div>

                        <motion.div style={{ x: xTransform }} className="flex gap-12 md:gap-24 px-8 md:px-[10vw] w-max items-center">

                            {/* Intro Text for Scroll */}
                            <div className="w-[80vw] md:w-[30vw] shrink-0">
                                <span className="text-[#c6a87c] uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Our History</span>
                                <h3 className="text-4xl md:text-7xl font-serif mb-6 leading-[0.9]">
                                    A Timeline <br />
                                    <span className="italic font-light text-4xl md:text-6xl text-neutral-500">of Excellence</span>
                                </h3>
                                <p className="text-neutral-600 text-base md:text-lg max-w-sm mb-8 md:mb-12">
                                    Journey through the decades of mastering the art of olfactory perfume crafting.
                                </p>
                                <div className="flex items-center gap-4 text-neutral-400">
                                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                                    <div className="h-px w-12 bg-neutral-300"></div>
                                </div>
                            </div>

                            {/* Card 1: 1985 */}
                            <div className="relative shrink-0 group">
                                <div className="absolute -top-12 md:-top-20 -left-6 md:-left-10 text-6xl md:text-9xl font-serif text-[#c6a87c]/20 z-0 select-none">1985</div>
                                <div className="relative w-[80vw] md:w-[350px] aspect-[4/5] bg-white p-6 shadow-xl rotate-[-2deg] hover:rotate-0 transition-transform duration-700 z-10 flex flex-col">
                                    <div className="w-full h-[60%] relative overflow-hidden mb-6 filter sepia-[0.3]">
                                        <Image src="/images/landing/heritage_atelier.png" alt="Origins" fill className="object-cover" />
                                    </div>
                                    <span className="text-2xl font-serif italic text-[#c6a87c] mb-1 block">1985</span>
                                    <h4 className="text-xl md:text-2xl font-serif mb-2">The First Drop</h4>
                                    <p className="text-neutral-500 text-sm leading-relaxed">
                                        In a small attic in Grasse, the first formula for 'Lumina' was penned by candlelight.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: 2010 */}
                            <div className="relative shrink-0 group mt-12 md:mt-32">
                                <div className="absolute -top-12 md:-top-20 -right-6 md:-right-10 text-6xl md:text-9xl font-serif text-[#c6a87c]/20 z-0 select-none">2010</div>
                                <div className="relative w-[80vw] md:w-[350px] aspect-[4/5] bg-white p-6 shadow-xl rotate-[3deg] hover:rotate-0 transition-transform duration-700 z-10 flex flex-col">
                                    <div className="w-full h-[60%] relative overflow-hidden mb-6">
                                        <Image src="/images/landing/heritage_workshop.png" alt="Golden Era" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                    <span className="text-2xl font-serif italic text-[#c6a87c] mb-1 block">2010</span>
                                    <h4 className="text-xl md:text-2xl font-serif mb-2">Global Acclaim</h4>
                                    <p className="text-neutral-500 text-sm leading-relaxed">
                                        Expanding beyond borders, Elara became a symbol of quiet luxury in Tokyo and Paris.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: 2026 */}
                            <div className="relative shrink-0 group">
                                <div className="absolute -top-12 md:-top-20 -left-6 md:-left-10 text-6xl md:text-9xl font-serif text-[#c6a87c]/20 z-0 select-none">2026</div>
                                <div className="relative w-[80vw] md:w-[350px] aspect-[4/5] bg-white p-6 shadow-xl rotate-[-1deg] hover:rotate-0 transition-transform duration-700 z-10 flex flex-col">
                                    <div className="w-full h-[60%] relative overflow-hidden mb-6">
                                        <Image src="/images/landing/collection_light.png" alt="Modern Alchemy" fill className="object-cover" />
                                    </div>
                                    <span className="text-2xl font-serif italic text-[#c6a87c] mb-1 block">2026</span>
                                    <h4 className="text-xl md:text-2xl font-serif mb-2">Digital Rebirth</h4>
                                    <p className="text-neutral-500 text-sm leading-relaxed">
                                        Marrying tradition with technology to create bespoke scent profiles for the modern individual.
                                    </p>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </section>

                {/* --- HERITAGE / TIMELINE SECTION (Static Detail) --- */}
                <section className="py-16 md:py-24 bg-[#faf9f6] pointer-events-auto">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

                            {/* Image Side - Full Width & Immersive */}
                            <div className="order-2 md:order-1 relative w-full px-4 md:px-0">
                                <div className="relative w-full aspect-[4/3] group">
                                    {/* Image Container - Vintage Offset Shadow */}
                                    <div className="relative w-full h-full shadow-[12px_12px_0px_0px_rgba(198,168,124,0.25)] z-10 overflow-hidden border border-[#c6a87c]/40 group-hover:shadow-[16px_16px_0px_0px_rgba(198,168,124,0.25)] group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all duration-500 bg-neutral-100">
                                        <Image
                                            src="/images/landing/heritage_workshop.png"
                                            alt="Vintage Workshop"
                                            fill
                                            className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                                        />

                                        {/* Authentic Seal Overlay */}
                                        <div className="absolute bottom-6 right-6 w-20 h-20 bg-[#c6a87c]/95 rounded-full flex items-center justify-center text-[#faf9f6] font-serif text-[9px] tracking-widest text-center shadow-lg border-2 border-[#faf9f6]/30 backdrop-blur-sm z-20">
                                            <div className="leading-tight">
                                                EST.<br />
                                                <span className="font-bold text-xs">1985</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            {/* Text Side */}
                            <div className="order-1 md:order-2 space-y-6 pl-0 md:pl-8 py-4">
                                <div className="flex items-center gap-3 text-[#c6a87c]">
                                    <Clock size={14} />
                                    <span className="uppercase tracking-[0.3em] font-medium text-[10px]">Est. 1985</span>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-serif leading-[1.1] text-neutral-900">
                                    A Legacy of <br /> Uncompromising Artistry
                                </h2>

                                <div className="space-y-5 text-neutral-600 font-light text-base leading-relaxed">
                                    <p>
                                        Long before Elara became a global sensation, it was a whisper in a small, sunlit workshop. We started with a single drop of essence and a commitment to patience.
                                    </p>
                                    <div className="relative py-2">
                                        <p className="text-lg md:text-xl text-neutral-800 font-serif italic leading-relaxed">
                                            "We didn't expand for the sake of size. We expanded because the world needed more beauty."
                                        </p>
                                        <span className="block text-right mt-3 font-serif italic text-[#c6a87c] text-base opacity-80 decoration-slice">
                                            - Eleanor V., Founder
                                        </span>
                                    </div>

                                    {/* Core Values Pills */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {['Small Batch', 'Ethically Sourced', 'Hand Blended'].map((tag) => (
                                            <span key={tag} className="px-3 py-1.5 border border-neutral-300 rounded-full text-[10px] uppercase tracking-wider text-neutral-500 hover:border-[#c6a87c] hover:text-[#c6a87c] hover:bg-[#c6a87c]/5 transition-all cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button className="group text-neutral-900 border-b border-black pb-1 hover:text-[#c6a87c] hover:border-[#c6a87c] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest mt-4">
                                    Read Our Full Story <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>


                {/* --- CUSTOMIZATION (BESPOKE) - The Alchemist's Atelier (Coming Soon) --- */}
                {/* --- CUSTOMIZATION (BESPOKE) - The Alchemist's Atelier (Access Card Style) --- */}
                {/* --- CUSTOMIZATION (BESPOKE) - The Dark Atelier (Immersive) --- */}
                <section className="py-0 relative bg-[#050505] text-[#c6a87c] overflow-hidden border-t border-[#c6a87c]/20">

                    {/* Modal Logic (Preserved) */}
                    <AnimatePresence>
                        {showStudioModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                                onClick={() => setShowStudioModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#faf9f6] w-full max-w-md p-12 relative shadow-2xl overflow-hidden text-center text-neutral-900"
                                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setShowStudioModal(false)}
                                        className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors"
                                    >
                                        <X size={20} strokeWidth={1} />
                                    </button>

                                    {/* Modal Content */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-3xl font-serif mb-2">Tristella Studio</h3>
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Digital Masterpieces</p>
                                        </div>

                                        <div className="space-y-4 text-neutral-600 font-light text-sm leading-relaxed max-w-xs mx-auto">
                                            <p>This experience was crafted by Tristella Studio.</p>
                                            <p>Ready to elevate your digital presence?</p>
                                        </div>

                                        <div className="pt-4">
                                            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-2">Inquiries</p>
                                            <a href="mailto:hello@tristella.studio" className="text-xl font-serif text-neutral-900 hover:text-[#c6a87c] transition-colors">
                                                hello@tristella.studio
                                            </a>
                                        </div>

                                        <a
                                            href="https://tristella.studio"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full"
                                        >
                                            <button className="w-full bg-[#0a0a0a] text-white py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-[#c6a87c] transition-colors mt-4">
                                                Visit Studio
                                            </button>
                                        </a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Background Elements */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #c6a87c 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#c6a87c]/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="container mx-auto px-6 py-20 md:py-32 relative z-10 flex flex-col items-center justify-center min-h-[80vh]">

                        {/* Top Line */}
                        <div className="w-full max-w-xs h-px bg-linear-to-r from-transparent via-[#c6a87c]/50 to-transparent mb-8 md:mb-12"></div>

                        {/* Massive Typography - Part 1 */}
                        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#c6a87c]/10 pb-4 mb-8 text-center md:text-left">
                            <span className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-70 mb-2 md:mb-0">EST. 2026</span>
                            <h2 className="text-4xl md:text-8xl font-serif leading-none tracking-tight">THE ALCHEMIST</h2>
                        </div>

                        {/* Center Interaction Area */}
                        <div className="relative w-full py-8 md:py-12 flex flex-col items-center justify-center text-center">

                            <p className="max-w-xl text-neutral-400 font-light text-base md:text-lg mb-8 md:mb-12 leading-relaxed">
                                A forbidden archives of scent. <br />
                                <span className="text-[#c6a87c]">Unlock the restricted collection.</span>
                            </p>

                            <button
                                onClick={() => setShowStudioModal(true)}
                                className="group relative w-20 h-20 md:w-32 md:h-32 rounded-full border border-[#c6a87c]/30 flex items-center justify-center transition-all duration-700 hover:scale-110 hover:border-[#c6a87c]"
                            >
                                <div className="absolute inset-0 rounded-full border border-[#c6a87c] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"></div>
                                <div className="absolute inset-0 rounded-full bg-[#c6a87c]/5 blur-md group-hover:bg-[#c6a87c]/20 transition-all duration-700"></div>
                                <FlaskConical size={24} strokeWidth={1} className="text-[#c6a87c] relative z-10 group-hover:rotate-12 transition-transform duration-500 md:w-8 md:h-8" />
                            </button>

                            <span className="mt-6 text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-[#c6a87c]/70">Enter The Lab</span>

                        </div>

                        {/* Massive Typography - Part 2 */}
                        <div className="w-full flex justify-center md:justify-end items-start border-t border-[#c6a87c]/10 pt-4 mt-8">
                            <h2 className="text-4xl md:text-8xl font-serif leading-none tracking-tight text-center md:text-right w-full">ARCHIVE</h2>
                        </div>

                        {/* Bottom Line */}
                        <div className="w-full max-w-xs h-px bg-linear-to-r from-transparent via-[#c6a87c]/50 to-transparent mt-8 md:mt-12"></div>

                    </div>
                </section>


                {/* --- FOOTER --- */}
                <footer className="bg-surface  text-neutral-600 py-16 md:py-24 border-t border-neutral-200 relative z-20 pointer-events-auto">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16 md:mb-20">

                            {/* Brand Column */}
                            <div className="space-y-6">
                                <h4 className="text-3xl font-serif text-neutral-900 tracking-wide">ELARA</h4>
                                <p className="text-sm font-light leading-relaxed max-w-xs opacity-80">
                                    Crafting olfactory landscapes that transcend time. We believe in the power of scent to evoke memory and emotion.
                                </p>
                                <div className="flex gap-4 text-xs tracking-widest uppercase opacity-80">
                                    <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                                    <a href="#" className="hover:text-primary transition-colors">Pinterest</a>
                                </div>
                            </div>

                            {/* Shop Column */}
                            <div className="space-y-6">
                                <h5 className="text-neutral-900 text-xs uppercase tracking-[0.2em] font-bold">Shop</h5>
                                <ul className="space-y-4 text-sm font-light opacity-80">
                                    <li><a href="#" className="hover:text-primary transition-colors">All Fragrances</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Best Sellers</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Discovery Sets</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Gift Cards</a></li>
                                </ul>
                            </div>

                            {/* Explore Column */}
                            <div className="space-y-6">
                                <h5 className="text-neutral-900 text-xs uppercase tracking-[0.2em] font-bold">The World</h5>
                                <ul className="space-y-4 text-sm font-light opacity-80">
                                    <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Ingredient Library</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">The Journal</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
                                </ul>
                            </div>

                            {/* Newsletter Column */}
                            <div className="space-y-6">
                                <h5 className="text-neutral-900 text-xs uppercase tracking-[0.2em] font-bold">Newsletter</h5>
                                <p className="text-sm font-light opacity-80">
                                    Join our inner circle for early access and exclusive drops.
                                </p>
                                <div className="flex border-b border-neutral-300 py-2 focus-within:border-primary transition-colors">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="bg-transparent w-full outline-none text-neutral-900 text-sm placeholder-neutral-400 font-light"
                                    />
                                    <button className="text-neutral-400 hover:text-primary transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-8 md:pt-12 border-t border-neutral-200 gap-4 md:gap-6 text-center md:text-left">
                            <div className="text-[10px] tracking-[0.2em] uppercase opacity-60 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                                <span>&copy; 2026 Elara Inc.</span>

                                {/* Mobile Divider / Spacer */}
                                <div className="hidden md:block w-px h-3 bg-neutral-300"></div>

                                <div className="flex gap-6">
                                    <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
                                    <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
                                </div>
                            </div>

                            <a href="https://tristella.studio" target="_blank" rel="noopener noreferrer" className="text-[9px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity hover:text-primary mt-2 md:mt-0">
                                Digital Experience by Tristella Studio
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
            {/* Login Required Modal */}
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
                                Please sign in to explore our exclusive collections and shop timeless fragrances.
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
        </main>
    );
}
