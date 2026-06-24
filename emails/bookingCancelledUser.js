module.exports = booking => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Booking Cancelled</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:#dc2626;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        Booking Cancelled
                    </h1>
                </div>

                <!-- Content -->
                <div style="padding:35px;">
                    <p style="font-size:16px;color:#333;">
                        Hi <strong>${booking.user?.username || "Guest"}</strong>,
                    </p>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        Your booking has been successfully cancelled. The host has been notified,
                        and the reserved rooms have been released.
                    </p>

                    <!-- Booking Summary -->
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:25px 0;">
                        <h3 style="margin-top:0;color:#111827;">
                            Cancelled Booking Details
                        </h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Property</td>
                                <td style="padding:8px 0;text-align:right;font-weight:bold;">
                                    ${booking.listing?.title || "Property"}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Check-in</td>
                                <td style="padding:8px 0;text-align:right;">
                                    ${new Date(booking.checkIn).toLocaleDateString()}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Check-out</td>
                                <td style="padding:8px 0;text-align:right;">
                                    ${new Date(booking.checkOut).toLocaleDateString()}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Total Amount</td>
                                <td style="padding:8px 0;text-align:right;font-weight:bold;">
                                    $${booking.totalPrice}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Status</td>
                                <td style="padding:8px 0;text-align:right;">
                                    <span style="background:#fee2e2;color:#991b1b;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold;">
                                        CANCELLED
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:15px;border-radius:6px;margin:20px 0;">
                        <p style="margin:0;color:#9a3412;font-size:14px;">
                            If you are eligible for a refund, it will be processed according to the property's cancellation policy.
                        </p>
                    </div>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        We're sorry your plans changed. Whenever you're ready for your next trip,
                        we'll be happy to help you find the perfect stay.
                    </p>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${process.env.BASE_URL || "#"}"
                        style="background:#111827;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">
                            Explore Stays
                        </a>
                    </div>

                    <p style="margin-top:30px;color:#111827;">
                        Best regards,<br>
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