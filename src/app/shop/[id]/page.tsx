'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductDetails, addToCartAction, toggleWishlistAction, submitReviewAction } from '../../actions/shop';
import { getUserSessionAction } from '../../actions/auth-custom';
import Navbar from '@/components/Navbar';
import { Star, Heart, ShoppingBag, Minus, Plus, Loader2, ArrowLeft, ArrowRight, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '@/components/Loading';

interface Category {
    id: string;
    name: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string | Date;
    user: {
        name: string | null;
        email: string;
    };
    adminResponse?: string | null;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
    category?: Category;
    gender: string;
    isOnSale: boolean;
    salePercentage: number;
    saleEndDate?: string | Date;
    reviews: Review[];
}

interface UserSession {
    id: string;
    email: string;
    name?: string | null;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params
    const { id } = use(params);

    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserSession | null>(null);

    // Interaction State
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [flyAnimation, setFlyAnimation] = useState<{ start: { x: number, y: number }, target: { x: number, y: number } } | null>(null);
    const [showToast, setShowToast] = useState(false);

    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [productRes, session] = await Promise.all([
                getProductDetails(id),
                getUserSessionAction()
            ]);

            if (productRes.success) {
                setProduct(productRes.product as unknown as Product);
                setSimilarProducts(productRes.similar as unknown as Product[] || []);
                setIsInWishlist(productRes.isWishlisted || false);
            }
            setUser(session as UserSession | null);
            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setAddingToCart(true);

        const res = await addToCartAction(id, quantity);
        setAddingToCart(false);

        if (res.success) {
            window.dispatchEvent(new CustomEvent('cart-updated'));
            // Animation Trigger
            const imgEl = document.getElementById('product-image-main');
            const cartEl = document.getElementById('nav-cart-icon');

            if (imgEl && cartEl) {
                const imgRect = imgEl.getBoundingClientRect();
                const cartRect = cartEl.getBoundingClientRect();

                setFlyAnimation({
                    start: { x: imgRect.left, y: imgRect.top },
                    target: { x: cartRect.left, y: cartRect.top }
                });

                // Clear animation and show toast after duration
                setTimeout(() => {
                    setFlyAnimation(null);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }, 800);
            } else {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } else {
            alert("Failed to add to cart");
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setWishlistLoading(true);
        const res = await toggleWishlistAction(id);
        if (res.success) {
            setIsInWishlist(!!res.added); // Update local state based on server response
        }
        setWishlistLoading(false);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setSubmittingReview(true);
        const res = await submitReviewAction(id, reviewRating, reviewComment);
        if (res.success) {
            // Refresh product data to see new review
            const updated = await getProductDetails(id);
            if (updated.success) setProduct(updated.product as unknown as Product);
            setReviewComment('');
            setReviewRating(5);
        }
        setSubmittingReview(false);
    };

    if (loading) return <Loading text="Curating Product Details..." />;
    if (!product) return <div className="min-h-screen pt-32 text-center text-neutral-500 font-serif">Product not found. <Link href="/shop" className="underline hover:text-primary">Return to Collection</Link></div>;

    const outOfStock = product.stock <= 0;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-28 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-primary mb-12 transition-colors">
                        <ArrowLeft size={14} /> Back to Collection
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-20 items-start">
                        {/* Image Section - Sticky */}
                        <div className="space-y-12 md:sticky md:top-28 h-fit w-full max-w-md mx-auto md:mx-0 md:ml-auto">
                            <div className="aspect-square bg-surface-highlight overflow-hidden relative border border-neutral-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                {product.images[0] ? (
                                    <motion.div
                                        id="product-image-main"
                                        initial={{ scale: 1.1, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="w-full h-full relative"
                                    >
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            priority
                                            className="object-cover"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 font-serif italic text-4xl">ELARA</div>
                                )}
                                {outOfStock && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="bg-foreground text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold">Sold Out</span>
                                    </div>
                                )}
                            </div>

                            {/* Additional Details to Sidebar to fill space */}
                            <div className="hidden md:grid grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Longevity</span>
                                    <p className="text-sm text-neutral-600 font-serif italic">10-12 Hours</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Sillage</span>
                                    <p className="text-sm text-neutral-600 font-serif italic">Moderate to Heavy</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Concentration</span>
                                    <p className="text-sm text-neutral-600 font-serif italic">Eau de Parfum</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Season</span>
                                    <p className="text-sm text-neutral-600 font-serif italic">All Seasons</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col justify-center max-w-lg mx-auto md:mx-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-px w-8 bg-primary" />
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{product.category?.name || 'Fragrance'} • {product.gender}</span>
                                </div>

                                <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 mb-6 leading-[0.9]">{product.name}</h1>

                                <div className="flex items-center gap-6 mb-8">
                                    {product.isOnSale ? (
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-serif text-red-800">
                                                ${(Number(product.price) * (1 - product.salePercentage / 100)).toFixed(2)}
                                            </span>
                                            <span className="text-lg text-neutral-400 line-through font-serif">
                                                ${Number(product.price).toFixed(2)}
                                            </span>
                                            <span className="bg-red-800 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                -{product.salePercentage}%
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-serif text-neutral-900">${Number(product.price).toFixed(2)}</p>
                                    )}
                                </div>

                                {/* Sale End Date Notice */}
                                {product.isOnSale && product.saleEndDate && (
                                    <div className="mb-8 p-4 bg-red-50/50 border border-red-100/50 inline-block">
                                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-[0.15em] flex items-center gap-3">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                            </span>
                                            Ends {new Date(product.saleEndDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {/* Average Rating */}
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / (product.reviews.length || 1);
                                            return (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= Math.round(avgRating) && product.reviews.length > 0 ? 'fill-primary text-primary' : 'text-neutral-200'}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                                        {product.reviews.length > 0 ? `${product.reviews.length} Reviews` : 'No Reviews Yet'}
                                    </span>
                                </div>

                                <p className="text-neutral-600 leading-loose mb-10 font-light text-base md:text-lg max-w-lg">{product.description}</p>

                                <div className="space-y-8 pt-8 border-t border-neutral-100">
                                    {/* Quantity */}
                                    {!outOfStock && (
                                        <div className="flex items-center gap-6">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Quantity</span>
                                            <div className="flex items-center border border-neutral-200">
                                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-neutral-50 text-neutral-500 transition-colors"><Minus size={14} /></button>
                                                <span className="w-12 text-center text-sm font-serif">{quantity}</span>
                                                <button onClick={() => setQuantity(q => Math.min(Number(product.stock), q + 1))} className="p-3 hover:bg-neutral-50 text-neutral-500 transition-colors"><Plus size={14} /></button>
                                            </div>
                                            {product.stock < 10 && (
                                                <span className="text-[9px] text-orange-600 font-bold uppercase tracking-widest animate-pulse">Only {product.stock} Left</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={outOfStock || addingToCart}
                                                className="flex-1 bg-foreground text-white h-14 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors group"
                                            >
                                                {addingToCart ? <Loader2 className="animate-spin" size={16} /> : <ShoppingBag size={16} className="group-hover:-translate-y-0.5 transition-transform" />}
                                                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={handleWishlist}
                                                disabled={wishlistLoading}
                                                className={`w-14 h-14 border border-neutral-200 flex items-center justify-center transition-all ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'hover:border-primary hover:text-primary text-neutral-400'}`}
                                            >
                                                {wishlistLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={20} className={isInWishlist ? "fill-red-500" : ""} />}
                                            </button>
                                        </div>
                                        {user ? (
                                            <Link href="/cart" className="w-full py-4 text-center border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 group">
                                                View Cart <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ) : (
                                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 text-center border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 group">
                                                View Cart <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {/* Reviews Section */}
                    <div className="border-t border-neutral-200 pt-24 mb-24 max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h3 className="font-serif text-4xl text-neutral-900 mb-4">Olfactory Notes & Reviews</h3>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-4xl font-serif text-primary">{product.reviews.length > 0 ? (product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length).toFixed(1) : '—'}</span>
                                <span className="text-lg text-neutral-300 font-light">/ 5.0</span>
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Based on {product.reviews.length} Customer Experiences</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            {/* Write Review Column */}
                            <div className="md:col-span-4">
                                <div className="bg-surface/80 p-8 sticky top-32">
                                    <h4 className="font-serif text-xl text-neutral-900 mb-6">Share Your Experience</h4>
                                    <p className="text-sm text-neutral-500 mb-8 font-light leading-relaxed">
                                        Your scent journey matters to us. Share your thoughts on the longevity, sillage, and overall impression of this fragrance.
                                    </p>

                                    <form onSubmit={handleSubmitReview}>
                                        <div className="flex gap-2 mb-6 justify-center">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={24}
                                                        className={star <= reviewRating ? "text-primary fill-primary" : "text-neutral-200"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            required
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            placeholder="Write your review here..."
                                            className="w-full p-4 text-sm bg-white border border-neutral-200 mb-6 focus:outline-none focus:border-primary placeholder:text-neutral-400 font-light resize-y min-h-[140px]"
                                        />
                                        <button
                                            disabled={submittingReview}
                                            type="submit"
                                            className="w-full text-xs uppercase font-bold tracking-[0.2em] bg-foreground text-white border border-foreground px-8 py-4 hover:bg-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingReview ? 'Publishing...' : 'Publish Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Review List Column */}
                            <div className="md:col-span-8 space-y-8">
                                {product.reviews.length === 0 ? (
                                    <div className="text-center py-20 border border-dashed border-neutral-200 rounded-sm">
                                        <p className="font-serif text-neutral-400 italic text-xl mb-2">Awaiting the first note.</p>
                                        <p className="text-xs uppercase tracking-widest text-neutral-300">Be the first to review</p>
                                    </div>
                                ) : (
                                    product.reviews.map((review) => (
                                        <div key={review.id} className="p-8 border border-neutral-100 hover:border-neutral-200 transition-colors bg-white group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-surface-highlight rounded-full flex items-center justify-center text-primary font-serif font-bold text-lg">
                                                        {(review.user.name || 'C').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-serif text-lg text-neutral-900 block mb-1">{review.user.name || 'Connoisseur'}</span>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={10}
                                                                    className={i < review.rating ? "text-primary fill-primary" : "text-neutral-200"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-neutral-600 leading-loose font-light text-sm pl-14">{review.comment}</p>

                                            {/* Admin Response */}
                                            {review.adminResponse && (
                                                <div className="mt-8 ml-14 pl-6 border-l border-primary/30 py-2">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Elara Atelier</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 italic font-serif leading-relaxed">{review.adminResponse}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Similar Products - Cosmic Grid */}
                    {similarProducts.length > 0 && (
                        <div className="border-t border-neutral-200 pt-20">
                            <h3 className="font-serif text-3xl text-neutral-900 mb-12 text-center">You May Also Like</h3>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12">
                                {similarProducts.map((sim, index) => {
                                    const salePrice = sim.isOnSale
                                        ? Number(sim.price) * (1 - sim.salePercentage / 100)
                                        : null;

                                    return (
                                        <motion.div
                                            key={sim.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            className="group flex flex-col h-full"
                                        >
                                            {/* Image Container */}
                                            <div className="relative aspect-4/5 overflow-hidden bg-white mb-4 md:mb-6 border border-neutral-200/60 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-sm">
                                                <Link href={`/shop/${sim.id}`} className="block w-full h-full">
                                                    {/* Primary Image */}
                                                    {sim.images[0] ? (
                                                        <div className="absolute inset-0 w-full h-full group-hover:opacity-0 transition-opacity duration-700">
                                                            <Image
                                                                src={sim.images[0]}
                                                                alt={sim.name}
                                                                fill
                                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                                className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 w-full h-full bg-surface-highlight flex items-center justify-center text-neutral-300 font-serif italic text-3xl">
                                                            Elara
                                                        </div>
                                                    )}

                                                    {/* Secondary Image (Hover) */}
                                                    {sim.images[1] ? (
                                                        <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105">
                                                            <Image
                                                                src={sim.images[1]}
                                                                alt={sim.name}
                                                                fill
                                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105">
                                                            <Image
                                                                src={sim.images[0]}
                                                                alt={sim.name}
                                                                fill
                                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Wishlist Button - Top Right */}
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (!user) {
                                                            setShowLoginModal(true);
                                                            return;
                                                        }
                                                        // Toggle wishlist for recommended item
                                                        // Simple alert or toast could be better, but we reuse existing logic if possible.
                                                        // For now, simpler interaction as we might not want to re-fetch the whole main product text
                                                        await toggleWishlistAction(sim.id);
                                                    }}
                                                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white text-neutral-400 hover:text-red-500"
                                                >
                                                    <Heart size={16} />
                                                </button>

                                                {/* Sale Badge */}
                                                {sim.isOnSale && (
                                                    <div className="absolute top-4 left-4 z-10">
                                                        <span className="bg-red-700 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">
                                                            Sale
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Sold Out Overlay */}
                                                {sim.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                        <span className="text-neutral-900 border border-neutral-900 px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold">Sold Out</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex flex-col flex-1 pl-1">
                                                {/* Category */}
                                                <p className="text-[10px] text-primary uppercase tracking-[0.25em] font-bold mb-2">
                                                    {sim.category?.name || 'Collection'}
                                                </p>

                                                <Link href={`/shop/${sim.id}`} className="group-hover:text-primary transition-colors">
                                                    <h3 className="font-serif text-sm md:text-xl text-neutral-900 leading-tight mb-2">
                                                        {sim.name}
                                                    </h3>
                                                </Link>

                                                {/* Price */}
                                                <div className="mb-6 flex items-baseline gap-3">
                                                    {sim.isOnSale ? (
                                                        <>
                                                            <span className="text-base text-red-700 font-medium">${salePrice?.toFixed(2)}</span>
                                                            <span className="text-xs text-neutral-400 line-through">${Number(sim.price).toFixed(2)}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-base text-neutral-600 font-medium">${Number(sim.price).toFixed(2)}</span>
                                                    )}
                                                </div>

                                                {/* Push Button to Bottom of Flex Container */}
                                                <div className="mt-auto">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!user) {
                                                                setShowLoginModal(true);
                                                                return;
                                                            }
                                                            if (sim.stock <= 0) return;

                                                            const result = await addToCartAction(sim.id, 1);
                                                            if (result.success) {
                                                                window.dispatchEvent(new CustomEvent('cart-updated'));
                                                                const btn = e.currentTarget;
                                                                const originalHTML = btn.innerHTML;
                                                                btn.innerHTML = '<span class="flex items-center gap-2">Added</span>';
                                                                btn.classList.add('bg-foreground', 'text-white', 'border-foreground');
                                                                setTimeout(() => {
                                                                    btn.innerHTML = originalHTML;
                                                                    btn.classList.remove('bg-foreground', 'text-white', 'border-foreground');
                                                                }, 2000);
                                                            }
                                                        }}
                                                        disabled={sim.stock <= 0}
                                                        className="w-full py-3 border border-neutral-300 text-neutral-900 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group/btn"
                                                    >
                                                        {sim.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
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
                                Please sign in to manage your cart, wishlist, and reviews.
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

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-50 bg-foreground text-white px-8 py-4 flex items-center gap-4 shadow-2xl"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black">
                            <ShoppingBag size={14} fill="currentColor" />
                        </div>
                        <div>
                            <span className="block font-serif text-lg leading-none mb-1">Added to Collection</span>
                            <span className="text-[10px] uppercase tracking-widest text-[#999]">View your cart</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fly Animation Image */}
            {flyAnimation && product?.images[0] && (
                <motion.div
                    initial={{
                        position: 'fixed',
                        left: flyAnimation.start.x,
                        top: flyAnimation.start.y,
                        width: 400,
                        opacity: 1,
                        zIndex: 100,
                        borderRadius: '0%'
                    }}
                    animate={{
                        left: flyAnimation.target.x,
                        top: flyAnimation.target.y,
                        width: 20,
                        height: 20,
                        opacity: 0.5,
                        borderRadius: '50%'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="pointer-events-none overflow-hidden shadow-xl"
                >
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </motion.div>
            )}
        </div>
    );
}

