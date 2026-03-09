/**
 * BookingForm.tsx – Step 2: User information form
 * Collects user data and POST's to the backend API.
 */
import { useState, type FormEvent } from "react";

/* ── TypeScript interfaces ── */

export interface BookingFormProps {
  /** The selected date */
  selectedDate: Date;
  /** The selected time slot (e.g. "16:30") */
  selectedTime: string;
  /** Selected timezone offset (e.g. "+05:30") */
  selectedTimezone: string;
  /** Meeting location label */
  meetingLocation: string;
  /** Go back to step 1 */
  onBack: () => void;
  /** Called after a successful API submission to advance to step 3 */
  onSuccess: () => void;
}

/* ═══════════════════════════════════════════
   BookingForm component
   ═══════════════════════════════════════════ */

export default function BookingForm({
  selectedDate,
  selectedTime,
  selectedTimezone,
  meetingLocation,
  onBack,
  onSuccess,
}: BookingFormProps) {
  /* ── Local state ── */
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Format date as "Monday, 9 March 2026" */
  const formattedDate = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Trigger native validation UI
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const firstName = (data.get("firstName") as string).trim();
    const lastName = (data.get("surname") as string).trim();
    const email = (data.get("email") as string).trim();

    // JS-level guard
    if (!firstName || !lastName || !email) return;

    // Clear any previous error
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          selectedDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
          selectedTime,
          timezone: selectedTimezone,
        }),
      });

      if (response.ok) {
        // 201 Created — advance to confirmation
        onSuccess();
        return;
      }

      // Parse error response
      const errorData = await response.json().catch(() => null);

      if (response.status === 429) {
        setErrorMessage(
          errorData?.error ||
          "Too many requests. Please try again after 15 minutes.",
        );
      } else if (response.status === 400) {
        setErrorMessage(
          errorData?.details || errorData?.error || "Invalid booking data. Please check your inputs.",
        );
      } else {
        setErrorMessage(
          errorData?.error || `Something went wrong (status ${response.status}). Please try again.`,
        );
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className="flex flex-1 w-full flex-col rounded-2xl bg-white p-8 md:p-10"
      aria-label="Booking information form"
    >
      {/* ── Header ── */}
      <h2 className="text-2xl font-bold text-slate-blue pb-2">Your information</h2>

      {/* ── Booking summary ── */}
      <div className="mt-4 mb-6 pb-3">
        <div className="flex items-center gap-2">
          <p className="text-md font-bold text-slate-blue">
            {formattedDate} {selectedTime}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-sm font-medium text-timezone-teal transition hover:opacity-80
                       focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-timezone-teal"
          >
            Edit
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0 text-slate-blue"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{meetingLocation}</span>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
        {/* Name fields – two-column grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* First name */}
          <div>
            <label
              htmlFor="booking-first-name"
              className="mb-1.5 block text-md font-semibold text-slate-blue"
            >
              First name <span className="text-red-500">*</span>
            </label>
            <input
              id="booking-first-name"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Jane"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3
                         text-md text-slate-700 placeholder:text-slate-400
                         transition disabled:opacity-60 disabled:cursor-not-allowed
                         focus:border-timezone-teal focus:outline-none focus:ring-2
                         focus:ring-timezone-teal/30"
            />
          </div>

          {/* Surname */}
          <div>
            <label
              htmlFor="booking-surname"
              className="mb-1.5 block text-md font-semibold text-slate-blue"
            >
              Surname <span className="text-red-500">*</span>
            </label>
            <input
              id="booking-surname"
              name="surname"
              type="text"
              required
              autoComplete="family-name"
              placeholder="Doe"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3
                         text-md text-slate-700 placeholder:text-slate-400
                         transition disabled:opacity-60 disabled:cursor-not-allowed
                         focus:border-timezone-teal focus:outline-none focus:ring-2
                         focus:ring-timezone-teal/30"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="booking-email"
            className="mb-1.5 block text-md font-semibold text-slate-blue"
          >
            Your email address <span className="text-red-500">*</span>
          </label>
          <input
            id="booking-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
            placeholder="jane@example.com"
            disabled={isLoading}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3
                       text-md text-slate-700 placeholder:text-slate-400
                       transition disabled:opacity-60 disabled:cursor-not-allowed
                       focus:border-timezone-teal focus:outline-none focus:ring-2
                       focus:ring-timezone-teal/30"
          />
        </div>

        {/* ── Error message ── */}
        {errorMessage && (
          <div
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* ── Footer buttons ── */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="cursor-pointer flex items-center gap-1 rounded-lg border border-gray-300
                       px-5 py-2.5 text-sm font-medium text-slate-600
                       transition hover:bg-gray-50
                       disabled:opacity-60 disabled:cursor-not-allowed
                       focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-timezone-teal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer rounded-lg bg-slate-blue px-6 py-2.5 text-sm font-semibold
                       text-white transition hover:bg-slate-blue-light
                       disabled:opacity-60 disabled:cursor-not-allowed
                       focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-slate-blue"
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </form>
    </section>
  );
}
