'use server';

import { getSession } from "@/lib/session";

export async function checkUserSession() {
    const session = await getSession();
    return !!session;
}
