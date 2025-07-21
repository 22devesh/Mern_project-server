const nodemailer = require('nodemailer');

const sendMail = async (options) => {
    // 1. Create a transporter specifically for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail', // This automatically sets the host and port for Gmail
        auth: {
            user: process.env.GMAIL_EMAIL_ID,      // Uses your variable from .env
            pass: process.env.GMAIL_APP_PASSWORD   // Uses your variable from .env
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: `"Affiliate++" <${process.env.GMAIL_EMAIL_ID}>`, // Set the "from" address
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    // 3. Actually send the email with error logging
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email} with subject: ${options.subject}`);
    } catch (error) {
        console.error(`Failed to send email to ${options.email}:`, error);
        throw error; // Rethrow so the calling function can handle it
    }
};

module.exports = sendMail;