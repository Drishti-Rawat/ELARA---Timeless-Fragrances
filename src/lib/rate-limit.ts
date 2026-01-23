import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Upstash Redis Rate Limiting
 * Robust configuration that handles various environment variable naming conventions.
 */

const redisUrl = process.env.elara_KV_REST_API_URL || process.env.ELARA_KV_REST_API_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.elara_KV_REST_API_TOKEN || process.env.ELARA_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

// Initialize Redis only if variables exist to prevent the "/pipeline" error
const redis = (redisUrl && redisToken)
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

if (!redis) {
    console.warn("⚠️ Rate limiting is disabled: Redis environment variables are missing.");
}

/**
 * Helper to create a limiter. 
 * If Redis is not configured, it returns a "pass-through" limiter that always allows requests.
 */
function createLimiter(prefix: string, limit: number, window: any) {
    if (!redis) {
        return {
            limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 })
        };
    }

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        analytics: true,
        prefix: `ratelimit:${prefix}`,
    });
}

// OTP Email Limiter: 3 requests per 10 minutes
export const otpEmailRatelimit = createLimiter('otp_email', 3, '600 s');

// OTP IP Limiter: 10 attempts per minute
export const otpIpRatelimit = createLimiter('otp_ip', 10, '60 s');

// Coupon Limiter: 10 validation attempts per minute per user
export const couponRatelimit = createLimiter('coupon', 10, '60 s');

// Login Verification Limiter: 5 attempts per 15 minutes per email
export const loginVerifyRatelimit = createLimiter('login_verify', 5, '900 s');
