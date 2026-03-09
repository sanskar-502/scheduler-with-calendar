/**
 * CancelBooking.tsx – Cancel booking page
 * Linked from the confirmation email. Deletes the booking via API.
 */
import { useState } from "react";

/* ── Props ── */

interface CancelBookingProps {
  bookingId: string;
}

/* ═══════════════════════════════════════════
   CancelBooking component
   ═══════════════════════════════════════════ */

export default function CancelBooking({ bookingId }: CancelBookingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(
        `${API_URL}/bookings/${bookingId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setIsDone(true);
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || `Failed to cancel (status ${res.status})`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      {/* Added flex flex-col items-center right here 👇 */}
      <div className="w-full max-w-md rounded-2xl bg-white p-10 flex flex-col items-center text-center shadow-lg ring-1 ring-card-border">
        {isDone ? (
          <>
            {/* ── Success state ── */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
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
            <h1 className="text-2xl font-bold text-slate-blue pb-2">Meeting Cancelled</h1>
            <p className="mt-3 text-sm text-slate-500 pb-3">
              Your booking has been successfully cancelled.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-lg bg-slate-blue px-6 py-2.5
                         text-sm font-semibold text-white transition hover:bg-slate-blue-light"
            >
              Back to Scheduler
            </a>
          </>
        ) : (
          <>
            {/* ── Confirmation prompt ── */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-8 w-8 text-red-500"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-blue pt-2">Cancel Meeting</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 pb-3">
              Are you sure you want to cancel this meeting? This action cannot be undone.
            </p>

            {error && (
              <div
                className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold
                           text-white transition hover:bg-red-600
                           disabled:opacity-60 disabled:cursor-not-allowed
                           focus-visible:outline-2 focus-visible:outline-offset-2
                           focus-visible:outline-red-500"
              >
                {isLoading ? "Cancelling..." : "Cancel Meeting"}
              </button>
              <a
                href="/"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                Never mind, keep my booking
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
