/**
 * emailService.ts – Sends booking confirmation emails via Gmail SMTP
 * Uses process.env.EMAIL_USER and EMAIL_PASS for authentication.
 * Uses process.env.DEFAULT_MEET_LINK for the Google Meet link.
 */
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import type { IBooking } from "../models/Booking";

/* ── Helpers ── */

/**
 * Formats a Date object as "9 March 2026".
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* 
function generateRandomMeetCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * 26)]).join("");
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
}
*/

/* ── Gmail transporter (lazy-initialized) ── */

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    console.log("Email User:", process.env.EMAIL_USER ? "Found" : "Missing");
    console.log("Email Pass:", process.env.EMAIL_PASS ? "Found" : "Missing");

    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return _transporter;
}

/* ── HTML email template ── */

/**
 * Builds the HTML email body with the dynamic Google Meet link.
 */
function buildEmailHTML(booking: IBooking, meetLink: string): string {
  const date = formatDate(booking.selectedDate);
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const rescheduleUrl = `${frontendUrl}/reschedule?id=${booking._id}`;
  const cancelUrl = `${frontendUrl}/cancel?id=${booking._id}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 0; text-align:center;">
              <h1 style="margin:0; font-size:22px; font-weight:600; color:#2d3e50; line-height:1.4;">
                New meeting booked with<br/>Serruys
              </h1>
            </td>
          </tr>

          <!-- Avatar -->
          <tr>
            <td style="padding:24px 0; text-align:center;">
              <div style="width:72px; height:72px; border-radius:50%; background-color:#d1d5db; margin:0 auto;"></div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0; font-size:15px; color:#2d3e50; font-weight:500;">
                Hi ${booking.firstName},
              </p>
              <p style="margin:8px 0 0; font-size:14px; color:#6b7280; line-height:1.5;">
                Your meeting has been confirmed. Here are the details:
              </p>
            </td>
          </tr>

          <!-- Email address -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0 0 4px; font-size:12px; color:#9ca3af; text-transform:none; letter-spacing:0.02em;">Email address</p>
              <p style="margin:0; font-size:14px; color:#1a8a8a; font-weight:500;">${booking.email}</p>
            </td>
          </tr>

          <!-- Date / time -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0 0 4px; font-size:12px; color:#9ca3af;">Date / time</p>
              <p style="margin:0; font-size:14px; color:#2d3e50; font-weight:500;">
                ${date} ${booking.selectedTime} IST (UTC ${booking.timezone})
              </p>
            </td>
          </tr>

          <!-- Location / Meet Link -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0 0 4px; font-size:12px; color:#9ca3af;">Location</p>
              <a href="${meetLink}" style="font-size:14px; color:#1a8a8a; text-decoration:none; font-weight:500;">${meetLink}</a>
            </td>
          </tr>

          <!-- Join Meeting Button -->
          <tr>
            <td style="padding:24px 40px 0; text-align:center;">
              <a href="${meetLink}"
                 style="display:inline-block; padding:12px 32px;
                        background-color:#1a8a8a; color:#ffffff; font-size:14px;
                        font-weight:600; text-decoration:none; border-radius:8px;
                        letter-spacing:0.02em;">
                Join Meeting
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0;">
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:20px 40px 0; text-align:center;">
              <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.5;">
                Note: if you need to make changes to your meeting, you can here:
              </p>
            </td>
          </tr>

          <!-- Action buttons -->
          <tr>
            <td style="padding:16px 40px 0; text-align:center;">
              <a href="${rescheduleUrl}"
                 style="display:inline-block; padding:8px 20px; margin-right:8px;
                        background-color:#e8636f; color:#ffffff; font-size:13px;
                        font-weight:600; text-decoration:none; border-radius:6px;">
                Reschedule
              </a>
              <a href="${cancelUrl}"
                 style="display:inline-block; padding:8px 20px;
                        background-color:#ffffff; color:#e8636f; font-size:13px;
                        font-weight:600; text-decoration:none; border-radius:6px;
                        border:1.5px solid #e8636f;">
                Cancel
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 40px 0;">
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
            </td>
          </tr>

          <!-- Footer spacer -->
          <tr>
            <td style="padding:16px 0;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Main export ── */

/**
 * Sends a confirmation email for the given booking via Gmail SMTP.
 * Uses a permanent Google Meet link from process.env.DEFAULT_MEET_LINK.
 *
 * Error-safe: if Gmail SMTP fails (bad password, etc.), it logs the error
 * but does NOT throw — the user still sees the "Success" screen.
 */
export async function sendConfirmationEmail(booking: IBooking): Promise<void> {
  try {
    const meetLink = process.env.DEFAULT_MEET_LINK || "https://meet.google.com/fallback-link";

    console.log(`Generated Meet Link: ${meetLink}`);

    const info = await getTransporter().sendMail({
      from: `"Climatiq Scheduler" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Meeting Confirmed – ${formatDate(booking.selectedDate)} at ${booking.selectedTime}`,
      html: buildEmailHTML(booking, meetLink),
    });

    console.log("   Confirmation email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Meet Link: ${meetLink}`);
  } catch (error) {
    // Graceful failure — log the error but don't crash the booking flow
    console.error("   Failed to send confirmation email:", error);
    console.error("   Ensure EMAIL_USER and EMAIL_PASS are set correctly in .env");
    console.error("   For Gmail, use an App Password: https://myaccount.google.com/apppasswords");
  }
}
