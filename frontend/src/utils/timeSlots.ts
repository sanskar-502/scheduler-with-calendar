/**
 * timeSlots.ts – Utility for generating time slots with
 * IANA-timezone-aware past-time filtering + booking conflict resolution.
 *
 * Generates a full 24-hour schedule (00:00–23:45) in 15-minute intervals.
 * Filters: (1) past times in the selected timezone, (2) booked slots,
 * (3) 30-minute meeting overlap.
 */

/* ── Types ── */

export interface TimezoneOption {
  /** Machine value, e.g. "+05:30" */
  offset: string;
  /** Display label for the dropdown */
  label: string;
  /** Offset in total minutes from UTC (e.g. +05:30 → 330) */
  offsetMinutes: number;
  /** IANA timezone string for Intl.DateTimeFormat */
  iana: string;
}

/* ── Available timezones ── */

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { offset: "+05:00", label: "UTC +05:00 Karachi, Tashkent",           offsetMinutes: 300, iana: "Asia/Karachi" },
  { offset: "+05:30", label: "UTC +05:30 New Delhi, Mumbai, Calcutta", offsetMinutes: 330, iana: "Asia/Kolkata" },
  { offset: "+06:00", label: "UTC +06:00 Dhaka, Almaty",               offsetMinutes: 360, iana: "Asia/Dhaka" },
  { offset: "+06:30", label: "UTC +06:30 Yangon, Cocos Islands",       offsetMinutes: 390, iana: "Asia/Yangon" },
  { offset: "+07:00", label: "UTC +07:00 Bangkok, Jakarta, Hanoi",     offsetMinutes: 420, iana: "Asia/Bangkok" },
];

/* ── Constants ── */

const SLOT_INTERVAL = 15;  // minutes
const TOTAL_SLOTS   = 96;  // 24h × 4 slots/hour

/* ── Helpers ── */

/**
 * Converts a "HH:MM" string → total minutes from midnight.
 */
export function timeStringToMinutes(time: string): number {
  const [hours, mins] = time.split(":");
  return parseInt(hours, 10) * 60 + parseInt(mins, 10);
}

/**
 * Converts total minutes from midnight → "HH:MM" string.
 */
function minutesToTimeString(totalMinutes: number): string {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mm = String(totalMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Gets the current time in the given IANA timezone as minutes from midnight.
 * Uses Intl.DateTimeFormat for reliable, locale-independent results.
 */
export function getCurrentMinutesInTimezone(ianaTimezone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaTimezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(new Date());

  // formatted is like "01:35" or "24:00" (midnight edge case in some locales)
  const [h, m] = formatted.split(":").map(Number);
  return (h === 24 ? 0 : h) * 60 + m;
}

/**
 * Gets today's date string (YYYY-MM-DD) in the given IANA timezone.
 */
export function getTodayInTimezone(ianaTimezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ianaTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  // en-CA locale outputs "YYYY-MM-DD" format natively
  return parts;
}

/* ── Slot generation ── */

/**
 * Generates all 96 time slot strings (00:00–23:45) for a 24-hour day.
 * Pure generation — no timezone math here.
 *
 * @returns Array of "HH:MM" strings from 00:00 to 23:45
 */
export function generateAllSlots(): string[] {
  const slots: string[] = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    slots.push(minutesToTimeString(i * SLOT_INTERVAL));
  }
  return slots;
}

/**
 * Filters out unavailable slots using reliable minutes-from-midnight math.
 *
 * A slot is blocked if:
 *  1. (If today in selected TZ) Its minutes <= current minutes in that TZ.
 *  2. It exactly matches a booked time.
 *  3. The slot 15 minutes before it is booked (30-min meeting overlap).
 *
 * @param allSlots        – full 96-slot "HH:MM" array
 * @param bookedSlots     – booked "HH:MM" strings from MongoDB
 * @param selectedDateISO – the selected date as "YYYY-MM-DD"
 * @param ianaTimezone    – IANA timezone string (e.g. "Asia/Kolkata")
 * @returns Filtered array of available slot strings
 */
export function filterAvailableSlots(
  allSlots: string[],
  bookedSlots: string[],
  selectedDateISO: string,
  ianaTimezone: string,
): string[] {
  const bookedSet = new Set(bookedSlots);

  // Determine if selectedDate is today in the SELECTED timezone
  const todayInTz = getTodayInTimezone(ianaTimezone);
  const isToday = selectedDateISO === todayInTz;

  // Get current time in the selected timezone as minutes from midnight
  const currentMinutes = isToday ? getCurrentMinutesInTimezone(ianaTimezone) : -1;

  return allSlots.filter((slot) => {
    const slotMinutes = timeStringToMinutes(slot);

    // Rule 1: If today, filter out past slots
    if (isToday && slotMinutes <= currentMinutes) return false;

    // Rule 2: Exact match — this slot is booked
    if (bookedSet.has(slot)) return false;

    // Rule 3: The slot 15 min before this one is booked → 30-min meeting overlap
    const prevSlotMin = slotMinutes - SLOT_INTERVAL;
    if (prevSlotMin >= 0) {
      const prevSlot = minutesToTimeString(prevSlotMin);
      if (bookedSet.has(prevSlot)) return false;
    }

    return true;
  });
}
