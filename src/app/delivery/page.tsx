import { getAssignedOrders } from '@/app/actions/delivery';
import DeliveryDashboard from './DeliveryDashboard';

export const metadata = {
    title: 'Delivery Portal | ELARA',
    description: 'Delivery Agent Dashboard',
};

export default async function DeliveryPage() {
    const data: any = await getAssignedOrders();
    const orders = data.orders || [];
    const agent = data.agent || null;
    // Transform Decimal to number/string if needed for serialization
    const serializedOrders = orders.map((order: any) => ({
        ...order,
        subtotal: order.subtotal.toString(),
        discount: order.discount.toString(),
        total: order.total.toString(),
        agentCommission: order.agentCommission.toString(),
        deliveryOtp: null, // Don't expose this if accidentally fetched
        items: order.items.map((item: any) => ({
            ...item,
            price: item.price.toString()
        }))
    }));

    return <DeliveryDashboard initialOrders={serializedOrders} agentProfile={agent} />;
}
