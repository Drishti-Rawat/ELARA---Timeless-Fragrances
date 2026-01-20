'use client';

import { useState, useEffect } from 'react';
import { getAllReviewsAction, replyToReviewAction } from '@/app/actions/reviews';
import { Star, MessageSquare, Send, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadReviews = async () => {
        setLoading(true);
        const res = await getAllReviewsAction();
        if (res.success) {
            setReviews(res.reviews || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) {
            alert('Please enter a response');
            return;
        }

        setSubmitting(true);
        const res = await replyToReviewAction(reviewId, replyText);
        if (res.success) {
            alert('Reply sent successfully!');
            setReplyingTo(null);
            setReplyText('');
            loadReviews();
        } else {
            alert(res.error || 'Failed to send reply');
        }
        setSubmitting(false);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900">Product Reviews</h2>
                <p className="text-gray-500 mt-1">Manage and respond to customer reviews</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Pending Response</p>
                    <p className="text-3xl font-bold text-orange-600">
                        {reviews.filter(r => !r.adminResponse).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Responded</p>
                    <p className="text-3xl font-bold text-green-600">
                        {reviews.filter(r => r.adminResponse).length}
                    </p>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg border border-gray-100 text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No reviews yet</p>
                    </div>
                ) : (
                    reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Review Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start gap-4">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                        {review.product.images[0] ? (
                                            <img
                                                src={review.product.images[0]}
                                                alt={review.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No img
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{review.product.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    by {review.user.name || review.user.email}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {renderStars(review.rating)}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {review.comment && (
                                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">
                                                "{review.comment}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Admin Response Section */}
                            <div className="p-6 bg-gray-50">
                                {review.adminResponse ? (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check size={16} className="text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                Admin Response • {new Date(review.respondedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-700">{review.adminResponse}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {replyingTo === review.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your response..."
                                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={submitting}
                                                        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        <Send size={14} /> {submitting ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText('');
                                                        }}
                                                        className="border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingTo(review.id)}
                                                className="text-primary hover:underline text-sm font-medium flex items-center gap-2"
                                            >
                                                <MessageSquare size={14} /> Reply to Review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
