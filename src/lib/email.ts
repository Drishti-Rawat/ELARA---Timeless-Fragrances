
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"ELARA" <no-reply@elara.com>';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

type EmailPayload = {
    to: string;
    subject: string;
    text?: string;
    html: string;
};

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
    if (!SMTP_HOST || !SMTP_USER) {
        console.warn("SMTP not configured. Email logged:", { to, subject, text });
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
