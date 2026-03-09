/**
 * RescheduleBooking.tsx – Reschedule booking page
 * Reuses Calendar + TimeSlotPicker to let the user pick a new date/time,
 * then sends a PUT request to update the booking.
 */
import { useState } from "react";
import Calendar from "../calendar/Calendar";
import TimeSlotPicker from "./TimeSlotPicker";

/* ── Props ── */

interface RescheduleBookingProps {
  bookingId: string;
}

/** Earliest selectable date */
const MIN_DATE = new Date(2026, 2, 9);

/** Default timezone */
const DEFAULT_TZ = "+05:30";

/* ═══════════════════════════════════════════
   RescheduleBooking component
   ═══════════════════════════════════════════ */

export default function RescheduleBooking({ bookingId }: RescheduleBookingProps) {
  /* ── State ── */
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 9));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TZ);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDateLabel = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleDateChange(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  /** When user clicks a time slot, send the PUT request immediately */
  async function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(
        `${API_URL}/bookings/${bookingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
            selectedTime: time,
          }),
        },
      );

      if (res.ok) {
        setIsDone(true);
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || `Failed to reschedule (status ${res.status})`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Success state ── */
  if (isDone) {
    const formattedDate = selectedDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
        {/* Added flex flex-col items-center right here 👇 */}
        <div className="w-full max-w-md rounded-2xl bg-white p-10 flex flex-col items-center text-center shadow-lg ring-1 ring-card-border">
          <div className="mb-15 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-8 w-8 text-emerald-600"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-blue">Meeting Rescheduled</h1>
          <p className="mt-3 text-sm text-slate-500 pb-2">
            Your booking has been updated to:
          </p>
          <div className="mt-4 pb-3">
            <p className="text-lg font-bold text-slate-blue">{formattedDate}</p>
            <p className="text-lg font-bold text-slate-blue">{selectedTime}</p>
          </div>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-slate-blue px-6 py-2.5
                       text-sm font-semibold text-white transition hover:bg-slate-blue-light"
          >
            Back to Scheduler
          </a>
        </div>
      </div>
    );
  }

  /* ── Reschedule picker ── */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page-bg px-4 py-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-blue">Reschedule Meeting</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick a new date and time below
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 w-full max-w-[820px] rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Loading overlay text */}
      {isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-blue border-t-transparent" />
          Rescheduling...
        </div>
      )}

      {/* Card — reuses Calendar + TimeSlotPicker */}
      <main className="w-full max-w-[820px] rounded-2xl bg-white shadow-lg
                       ring-1 ring-card-border flex flex-col md:flex-row">
        <Calendar
          hostName="Victoire Serruys"
          avatarInitial="V"
          month={2}
          year={2026}
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
          minDate={MIN_DATE}
        />
        <TimeSlotPicker
          meetingLocation="Google Meet"
          meetingDuration="30 mins"
          selectedDateLabel={selectedDateLabel}
          selectedDateISO={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
          selectedTimezone={selectedTimezone}
          onTimezoneChange={setSelectedTimezone}
          selectedTime={selectedTime}
          onSelectTime={handleTimeSelect}
        />
      </main>

      {/* Back link */}
      <a
        href="/"
        className="mt-6 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        ← Back to Scheduler
      </a>
    </div>
  );
}
