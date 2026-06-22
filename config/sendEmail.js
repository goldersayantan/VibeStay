const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"VibeStay" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });
    } catch (err) {
        throw err;
    }
};

module.exports = sendEmail;