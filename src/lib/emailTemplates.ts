// Email Template Utilities for ELARA - Timeless Fragrances

// Get the application URL from environment variable
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailTemplateProps {
    body: string;
    preheader?: string;
}

export function getEmailTemplate({ body, preheader }: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    ${preheader ? `<meta name="description" content="${preheader}">` : ''}
    <title>ELARA - Timeless Fragrances</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-family: 'Georgia', serif;
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 4px;
            margin: 0;
        }
        .tagline {
            color: #d4af37;
            font-size: 12px;
            letter-spacing: 2px;
            margin-top: 8px;
            text-transform: uppercase;
        }
        .body-content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        .footer {
            background-color: #1a1a1a;
            padding: 30px 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
        }
        .footer-links {
            margin: 15px 0;
        }
        .footer-links a {
            color: #d4af37;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .copyright {
            margin-top: 20px;
            color: #666666;
        }
        .social-icons {
            margin: 20px 0;
        }
        .social-icons a {
            display: inline-block;
            margin: 0 8px;
            color: #d4af37;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .body-content {
                padding: 30px 20px;
            }
            .logo {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">ELARA</h1>
            <p class="tagline">Timeless Fragrances</p>
        </div>

        <!-- Body Content -->
        <div class="body-content">
            ${body}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="social-icons">
                <a href="https://instagram.com/elara" target="_blank">Instagram</a>
                <span style="color: #666;">•</span>
                <a href="https://facebook.com/elara" target="_blank">Facebook</a>
                <span style="color: #666;">•</span>
                <a href="https://twitter.com/elara" target="_blank">Twitter</a>
            </div>
            
            <div class="footer-links">
                <a href="${APP_URL}/shop">Shop</a>
                <a href="${APP_URL}/help">Help Center</a>
                <a href="${APP_URL}/contact">Contact Us</a>
            </div>

            <p style="margin: 20px 0; color: #999;">
                ELARA - Timeless Fragrances<br>
                Email: <a href="mailto:support@elara.com" style="color: #d4af37;">support@elara.com</a><br>
                Phone: +91 1234567890
            </p>

            <div class="copyright">
                © ${new Date().getFullYear()} ELARA. All rights reserved.
            </div>

            <p style="margin-top: 20px; font-size: 11px; color: #666;">
                You are receiving this email because you have an account with ELARA.<br>
                <a href="#" style="color: #999;">Unsubscribe</a> | <a href="#" style="color: #999;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Welcome Email Template
export function getWelcomeEmail(userName: string): string {
    const body = `
        <h2 style="color: #1a1a1a; font-family: Georgia, serif; margin-bottom: 20px;">
            Welcome to ELARA, ${userName}! 🌟
        </h2>
        
        <p style="font-size: 16px; color: #333;">
            Thank you for joining our exclusive fragrance community. We're thrilled to have you here!
        </p>

        <p style="font-size: 16px; color: #333;">
            At ELARA, we believe every scent tells a story. Explore our curated collection of timeless fragrances 
            crafted to elevate your everyday moments.
        </p>

        <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="color: #1a1a1a; margin-top: 0;">🎁 Welcome Gift</h3>
            <p style="font-size: 18px; color: #d4af37; font-weight: bold; margin: 10px 0;">
                Get 10% OFF on your first order
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                Use code: <strong style="color: #1a1a1a; font-size: 16px; letter-spacing: 1px;">WELCOME10</strong>
            </p>
            <a href="${APP_URL}/shop" 
               style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px;">
                Start Shopping
            </a>
        </div>

        <h3 style="color: #1a1a1a; margin-top: 30px;">What's Next?</h3>
        <ul style="color: #333; line-height: 1.8;">
            <li>Browse our <strong>Featured Collection</strong> of signature scents</li>
            <li>Discover fragrances by <strong>Category</strong> or <strong>Gender</strong></li>
            <li>Add your favorites to your <strong>Wishlist</strong></li>
            <li>Enjoy <strong>Free Delivery</strong> on orders above ₹999</li>
        </ul>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
            If you have any questions, our support team is always here to help.
        </p>

        <p style="font-size: 16px; color: #333;">
            Happy Shopping! ✨<br>
            <strong>The ELARA Team</strong>
        </p>
    `;

    return getEmailTemplate({
        body,
        preheader: 'Welcome to ELARA - Your journey into timeless fragrances begins now!'
    });
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
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const body = `
        <h2 style="color: #1a1a1a; font-family: Georgia, serif; margin-bottom: 20px;">
            Thank you for your order, ${userName}! 🎉
        </h2>
        
        <p style="font-size: 16px; color: #333;">
            We've received your order and are preparing it for shipment. You'll receive another email when it's on its way.
        </p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 5px 0; color: #666;">
                <strong style="color: #1a1a1a;">Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong style="color: #1a1a1a;">Tracking Number:</strong> ${trackingNumber}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong style="color: #1a1a1a;">Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>

        <h3 style="color: #1a1a1a; margin-top: 30px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background-color: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr>
                    <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #d4af37; border-top: 2px solid #ddd;">₹${total.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #666;">
                <strong style="color: #1a1a1a;">📦 What's Next?</strong><br>
                We'll send you an email with tracking details once your order ships. You can also track your order anytime from your account.
            </p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/orders" 
               style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Order Details
            </a>
        </p>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Thank you for choosing ELARA! ✨<br>
            <strong>The ELARA Team</strong>
        </p>
    `;

    return getEmailTemplate({
        body,
        preheader: `Order confirmed! Your ELARA fragrances are on their way.`
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
        <h2 style="color: #1a1a1a; font-family: Georgia, serif; margin-bottom: 20px;">
            Your Order is Out for Delivery! 🚚
        </h2>
        
        <p style="font-size: 16px; color: #333;">
            Hi ${userName},
        </p>

        <p style="font-size: 16px; color: #333;">
            Great news! Your ELARA order is on its way and will arrive soon.
        </p>

        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="color: #d4af37; font-size: 14px; margin: 0 0 10px 0; letter-spacing: 2px; text-transform: uppercase;">
                Delivery OTP
            </p>
            <p style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace;">
                ${otp}
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                Order #${orderId.slice(0, 8).toUpperCase()}
            </p>
        </div>

        <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #666;">
                <strong style="color: #1a1a1a;">🔐 Important:</strong><br>
                Please share this OTP with the delivery agent to receive your package. Do not share this code with anyone else.
            </p>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Our delivery hero will contact you shortly. If you have any questions, feel free to reach out to our support team.
        </p>

        <p style="font-size: 16px; color: #333;">
            Thank you for shopping with ELARA! ✨<br>
            <strong>The ELARA Team</strong>
        </p>
    `;

    return getEmailTemplate({
        body,
        preheader: `Your delivery OTP: ${otp}`
    });
}

// Order Delivered Email Template
export function getOrderDeliveredEmail(params: {
    userName: string;
    orderId: string;
}): string {
    const { userName, orderId } = params;

    const body = `
        <h2 style="color: #1a1a1a; font-family: Georgia, serif; margin-bottom: 20px;">
            Your Order Has Been Delivered! 🎉
        </h2>
        
        <p style="font-size: 16px; color: #333;">
            Hi ${userName},
        </p>

        <p style="font-size: 16px; color: #333;">
            We're delighted to confirm that your ELARA order has been successfully delivered!
        </p>

        <div style="background-color: #f0f9f0; border-left: 4px solid #10B981; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1a1a1a; font-size: 16px;">
                ✅ <strong>Delivered Successfully</strong><br>
                <span style="color: #666; font-size: 14px;">Order #${orderId.slice(0, 8).toUpperCase()}</span>
            </p>
        </div>

        <p style="font-size: 16px; color: #333;">
            We hope you love your new fragrances! Each scent has been carefully selected to bring timeless elegance to your collection.
        </p>

        <h3 style="color: #1a1a1a; margin-top: 30px;">How was your experience?</h3>
        <p style="font-size: 16px; color: #333;">
            Your feedback helps us serve you better. Take a moment to rate your purchase and share your thoughts.
        </p>

        <p style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/orders" 
               style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Rate Your Purchase
            </a>
        </p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1a1a1a; margin-top: 0;">💡 Care Tips for Your Fragrances</h4>
            <ul style="color: #666; line-height: 1.8; margin: 10px 0;">
                <li>Store in a cool, dry place away from direct sunlight</li>
                <li>Keep the cap tightly closed when not in use</li>
                <li>Apply to pulse points for longer-lasting scent</li>
            </ul>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Thank you for choosing ELARA. We look forward to serving you again! ✨<br>
            <strong>The ELARA Team</strong>
        </p>
    `;

    return getEmailTemplate({
        body,
        preheader: 'Your ELARA order has been delivered successfully!'
    });
}
