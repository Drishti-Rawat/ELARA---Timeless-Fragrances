'use client';

import { Download } from 'lucide-react';

interface InvoiceData {
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

export default function InvoiceButton({ invoice }: { invoice: InvoiceData }) {
    const handleDownload = () => {
        // Create HTML for invoice
        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 3px solid #c6a87c; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 32px; font-weight: bold; color: #c6a87c; letter-spacing: 2px; }
        .invoice-title { font-size: 24px; margin-top: 10px; color: #666; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-block { flex: 1; }
        .info-block h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
        .info-block p { margin: 4px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        .totals { margin-top: 20px; }
        .totals-row { display: flex; justify-content: flex-end; padding: 8px 0; }
        .totals-label { width: 200px; text-align: right; padding-right: 20px; font-weight: 500; }
        .totals-value { width: 150px; text-align: right; }
        .total-row { border-top: 2px solid #c6a87c; padding-top: 12px; margin-top: 12px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-shipped { background: #d1ecf1; color: #0c5460; }
        .status-processing { background: #fff3cd; color: #856404; }
        .status-pending { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-name">ASHBLOOM</div>
            <div class="invoice-title">Tax Invoice</div>
        </div>

        <div class="info-section">
            <div class="info-block">
                <h3>Invoice To</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                <p>${invoice.customer.email}</p>
                ${invoice.customer.address ? `
                    <p>${invoice.customer.address.street}</p>
                    <p>${invoice.customer.address.city}, ${invoice.customer.address.state} ${invoice.customer.address.zip}</p>
                    <p>${invoice.customer.address.country}</p>
                ` : ''}
            </div>

            <div class="info-block" style="text-align: right;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Order #:</strong> ${invoice.orderNumber}</p>
                <p><strong>Date:</strong> ${invoice.date}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span></p>
                ${invoice.trackingNumber ? `<p><strong>Tracking:</strong> ${invoice.trackingNumber}</p>` : ''}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.sku}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${item.price.toFixed(2)}</td>
                        <td class="text-right">₹${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <div class="totals-label">Subtotal:</div>
                <div class="totals-value">₹${invoice.subtotal.toFixed(2)}</div>
            </div>
            ${invoice.discount > 0 ? `
                <div class="totals-row" style="color: #28a745;">
                    <div class="totals-label">Discount ${invoice.couponCode ? `(${invoice.couponCode})` : ''}:</div>
                    <div class="totals-value">-₹${invoice.discount.toFixed(2)}</div>
                </div>
            ` : ''}
            <div class="totals-row total-row">
                <div class="totals-label">Total:</div>
                <div class="totals-value">₹${invoice.total.toFixed(2)}</div>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for shopping with ASHBLOOM!</p>
            <p>For any queries, contact us at support@ashbloom.com</p>
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

        // User can open the HTML file and print to PDF
        alert('Invoice downloaded! Open the file and use "Print to PDF" to save as PDF.');
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
            <Download size={14} /> Download Invoice
        </button>
    );
}
