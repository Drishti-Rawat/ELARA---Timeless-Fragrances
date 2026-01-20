'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function getUserAddressesAction() {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' } // Default first
        });
        return { success: true, addresses };
    } catch (error) {
        return { success: false, error: "Failed to load addresses" };
    }
}

export async function addAddressAction(data: any) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        // If this is the first address or marked default, uncheck others
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        // If it's the very first address, force it to be default
        const count = await prisma.address.count({ where: { userId } });
        const isDefault = count === 0 ? true : data.isDefault;

        const address = await prisma.address.create({
            data: {
                userId,
                tag: data.tag || "Home",
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                country: data.country || "India",
                phone: data.phone,
                isDefault
            }
        });

        revalidatePath('/cart');
        return { success: true, address };
    } catch (error) {
        console.error("Add Address Error:", error);
        return { success: false, error: "Failed to add address" };
    }
}

export async function deleteAddressAction(addressId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        await prisma.address.delete({
            where: { id: addressId, userId }
        });
        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete address" };
    }
}
