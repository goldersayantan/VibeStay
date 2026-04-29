const {Resend} = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async(to, subject, html) => {
    try {
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html
        });
        console.log("Email sent successfully.", response);
    }catch(err) {
        console.log("Error sending emails", err);
        throw err;
    }
};

module.exports = sendEmail;