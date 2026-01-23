import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Upstash Redis Rate Limiting
 * Works with both Vercel KV (if env vars mapped) and standard Upstash Redis.
 */

// Create Redis client (configured to use project-specific ELARA prefixed variables)
const redis = new Redis({
    url: process.env.ELARA_KV_REST_API_URL || '',
    token: process.env.ELARA_KV_REST_API_TOKEN || '',
});

// OTP Email Limiter: 3 requests per 10 minutes
export const otpEmailRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '600 s'),
    analytics: true,
    prefix: 'ratelimit:otp_email',
});

// OTP IP Limiter: 10 attempts per minute (prevent bot floods)
export const otpIpRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:otp_ip',
});

// Coupon Limiter: 10 validation attempts per minute per user
export const couponRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:coupon',
});

// Login Verification Limiter: 5 attempts per 15 minutes per email
export const loginVerifyRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '900 s'),
    analytics: true,
    prefix: 'ratelimit:login_verify',
});

