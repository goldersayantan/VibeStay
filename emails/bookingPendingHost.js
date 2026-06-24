module.exports = booking => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>New Booking Request</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:#2563eb;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        New Booking Request
                    </h1>
                </div>

                <!-- Content -->
                <div style="padding:35px;">

                    <p style="font-size:16px;color:#333;">
                        Hi <strong>${booking.host?.username || "Host"}</strong>,
                    </p>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        Great news! A guest has submitted a booking request for your property.
                        Please review the request and respond as soon as possible.
                    </p>

                    <!-- Guest Card -->
                    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px;margin:25px 0;">
                        <h3 style="margin-top:0;color:#1e3a8a;">
                            Guest Information
                        </h3>

                        <p style="margin:8px 0;color:#374151;">
                            <strong>Guest:</strong> ${booking.user?.username || "Guest"}
                        </p>

                        <p style="margin:8px 0;color:#374151;">
                            <strong>Email:</strong> ${booking.user?.email || "Not Available"}
                        </p>
                    </div>

                    <!-- Booking Summary -->
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:25px 0;">
                        <h3 style="margin-top:0;color:#111827;">
                            Booking Summary
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
                                <td style="padding:8px 0;color:#6b7280;">Booking Value</td>
                                <td style="padding:8px 0;text-align:right;font-weight:bold;color:#2563eb;">
                                    $${booking.totalPrice}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Status</td>
                                <td style="padding:8px 0;text-align:right;">
                                    <span style="background:#fef3c7;color:#92400e;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold;">
                                        PENDING REVIEW
                                    </span>
                                </td>
                            </tr>

                        </table>
                    </div>

                    <!-- Room Details -->
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

                    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:15px;border-radius:6px;margin:25px 0;">
                        <p style="margin:0;color:#065f46;font-size:14px;">
                            Responding quickly to booking requests can improve guest satisfaction and increase your chances of securing more reservations.
                        </p>
                    </div>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${process.env.BASE_URL || "#"}"
                        style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">
                            Review Request
                        </a>
                    </div>

                    <p style="margin-top:30px;color:#111827;">
                        Thank you for hosting with <strong>VibeStay</strong>.
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