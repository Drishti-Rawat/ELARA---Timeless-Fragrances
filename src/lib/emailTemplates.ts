// Email Template Utilities for ELARA - Timeless Fragrances
import { generateEmailHtml } from "./email-templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Welcome Email Template
export function getWelcomeEmail(userName: string): string {
    const body = `
        <p>Dear ${userName},</p>
        <p>Welcome to ELARA. We are delighted to have you join our community of fragrance connoisseurs.</p>
        <p>At ELARA, we believe that scent is more than just a fragrance—it is an identity, a memory, and a statement.</p>
        <p>As a valued member, you now have exclusive access to our latest collections, members-only offers, and personalized recommendations.</p>
        <p style="text-align: center; margin: 40px 0;">
            <a href="${APP_URL}/shop" style="display: inline-block; padding: 14px 32px; background-color: #c6a87c; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px;">Explore Our Collection</a>
        </p>
        <p>We look forward to being part of your journey.</p>
        <p>Warm regards,<br>The ELARA Team</p>
    `;

    return generateEmailHtml("Welcome to ELARA", body);
}

// Order Confirmation Email Template
export function getOrderConfirmationEmail(params: {
    userName: string;
    orderId: string;
    trackingNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
}): string {
    const { userName, orderId, trackingNumber, total, items } = params;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${item.name}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.quantity}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #333;">₹${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const body = `
        <p>Dear ${userName},</p>
        <p>Thank you for your order. We are pleased to confirm that we have received your request and are preparing your selection with the utmost care.</p>
        
        <div style="background-color: #f9f9f9; padding: 24px; margin: 30px 0; border-left: 4px solid #c6a87c;">
            <p style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #666;">Order Reference</p>
            <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 20px; color: #1a1a1a;">${orderId}</p>
            ${trackingNumber ? `
            <p style="margin: 20px 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #666;">Tracking Number</p>
            <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 20px; color: #1a1a1a;">${trackingNumber}</p>
            ` : ''}
        </div>

        <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; color: #1a1a1a; margin-top: 40px; margin-bottom: 20px;">Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; margin-bottom: 30px;">
            <thead>
                <tr>
                    <th align="left" style="padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">Item</th>
                    <th align="center" style="padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">Qty</th>
                    <th align="right" style="padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr>
                    <td colspan="2" style="padding-top: 20px; text-align: right; font-weight: 600; color: #1a1a1a;">Total</td>
                    <td style="padding-top: 20px; text-align: right; font-weight: 600; color: #c6a87c; font-size: 16px;">₹${total.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <p>You will receive another notification once your package has been dispatched.</p>
        <p>Thank you for choosing ELARA.</p>
    `;

    return generateEmailHtml("Order Confirmation", body, {
        text: "View Order Details",
        url: `${APP_URL}/orders`
    });
}

// Delivery OTP Email Template
export function getDeliveryOTPEmail(params: {
    userName: string;
    orderId: string;
    otp: string;
}): string {
    const { userName, orderId, otp } = params;

    const body = `
        <p>Dear ${userName},</p>
        <p>Your order <strong>${orderId}</strong> is out for delivery and will arrive shortly.</p>
        <p>To ensure the security of your package, please share the following verification code with our delivery associate upon arrival:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p style="font-size: 13px; color: #666; font-style: italic;">Note: Please do not share this code with anyone other than the delivery associate.</p>
    `;

    return generateEmailHtml("Out for Delivery", body);
}

// Order Delivered Email Template
export function getOrderDeliveredEmail(params: {
    userName: string;
    orderId: string;
}): string {
    const { userName, orderId } = params;

    const body = `
        <p>Dear ${userName},</p>
        <p>We are pleased to inform you that your order <strong>${orderId}</strong> has been successfully delivered.</p>
        <p>We hope you enjoy your selection. If you have any feedback regarding your experience, we would love to hear from you.</p>
        <p>Thank you for choosing ELARA.</p>
    `;

    return generateEmailHtml("Shipment Delivered", body, {
        text: "Rate Your Experience",
        url: `${APP_URL}/orders`
    });
}
