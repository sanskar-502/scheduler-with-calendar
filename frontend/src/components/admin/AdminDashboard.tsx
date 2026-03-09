/**
 * AdminDashboard.tsx – Bonus feature: Admin view of all bookings
 * Fetches from GET /api/bookings and displays in a responsive table.
 */
import { useEffect, useState } from "react";

/* ── TypeScript interfaces ── */

interface BookingRecord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  selectedDate: string;
  selectedTime: string;
  timezone: string;
  status: string;
  createdAt: string;
}

/* ── Helpers ── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Status badge color mapping */
function statusClasses(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/* ═══════════════════════════════════════════
   AdminDashboard component
   ═══════════════════════════════════════════ */

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/bookings`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data: BookingRecord[] = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-page-bg">
      {/* ── Header ── */}
      <header className="bg-slate-blue px-6 py-5 shadow-md">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Admin Dashboard — All Bookings
          </h1>
          <a
            href="#"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium
                       text-white transition hover:bg-white/10
                       focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-white"
          >
            ← Back to Scheduler
          </a>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto px-4 py-8 sm:px-6">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4
                            border-slate-blue border-t-transparent" />
            <span className="ml-3 text-sm text-slate-500">Loading bookings…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-lg bg-red-50 px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="rounded-lg bg-white px-6 py-16 text-center shadow-sm ring-1 ring-card-border">
            <p className="text-lg font-semibold text-slate-blue">No bookings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Bookings will appear here once users submit them.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-card-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">#</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">First Name</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Last Name</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Email</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Date</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Time</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Timezone</th>
                    <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-blue">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr
                      key={b._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50/60
                                 last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-slate-400 font-medium">
                        {i + 1}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-700">
                        {b.firstName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {b.lastName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-timezone-teal font-medium">
                        {b.email}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {formatDate(b.selectedDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-700">
                        {b.selectedTime}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                        UTC {b.timezone}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs
                                      font-semibold capitalize ${statusClasses(b.status)}`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="border-t border-gray-200 bg-gray-50/50 px-5 py-3 text-xs text-slate-500">
              Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""} — sorted by newest first
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
