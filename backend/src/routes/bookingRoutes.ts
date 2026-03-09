/**
 * bookingRoutes.ts – Routes for booking operations
 * GET    /               — Fetch all bookings (admin)
 * GET    /availability   — Get booked time slots for a date
 * GET    /busy-dates     — Get fully-booked dates
 * POST   /               — Create a new booking (rate-limited)
 * DELETE /:id            — Cancel a booking
 * PUT    /:id            — Reschedule a booking
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createBooking,
  getAllBookings,
  cancelBooking,
  rescheduleBooking,
  getBookedTimes,
  getBusyDates,
} from "../controllers/bookingController";

const router = Router();

/**
 * Rate limiter: max 5 booking requests per IP every 15 minutes.
 * Prevents spam abuse on the POST endpoint.
 */
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,    // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable `X-RateLimit-*` headers
  message: {
    error: "Too many booking requests from this IP. Please try again after 15 minutes.",
  },
});

// GET /api/bookings/availability?date=2026-03-09 — booked times for a date
// ⚠️ Must come BEFORE /:id to avoid matching as an ID
router.get("/availability", getBookedTimes);

// GET /api/bookings/busy-dates — fully-booked dates
router.get("/busy-dates", getBusyDates);

// GET /api/bookings — all bookings (admin view)
router.get("/", getAllBookings);

// POST /api/bookings — rate-limited
router.post("/", bookingLimiter, createBooking);

// DELETE /api/bookings/:id — cancel a booking
router.delete("/:id", cancelBooking);

// PUT /api/bookings/:id — reschedule a booking
router.put("/:id", rescheduleBooking);

export default router;
