/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validates OTP code format (6 digits)
 */
export function isValidOTP(code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    return /^\d{6}$/.test(code.trim());
}

/**
 * Validates phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    // Allows formats: +91XXXXXXXXXX, 10 digits, etc.
    return /^[\d+\-\s()]{10,15}$/.test(phone.trim());
}
