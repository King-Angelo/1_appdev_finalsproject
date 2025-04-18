const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendEmail(template, to, subject, data) {
        try {
            // Render email template
            const templatePath = path.join(__dirname, `../views/emails/${template}.ejs`);
            const html = await ejs.renderFile(templatePath, data);

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    async sendVerificationEmail(user, token) {
        const verificationUrl = `${process.env.BASE_URL}/auth/verify-email/${token}`;
        await this.sendEmail('verification', user.email, 'Verify Your Email', {
            user,
            verificationUrl
        });
    }

    async sendPasswordResetEmail(user, token) {
        const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${token}`;
        await this.sendEmail('password-reset', user.email, 'Reset Your Password', {
            user,
            resetUrl
        });
    }

    async sendApplicationStatusEmail(application) {
        await this.sendEmail('application-status', application.jobseeker.email, 
            'Application Status Update', {
                application,
                user: application.jobseeker,
                job: application.job
            });
    }

    async sendWelcomeEmail(user) {
        await this.sendEmail('welcome', user.email, 'Welcome to Job Portal', {
            user
        });
    }
}

module.exports = new EmailService(); 