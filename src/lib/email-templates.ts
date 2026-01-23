
export function generateEmailHtml(title: string, bodyContent: string, actionButton?: { text: string, url: string }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
        body { margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Inter', sans-serif; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; }
        .header { padding: 40px 0; text-align: center; background-color: #1a1a1a; }
        .logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #ffffff; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; }
        .content { padding: 40px; text-align: center; }
        .title { font-family: 'Playfair Display', serif; font-size: 24px; color: #1a1a1a; margin-bottom: 20px; }
        .text { font-size: 14px; line-height: 1.6; color: #666666; margin-bottom: 30px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #c6a87c; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px; }
        .button:hover { background-color: #b09165; }
        .otp-code { font-family: 'Playfair Display', serif; font-size: 32px; letter-spacing: 8px; color: #c6a87c; margin: 30px 0; font-weight: bold; }
        .footer { padding: 30px; background-color: #faf9f6; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.6; }
        .footer-link { color: #c6a87c; text-decoration: none; }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <table class="container" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header -->
            <tr>
                <td class="header">
                    <a href="https://elara.com" class="logo">ELARA</a>
                </td>
            </tr>
            
            <!-- Content -->
            <tr>
                <td class="content">
                    <h1 class="title">${title}</h1>
                    <div class="text">
                        ${bodyContent}
                    </div>
                    
                    ${actionButton ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <a href="${actionButton.url}" class="button">${actionButton.text}</a>
                            </td>
                        </tr>
                    </table>
                    ` : ''}
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p class="footer-text">
                        © ${new Date().getFullYear()} ELARA. All rights reserved.<br>
                        Designed by <a href="https://tristella.studio" class="footer-link">Tristella Studio</a>
                    </p>
                    <p style="margin-top: 20px; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.4; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
                        <strong>Disclaimer:</strong> This is a demo application for educational/portfolio purposes only. No real orders are processed, and no physical goods will be delivered.
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
    `;
}
