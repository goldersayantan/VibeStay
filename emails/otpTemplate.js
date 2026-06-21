module.exports = (username, otp) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">

            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:#2563eb;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        Account Verification
                    </h1>
                </div>

                <!-- Content -->
                <div style="padding:35px;">

                    <p style="font-size:16px;color:#333;">
                        Hi <strong>${username}</strong>,
                    </p>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        Thank you for choosing VibeStay. To complete your account verification, please use the One-Time Password (OTP) below.
                    </p>

                    <!-- OTP Box -->
                    <div style="text-align:center;margin:35px 0;">
                        <div style="
                            display:inline-block;
                            background:#eff6ff;
                            border:2px dashed #2563eb;
                            border-radius:12px;
                            padding:20px 40px;
                        ">
                            <p style="margin:0;color:#6b7280;font-size:13px;letter-spacing:1px;">
                                YOUR OTP
                            </p>
                            <h2 style="
                                margin:10px 0 0;
                                color:#2563eb;
                                font-size:36px;
                                letter-spacing:6px;
                            ">
                                ${otp}
                            </h2>
                        </div>
                    </div>

                    <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:15px;border-radius:6px;margin:25px 0;">
                        <p style="margin:0;color:#9a3412;font-size:14px;">
                            This OTP is valid for a limited time. Please do not share it with anyone.
                        </p>
                    </div>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        If you did not request this verification, you can safely ignore this email.
                    </p>

                    <p style="margin-top:30px;color:#111827;">
                        Regards,<br>
                        <strong>VibeStay Team</strong>
                    </p>

                </div>

                <!-- Footer -->
                <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                        © ${new Date().getFullYear()} VibeStay. All rights reserved.
                    </p>
                </div>

            </div>

        </body>
        </html>
    `;
};
