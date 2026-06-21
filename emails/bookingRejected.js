module.exports = booking => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Request Declined</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">

            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:#dc2626;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        Booking Request Declined
                    </h1>
                </div>

                <!-- Content -->
                <div style="padding:35px;">

                    <p style="font-size:16px;color:#333;">
                        Hi <strong>${booking.user?.username || "Guest"}</strong>,
                    </p>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        Unfortunately, the host was unable to accommodate your booking request for the selected dates.
                        This can happen due to availability changes, maintenance schedules, or other hosting constraints.
                    </p>

                    <!-- Status Banner -->
                    <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:15px;border-radius:6px;margin:25px 0;">
                        <p style="margin:0;color:#991b1b;font-size:14px;font-weight:bold;">
                            Status: Booking Request Declined
                        </p>
                        <p style="margin:8px 0 0 0;color:#991b1b;font-size:14px;">
                            No charges have been applied for this booking request.
                        </p>
                    </div>

                    <!-- Booking Summary -->
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:25px 0;">
                        <h3 style="margin-top:0;color:#111827;">
                            Booking Details
                        </h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Property</td>
                                <td style="padding:8px 0;text-align:right;font-weight:bold;">
                                    ${booking.listing?.title || "Property"}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Property Type</td>
                                <td style="padding:8px 0;text-align:right;">
                                    ${booking.listing?.propertyType || "N/A"}
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
                                <td style="padding:8px 0;color:#6b7280;">Requested Amount</td>
                                <td style="padding:8px 0;text-align:right;font-weight:bold;">
                                    ₹${booking.totalPrice}
                                </td>
                            </tr>

                        </table>
                    </div>

                    ${
                        booking.rooms?.length
                            ? `
                    <div style="margin:25px 0;">
                        <h3 style="color:#111827;margin-bottom:12px;">
                            Requested Rooms
                        </h3>

                        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
                            <thead>
                                <tr style="background:#f9fafb;">
                                    <th style="padding:12px;text-align:left;">Room Type</th>
                                    <th style="padding:12px;text-align:center;">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${booking.rooms.map(room => `
                                    <tr>
                                        <td style="padding:12px;border-top:1px solid #e5e7eb;">
                                            ${room.roomType}
                                        </td>
                                        <td style="padding:12px;text-align:center;border-top:1px solid #e5e7eb;">
                                            ${room.quantity}
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                    `
                            : ""
                    }

                    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:15px;border-radius:6px;margin:25px 0;">
                        <p style="margin:0;color:#1e3a8a;font-size:14px;">
                            Don't worry. Thousands of great stays are available on VibeStay.
                            You can continue exploring similar properties and submit another booking request.
                        </p>
                    </div>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${process.env.BASE_URL || "#"}"
                        style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">
                            Find Another Stay
                        </a>
                    </div>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        Thank you for using VibeStay. We hope to help you find the perfect stay for your upcoming trip.
                    </p>

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
