const axios = require("axios");

const sendEmail = async (to, subject, html) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "VibeStay",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Brevo email sent successfully:", response.data);

        return response.data;

    } catch (err) {
        console.error("Brevo Error:", {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
        });

        throw err;
    }
};

module.exports = sendEmail;