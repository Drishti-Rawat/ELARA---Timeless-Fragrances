import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Vercel KV / Redis Rate Limiting
 * This implementation is persistent across serverless function invocations.
 */

// OTP Email Limiter: 3 requests per 10 minutes
export const otpEmailRatelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(3, '600 s'),
    analytics: true,
    prefix: 'ratelimit:otp_email',
});

// OTP IP Limiter: 10 attempts per minute (prevent bot floods)
export const otpIpRatelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:otp_ip',
});

// Coupon Limiter: 10 validation attempts per minute per user
export const couponRatelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:coupon',
});
