'use server';

import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';
import { createSession, deleteSession, getSession } from "@/lib/session";
import { createHash } from 'crypto';
import { otpEmailRatelimit, otpIpRatelimit } from "@/lib/rate-limit";
import { headers } from 'next/headers';
import { generateEmailHtml } from "@/lib/email-templates";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // Convert "true" string to boolean
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"ELARA Auth" <no-reply@elara.com>';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export async function sendOtpAction(email: string) {
    try {
        // 1. Rate Limiting
        const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';

        const [ipResult, emailResult] = await Promise.all([
            otpIpRatelimit.limit(ip),
            otpEmailRatelimit.limit(email)
        ]);

        if (!ipResult.success || !emailResult.success) {
            return {
                success: false,
                error: `Too many requests. Please try again later.`
            };
        }

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // 3. Hash OTP for secure storage
        const hashedOtp = createHash('sha256').update(otpCode).digest('hex');

        // 4. Store Hashed OTP in DB
        await prisma.otp.create({
            data: {
                email,
                code: hashedOtp, // Store hash, not raw code
                expiresAt,
            },
        });

        // 5. Send Email (Try/Catch in case SMTP is not configured)

        // ... imports remain the same

        // Inside sendOtpAction:
        // 5. Send Email (Try/Catch in case SMTP is not configured)
        try {
            const emailHtml = generateEmailHtml(
                'Verify Your Identity',
                `<p>Use the verification code below to sign in to your ELARA account.</p>
                 <div class="otp-code">${otpCode}</div>
                 <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>`
            );

            await transporter.sendMail({
                from: SMTP_FROM,
                to: email,
                subject: 'Your ELARA Login Code',
                text: `Your login code is: ${otpCode}. It expires in 10 minutes.`,
                html: emailHtml
            });
            console.log(`[OTP SENT] Email: ${email}, Code: ${otpCode} (Hash: ${hashedOtp.substring(0, 8)}...)`); // Fallback logging
        } catch (emailError) {
            console.warn("SMTP Failed (simulating):", emailError);
            console.log(`[DEV MODE] OTP for ${email} is: ${otpCode}`);
        }

        return { success: true, message: "OTP sent" };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, error: "Failed to send OTP" };
    }
}

export async function verifyOtpAction(email: string, code: string) {
    try {
        // 1. Hash input for verification
        const hashedInput = createHash('sha256').update(code).digest('hex');

        // 1. Find valid OTP
        const record = await prisma.otp.findFirst({
            where: {
                email,
                code: hashedInput, // Compare hashes
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' } // Get latest
        });

        if (!record) {
            return { success: false, error: "Invalid or expired code" };
        }

        // 2. Cleanup used OTPs (optional security measure)
        await prisma.otp.deleteMany({
            where: { email }
        });

        // 3. Check User Status
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user && user.name) {
            await createSession(user.id, user.role);
            return { success: true, status: 'EXISTING_USER', role: user.role, userId: user.id };
        } else {
            // User doesn't exist OR exists but has no name (incomplete profile) -> Send to completion flow
            return { success: true, status: 'NEW_USER' };
        }

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: "Verification failed" };
    }
}

// Reuse existing helpers
export async function registerUserAction(data: { email: string; name: string; phone?: string; address?: any }) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        let user;

        if (existingUser) {
            // Update existing user (who had incomplete profile)
            user = await prisma.user.update({
                where: { email: data.email },
                data: {
                    name: data.name,
                    phone: data.phone,
                    addresses: data.address ? {
                        create: { ...data.address, isDefault: true }
                    } : undefined
                }
            });
        } else {
            // Create brand new user
            const newId = crypto.randomUUID();
            user = await prisma.user.create({
                data: {
                    id: newId,
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    role: 'USER',
                    addresses: data.address ? {
                        create: { ...data.address, isDefault: true }
                    } : undefined
                }
            });
        }

        await createSession(user.id, user.role); // Log them in immediately

        return { success: true, user };
    } catch (error) {
        console.error("Registration Error:", error);
        return { success: false, error: "Registration failed" };
    }
}

export async function logoutAction() {
    await deleteSession();
    return { success: true };
}

export async function getUserSessionAction() {
    const session = await getSession();
    if (!session) return null;

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, role: true, name: true, email: true }
    });

    if (!user) return null;

    return { userId: user.id, role: user.role, name: user.name, email: user.email };
}
