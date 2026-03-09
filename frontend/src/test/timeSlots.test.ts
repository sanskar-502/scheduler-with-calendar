/**
 * timeSlots.test.ts – Unit tests for the time slot generation and filtering utilities
 *
 * Tests the core scheduling logic:
 *  1. Full 24-hour slot generation (96 slots)
 *  2. timeStringToMinutes helper
 *  3. Past-time filtering for "today" using IANA timezones
 *  4. Booking conflict filtering (30-min meeting overlap)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateAllSlots,
  filterAvailableSlots,
  timeStringToMinutes,
  getCurrentMinutesInTimezone,
  getTodayInTimezone,
} from "../utils/timeSlots";

/* ═══════════════════════════════════════════
   Test 1: generateAllSlots – Full 24-hour schedule
   ═══════════════════════════════════════════ */
describe("generateAllSlots", () => {
  it("generates exactly 96 time slots from 00:00 to 23:45", () => {
    const slots = generateAllSlots();

    // Total count
    expect(slots).toHaveLength(96);

    // First and last slots
    expect(slots[0]).toBe("00:00");
    expect(slots[slots.length - 1]).toBe("23:45");

    // Spot-check a few known slots
    expect(slots[1]).toBe("00:15");
    expect(slots[4]).toBe("01:00");
    expect(slots[48]).toBe("12:00"); // noon
    expect(slots[56]).toBe("14:00"); // 2 PM
    expect(slots[95]).toBe("23:45"); // last slot
  });

  it("produces slots in 15-minute intervals", () => {
    const slots = generateAllSlots();

    for (let i = 1; i < slots.length; i++) {
      const prevMinutes = timeStringToMinutes(slots[i - 1]);
      const currMinutes = timeStringToMinutes(slots[i]);
      expect(currMinutes - prevMinutes).toBe(15);
    }
  });
});

/* ═══════════════════════════════════════════
   Test 2: timeStringToMinutes – Conversion helper
   ═══════════════════════════════════════════ */
describe("timeStringToMinutes", () => {
  it("converts HH:MM strings to minutes from midnight", () => {
    expect(timeStringToMinutes("00:00")).toBe(0);
    expect(timeStringToMinutes("01:00")).toBe(60);
    expect(timeStringToMinutes("14:30")).toBe(870);
    expect(timeStringToMinutes("23:45")).toBe(1425);
    expect(timeStringToMinutes("05:30")).toBe(330);
  });
});

/* ═══════════════════════════════════════════
   Test 3: filterAvailableSlots – Booking conflict resolution
   ═══════════════════════════════════════════ */
describe("filterAvailableSlots – booking conflicts", () => {
  // Use a future date so the "isToday" past-time filter doesn't interfere
  const futureDate = "2099-12-25";
  const iana = "Asia/Kolkata";

  it("removes the booked slot AND the next 15-min slot (30-min meeting overlap)", () => {
    const allSlots = generateAllSlots();

    // Simulate a booking at 14:00
    const bookedSlots = ["14:00"];

    const available = filterAvailableSlots(allSlots, bookedSlots, futureDate, iana);

    // 14:00 should be removed (exact match)
    expect(available).not.toContain("14:00");

    // 14:15 should also be removed (30-min overlap: 14:15 - 15 = 14:00, which is booked)
    expect(available).not.toContain("14:15");

    // 13:45 should still be available
    expect(available).toContain("13:45");

    // 14:30 should still be available
    expect(available).toContain("14:30");
  });

  it("handles multiple bookings and their overlaps correctly", () => {
    const allSlots = generateAllSlots();

    // Bookings at 09:00 and 16:30
    const bookedSlots = ["09:00", "16:30"];

    const available = filterAvailableSlots(allSlots, bookedSlots, futureDate, iana);

    // 09:00 and 09:15 should be removed
    expect(available).not.toContain("09:00");
    expect(available).not.toContain("09:15");
    expect(available).toContain("08:45");
    expect(available).toContain("09:30");

    // 16:30 and 16:45 should be removed
    expect(available).not.toContain("16:30");
    expect(available).not.toContain("16:45");
    expect(available).toContain("16:15");
    expect(available).toContain("17:00");
  });

  it("returns all 96 slots when there are no bookings and the date is in the future", () => {
    const allSlots = generateAllSlots();
    const available = filterAvailableSlots(allSlots, [], futureDate, iana);
    expect(available).toHaveLength(96);
  });
});

/* ═══════════════════════════════════════════
   Test 4: filterAvailableSlots – Past-time filtering for today
   ═══════════════════════════════════════════ */
describe("filterAvailableSlots – past-time filtering", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("filters out past slots when the selected date is today in the selected timezone", () => {
    const allSlots = generateAllSlots();
    const iana = "Asia/Kolkata";

    // Get what "today" is in Asia/Kolkata right now
    const todayStr = getTodayInTimezone(iana);

    // Get current minutes in that timezone
    const currentMinutes = getCurrentMinutesInTimezone(iana);

    const available = filterAvailableSlots(allSlots, [], todayStr, iana);

    // Every slot in the result must have minutes > currentMinutes
    for (const slot of available) {
      const slotMin = timeStringToMinutes(slot);
      expect(slotMin).toBeGreaterThan(currentMinutes);
    }

    // The count should be less than 96 (some past slots removed)
    expect(available.length).toBeLessThan(96);
  });
});
