'use server';

import { prisma } from "@/lib/prisma";

export async function getUserRole(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        return user?.role || 'USER';
    } catch (error) {
        console.error('Error fetching user role:', error);
        return 'USER';
    }
}

export async function checkUserExists(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return !!user;
    } catch (error) {
        console.error('Error checking user:', error);
        return false;
    }
}

interface OnboardingData {
    userId: string;
    email: string;
    name: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
}

export async function registerUser(data: OnboardingData) {
    try {
        const user = await prisma.user.create({
            data: {
                id: data.userId,
                email: data.email,
                name: data.name,
                role: 'USER',
                addresses: data.address ? {
                    create: {
                        street: data.address.street,
                        city: data.address.city,
                        state: data.address.state,
                        zip: data.address.zip,
                        country: data.address.country,
                        isDefault: true,
                    }
                } : undefined,
            },
        });
        return { success: true, user };
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, error };
    }
}
