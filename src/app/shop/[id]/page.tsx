'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductDetails, addToCartAction, toggleWishlistAction, submitReviewAction } from '../../actions/shop';
import { getUserSessionAction } from '../../actions/auth-custom';
import { Star, Heart, ShoppingBag, Minus, Plus, Share2, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params
    const { id } = use(params);
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Interaction State
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false); // Basic optimistic state

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
                setProduct(productRes.product);
                setSimilarProducts(productRes.similar || []);
            }
            setUser(session);
            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) return router.push('/login');
        setAddingToCart(true);
        const res = await addToCartAction(id, quantity);
        setAddingToCart(false);
        if (res.success) {
            alert("Added to cart");
            // Optionally trigger a cart refresh or global state update
        } else {
            alert("Failed to add to cart");
        }
    };

    const handleWishlist = async () => {
        if (!user) return router.push('/login');
        setWishlistLoading(true);
        const res = await toggleWishlistAction(id);
        if (res.success) {
            setIsInWishlist(!!res.added); // Update local state based on server response
        }
        setWishlistLoading(false);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return router.push('/login');

        setSubmittingReview(true);
        const res = await submitReviewAction(id, reviewRating, reviewComment);
        if (res.success) {
            // Refresh product data to see new review
            const updated = await getProductDetails(id);
            if (updated.success) setProduct(updated.product);
            setReviewComment('');
            setReviewRating(5);
        }
        setSubmittingReview(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-gray-400" /></div>;
    if (!product) return <div className="min-h-screen pt-32 text-center">Product not found. <Link href="/shop" className="underline">Go back</Link></div>;

    const outOfStock = product.stock <= 0;

    return (
        <div className="min-h-screen bg-white pt-28 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="aspect-3/4 bg-gray-50 rounded-sm overflow-hidden relative">
                            {product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 italic font-serif text-2xl">Ashbloom</div>
                            )}
                            {outOfStock && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold">Sold Out</span></div>}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 block">{product.category?.name} • {product.gender}</span>
                        <h1 className="font-serif text-4xl text-gray-900 mb-4">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            {product.isOnSale ? (
                                <>
                                    <span className="text-3xl font-medium text-red-600">
                                        ${(Number(product.price) * (1 - product.salePercentage / 100)).toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-400 line-through">
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase rounded-sm">
                                        -{product.salePercentage}%
                                    </span>
                                </>
                            ) : (
                                <p className="text-3xl font-medium text-gray-900">${Number(product.price).toFixed(2)}</p>
                            )}
                        </div>

                        {/* Sale End Date Notice */}
                        {product.isOnSale && product.saleEndDate && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-sm inline-block">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Sale ends {new Date(product.saleEndDate).toLocaleDateString()} at {new Date(product.saleEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )}

                        {/* Average Rating */}
                        {product.reviews && product.reviews.length > 0 && (
                            <div className="flex items-center gap-2 mb-8">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const avgRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length;
                                        return (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        );
                                    })}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {(product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        )}

                        <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            {/* Quantity */}
                            {!outOfStock && (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-900">Quantity</span>
                                    <div className="flex items-center border border-gray-200 rounded-sm">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-gray-50 text-gray-500"><Minus size={14} /></button>
                                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(Number(product.stock), q + 1))} className="p-2 hover:bg-gray-50 text-gray-500"><Plus size={14} /></button>
                                    </div>
                                    <span className="text-xs text-gray-400">{product.stock} available</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={outOfStock || addingToCart}
                                        className="flex-1 bg-gray-900 text-white h-12 rounded-sm font-medium uppercase tracking-wide text-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
                                    >
                                        {addingToCart ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
                                        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleWishlist}
                                        disabled={wishlistLoading}
                                        className={`w-12 h-12 border border-gray-200 rounded-sm flex items-center justify-center transition-colors ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'hover:border-black text-gray-900'}`}
                                    >
                                        {wishlistLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={20} className={isInWishlist ? "fill-red-500" : ""} />}
                                    </button>
                                </div>
                                <Link href="/cart" className="w-full h-10 border border-gray-900 text-gray-900 rounded-sm font-medium uppercase tracking-wide text-xs hover:bg-gray-50 flex items-center justify-center transition-colors">
                                    Go to Cart <ArrowRight size={14} className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-100 pt-16 mb-20 max-w-3xl">
                    <h3 className="font-serif text-2xl text-gray-900 mb-8">Customer Reviews</h3>

                    {/* Write Review */}
                    {user ? (
                        <form onSubmit={handleSubmitReview} className="mb-12 bg-gray-50 p-6 rounded-sm">
                            <h4 className="font-medium text-sm text-gray-900 mb-4">Write a Review</h4>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none">
                                        <Star size={20} className={star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                required
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full p-3 text-sm border border-gray-200 rounded-sm mb-4 focus:outline-none focus:border-black"
                                rows={3}
                            />
                            <button disabled={submittingReview} type="submit" className="text-xs uppercase font-bold tracking-widest bg-white border border-gray-900 px-6 py-2 hover:bg-gray-900 hover:text-white transition-colors">
                                {submittingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-12 p-6 bg-gray-50 text-center text-sm text-gray-500">
                            Please <Link href="/login" className="underline text-black">sign in</Link> to leave a review.
                        </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-8">
                        {product.reviews.length === 0 ? (
                            <p className="text-gray-400 italic">No reviews yet.</p>
                        ) : (
                            product.reviews.map((review: any) => (
                                <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm text-gray-900">{review.user.name || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-0.5 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{review.comment}</p>

                                    {/* Admin Response */}
                                    {review.adminResponse && (
                                        <div className="mt-4 ml-6 pl-4 border-l-2 border-primary/30 bg-primary/5 p-3 rounded-r-md">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">ASHBLOOM Response</span>
                                                <span className="text-xs text-gray-400">• {new Date(review.respondedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{review.adminResponse}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="border-t border-gray-100 pt-16">
                        <h3 className="font-serif text-2xl text-gray-900 mb-8 text-center">You May Also Like</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {similarProducts.map(sim => (
                                <Link href={`/shop/${sim.id}`} key={sim.id} className="group text-center">
                                    <div className="aspect-3/4 bg-gray-50 mb-3 overflow-hidden relative">
                                        {sim.images[0] && <img src={sim.images[0]} alt={sim.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                                    </div>
                                    <h4 className="font-serif text-sm text-gray-900 group-hover:text-primary transition-colors">{sim.name}</h4>
                                    <p className="text-xs font-medium text-gray-500 mt-1">${Number(sim.price).toFixed(2)}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
