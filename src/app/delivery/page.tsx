import { getAssignedOrders } from '@/app/actions/delivery';
import DeliveryDashboard from './DeliveryDashboard';

export const metadata = {
    title: 'Delivery Portal | ELARA',
    description: 'Delivery Agent Dashboard',
};

export interface DeliveryItem {
    quantity: number;
    price: string | number;
    product: {
        name: string;
        images: string[];
    };
}

export interface DeliveryOrder {
    id: string;
    status: string;
    subtotal: string;
    discount: string;
    total: string;
    agentCommission: string;
    deliveryAddress: {
        tag: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
    } | null;
    user: {
        name: string | null;
        phone: string | null;
        email: string;
    };
    items: DeliveryItem[];
}

export default async function DeliveryPage() {
    const data = await getAssignedOrders() as unknown as {
        orders: {
            id: string;
            status: string;
            subtotal: { toString(): string };
            discount: { toString(): string };
            total: { toString(): string };
            agentCommission: { toString(): string } | null;
            deliveryAddress: unknown;
            user: { name: string | null; phone: string | null; email: string };
            items: { quantity: number; price: { toString(): string }; product: { name: string; images: string[] } }[];
        }[],
        agent: { id: string; name: string | null; email: string; phone: string | null; vehicleDetails: string | null } | null
    };

    const orders = data.orders || [];
    const agent = data.agent || null;

    // Transform Decimal to number/string if needed for serialization
    const serializedOrders = orders.map((order) => ({
        ...order,
        subtotal: order.subtotal.toString(),
        discount: order.discount.toString(),
        total: order.total.toString(),
        agentCommission: order.agentCommission?.toString() || '0',
        deliveryOtp: null,
        deliveryAddress: order.deliveryAddress as DeliveryOrder['deliveryAddress'],
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toString()
        }))
    }));

    return <DeliveryDashboard initialOrders={serializedOrders as unknown as DeliveryOrder[]} agentProfile={agent} />;
}
