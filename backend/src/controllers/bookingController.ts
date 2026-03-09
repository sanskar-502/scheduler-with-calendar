/**
 * bookingController.ts – Handles booking-related request logic
 */
import { Request, Response } from "express";
import Booking from "../models/Booking";
import { sendConfirmationEmail } from "../utils/emailService";

/**
 * POST /api/bookings
 * Creates a new booking in MongoDB, then fires a confirmation email (non-blocking).
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, selectedDate, selectedTime, timezone } = req.body;

    // ── Validate required fields ──
    const missing: string[] = [];
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (!email) missing.push("email");
    if (!selectedDate) missing.push("selectedDate");
    if (!selectedTime) missing.push("selectedTime");
    if (!timezone) missing.push("timezone");

    if (missing.length > 0) {
      res.status(400).json({
        error: "Missing required fields",
        missingFields: missing,
      });
      return;
    }

    // ── Create and save booking ──
    const booking = await Booking.create({
      firstName,
      lastName,
      email,
      selectedDate,
      selectedTime,
      timezone,
    });

    // ── Send confirmation email (non-blocking) ──
    // Fire-and-forget: user gets 201 instantly, email sends in background
    sendConfirmationEmail(booking).catch((err) =>
      console.error("Email send failed:", err),
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error: unknown) {
    // Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
      return;
    }

    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/bookings
 * Returns all bookings sorted by newest first.
 */
export async function getAllBookings(_req: Request, res: Response): Promise<void> {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/bookings/:id
 * Cancels (deletes) a booking by ID.
 */
export async function cancelBooking(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/bookings/:id
 * Reschedules a booking with a new date and time.
 */
export async function rescheduleBooking(req: Request, res: Response): Promise<void> {
  try {
    const { selectedDate, selectedTime } = req.body;

    if (!selectedDate || !selectedTime) {
      res.status(400).json({
        error: "Missing required fields",
        missingFields: [
          ...(!selectedDate ? ["selectedDate"] : []),
          ...(!selectedTime ? ["selectedTime"] : []),
        ],
      });
      return;
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { selectedDate, selectedTime },
      { new: true, runValidators: true },
    );

    if (!updated) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.status(200).json({
      message: "Booking rescheduled successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/bookings/availability?date=2026-03-09
 * Returns an array of booked time strings for the given date.
 */
export async function getBookedTimes(req: Request, res: Response): Promise<void> {
  try {
    const dateParam = req.query.date as string | undefined;

    if (!dateParam) {
      res.status(400).json({ error: "Missing 'date' query parameter" });
      return;
    }


    // Parse the YYYY-MM-DD string into exact UTC day boundaries
    const [yearStr, monthStr, dayStr] = dateParam.split("-");
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
    const d = parseInt(dayStr, 10);

    // Build UTC midnight boundaries for this specific date
    const dayStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));


    const bookings = await Booking.find({
      selectedDate: { $gte: dayStart, $lte: dayEnd },
    }).select("selectedDate selectedTime");


    const bookedTimes = bookings.map((b) => b.selectedTime);
    res.status(200).json(bookedTimes);
  } catch (error) {
    console.error("Error fetching booked times:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/bookings/busy-dates
 * Returns an array of date strings (YYYY-MM-DD) that are fully booked.
 *
 * A date is "fully booked" when the number of blocked 15-minute slots
 * (each 30-min booking blocks 2 slots) reaches the total available
 * slots in a day (96 = 24h × 4).
 */
export async function getBusyDates(_req: Request, res: Response): Promise<void> {
  try {
    const TOTAL_DAILY_SLOTS = 96; // 00:00 – 23:45 in 15-min intervals

    // Aggregate: group bookings by date, count bookings per date
    const pipeline = await Booking.aggregate([
      {
        $group: {
          _id: "$selectedDate",
          count: { $sum: 1 },
        },
      },
    ]);

    const busyDates: string[] = [];

    for (const entry of pipeline) {
      // Each 30-min booking blocks 2 × 15-min slots
      const blockedSlots = entry.count * 2;

      if (blockedSlots >= TOTAL_DAILY_SLOTS) {
        // Convert the stored date to YYYY-MM-DD
        const d = new Date(entry._id);
        const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        busyDates.push(dateStr);
      }
    }

    res.status(200).json(busyDates);
  } catch (error) {
    console.error("Error fetching busy dates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
