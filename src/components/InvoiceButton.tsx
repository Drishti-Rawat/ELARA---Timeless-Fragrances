'use client';

import { Download } from 'lucide-react';

export interface InvoiceData {
    invoiceNumber: string;
    orderNumber: string;
    date: string;
    customer: {
        name: string;
        email: string;
        address: any;
    };
    items: Array<{
        name: string;
        sku: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal: number;
    discount: number;
    couponCode?: string;
    total: number;
    status: string;
    trackingNumber?: string;
}

export const downloadInvoiceHTML = (invoice: InvoiceData) => {
    // Create HTML for invoice
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Playfair Display', 'Times New Roman', serif; padding: 40px; color: #1a1a1a; background: #faf9f6; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #eee; }
        .header { border-bottom: 2px solid #c6a87c; padding-bottom: 20px; margin-bottom: 40px; }
        .company-name { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; text-transform: uppercase; }
        .invoice-title { font-size: 14px; margin-top: 5px; color: #c6a87c; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .info-block { flex: 1; }
        .info-block h3 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px; font-family: sans-serif; }
        .info-block p { margin: 4px 0; font-size: 14px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin: 40px 0; }
        th { background: #faf9f6; padding: 15px; text-align: left; font-size: 10px; text-transform: uppercase; color: #666; font-family: sans-serif; letter-spacing: 1px; }
        td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        .totals { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .totals-row { display: flex; justify-content: flex-end; padding: 5px 0; }
        .totals-label { width: 200px; text-align: right; padding-right: 20px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .totals-value { width: 150px; text-align: right; font-family: sans-serif; }
        .total-row { padding-top: 15px; margin-top: 10px; border-top: 1px solid #eee; }
        .total-row .totals-label { color: #1a1a1a; font-weight: bold; }
        .total-row .totals-value { font-size: 18px; font-weight: bold; color: #c6a87c; }
        .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .status-badge { display: inline-block; padding: 4px 12px; border: 1px solid #eee; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-name">ELARA</div>
            <div class="invoice-title">Tax Invoice</div>
        </div>

        <div class="info-section">
            <div class="info-block">
                <h3>Billed To</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                <p>${invoice.customer.email}</p>
                ${invoice.customer.address ? `
                    <div style="margin-top: 10px; color: #666;">
                        <p>${invoice.customer.address.street}</p>
                        <p>${invoice.customer.address.city}, ${invoice.customer.address.state}</p>
                        <p>${invoice.customer.address.zip}</p>
                    </div>
                ` : ''}
            </div>

            <div class="info-block" style="text-align: right;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Order No:</strong> ${invoice.orderNumber}</p>
                <p><strong>Date:</strong> ${invoice.date}</p>
                <p style="margin-top: 10px;">
                    <span class="status-badge">${invoice.status}</span>
                </p>
                ${invoice.trackingNumber ? `<p style="margin-top: 5px; font-size: 12px; color: #c6a87c;">${invoice.trackingNumber}</p>` : ''}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>
                            <div style="font-weight: bold;">${item.name}</div>
                        </td>
                        <td style="color: #999; font-size: 12px;">${item.sku}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${item.price.toFixed(2)}</td>
                        <td class="text-right">₹${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <div class="totals-label">Subtotal</div>
                <div class="totals-value">₹${invoice.subtotal.toFixed(2)}</div>
            </div>
            ${invoice.discount > 0 ? `
                <div class="totals-row">
                    <div class="totals-label">Discount ${invoice.couponCode ? `(${invoice.couponCode})` : ''}</div>
                    <div class="totals-value" style="color: #28a745;">-₹${invoice.discount.toFixed(2)}</div>
                </div>
            ` : ''}
            <div class="totals-row total-row">
                <div class="totals-label">Grand Total</div>
                <div class="totals-value">₹${invoice.total.toFixed(2)}</div>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing ELARA</p>
            <p style="margin-top: 5px;">Timeless Fragrances &middot; Luxury Collection</p>
        </div>
    </div>
</body>
</html>
    `;

    // Create a blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default function InvoiceButton({ invoice }: { invoice: InvoiceData }) {
    return (
        <button
            onClick={() => downloadInvoiceHTML(invoice)}
            className="flex items-center gap-2 text-sm text-[#1a1a1a] hover:text-[#c6a87c] hover:underline font-medium transition-colors"
        >
            <Download size={14} /> Download Invoice
        </button>
    );
}
