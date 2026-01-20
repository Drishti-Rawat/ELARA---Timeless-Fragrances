'use server';

import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';
import { createSession, deleteSession, getSession } from "@/lib/session";
import { createHash } from 'crypto';

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
        // 1. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // 2. Hash OTP for secure storage
        const hashedOtp = createHash('sha256').update(otpCode).digest('hex');

        // 2. Store Hashed OTP in DB
        await prisma.otp.create({
            data: {
                email,
                code: hashedOtp, // Store hash, not raw code
                expiresAt,
            },
        });

        // 3. Send Email (Try/Catch in case SMTP is not configured)
        try {
            await transporter.sendMail({
                from: SMTP_FROM,
                to: email,
                subject: 'Your ELARA Login Code',
                text: `Your login code is: ${otpCode}. It expires in 10 minutes.`,
                html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #c6a87c;">ELARA</h1>
                <p>Your verification code is:</p>
                <h2 style="letter-spacing: 5px; font-size: 24px;">${otpCode}</h2>
                <p>This code expires in 10 minutes.</p>
               </div>`
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
export async function registerUserAction(data: { email: string; name: string; address?: any }) {
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
    return { userId: session.userId, role: session.role };
}
