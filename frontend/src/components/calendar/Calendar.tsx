/**
 * Calendar.tsx – Left column of the scheduler card
 * Displays the avatar, meeting title, month navigation, and an interactive
 * calendar grid with disabled weekends, past dates, and fully-booked dates.
 */
import { useEffect, useState } from "react";

/* ── TypeScript interfaces ── */

export interface CalendarProps {
  /** Name of the person to meet */
  hostName: string;
  /** Single-character avatar initial */
  avatarInitial: string;
  /** 0-indexed month (0 = Jan, 2 = March, etc.) */
  month: number;
  /** Full year number */
  year: number;
  /** The currently selected Date object */
  selectedDate: Date;
  /** Callback fired when the user picks a new date */
  onSelectDate: (date: Date) => void;
  /** Earliest selectable date — anything before this is disabled */
  minDate: Date;
}

/* ── Constants ── */

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/* ── Helpers ── */

/** Number of days in a given month (handles leap years). */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * How many leading blank cells in a MON-SUN grid.
 * JS getDay(): 0=Sun … 6=Sat → MON-SUN offset: Mon=0 … Sun=6.
 */
function getLeadingBlanks(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Build the flat cell array: null for blanks, day number otherwise. */
function buildCalendarCells(
  daysInMonth: number,
  leadingBlanks: number,
): (number | null)[] {
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
  const trailingBlanks = totalCells - leadingBlanks - daysInMonth;

  return [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array<null>(trailingBlanks).fill(null),
  ];
}

/** Check if a Date falls on Saturday (6) or Sunday (0). */
function isWeekendDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

/** Check if a date is before the minimum selectable date (day-level). */
function isBeforeMin(
  year: number,
  month: number,
  day: number,
  minDate: Date,
): boolean {
  const d = new Date(year, month, day);
  // Compare at day level only (strip time)
  const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  return d < min;
}

/** Convert a Date to "YYYY-MM-DD" (local timezone). */
function toDateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ── Chevron icons (internal) ── */

function ChevronLeft() {
  return (
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
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Calendar component
   ═══════════════════════════════════════════ */

export default function Calendar({
  hostName,
  avatarInitial,
  month,
  year,
  selectedDate,
  onSelectDate,
  minDate,
}: CalendarProps) {
  const monthLabel = MONTH_NAMES[month];
  const daysInMonth = getDaysInMonth(year, month);
  const leadingBlanks = getLeadingBlanks(year, month);
  const calendarCells = buildCalendarCells(daysInMonth, leadingBlanks);

  const selectedDay = selectedDate.getDate();
  const isSelectedMonth =
    selectedDate.getFullYear() === year && selectedDate.getMonth() === month;

  /* ── Busy dates from API ── */
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function fetchBusyDates() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/bookings/busy-dates`);
        if (!res.ok) return;
        const data: string[] = await res.json();
        if (!cancelled) setBusyDates(new Set(data));
      } catch {
        // Silently ignore — busy date disabling is a nice-to-have
      }
    }

    fetchBusyDates();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="flex flex-col items-center bg-slate-blue px-8 pt-8
                 flex-1 md:flex-none md:w-1/2 md:min-w-[340px] gap-9"
      aria-label="Calendar"
    >


      <div className="gap-2 flex flex-col items-center mt-12 shrink-0">
        {/* Avatar */}
        <div
          className="flex h-17 w-17 items-center justify-center rounded-full
                   bg-avatar-bg text-xl font-semibold text-slate-blue
                   border-[3px] border-avatar-border"
          aria-hidden="true"
        >
          {avatarInitial}
        </div>

        {/* Title */}
        <h1 className="mt-4 mb-2 text-center text-xl font-semibold text-white">
          Meet with {hostName}
        </h1>

        {/* ── Month navigator ── */}
        <nav
          className="mt-6 flex w-full items-center justify-center gap-3"
          aria-label="Month navigation"
        >
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center rounded-full p-1
                     text-nav-chevron transition hover:opacity-80
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-white"
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>

          <span className="text-md font-semibold tracking-wide text-white">
            {monthLabel} {year}
          </span>

          <button
            type="button"
            className="cursor-pointer flex items-center justify-center rounded-full p-1
                     text-nav-chevron transition hover:opacity-80
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-white"
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </nav>
      </div>


      {/* ── Calendar grid ── */}
      <div
        className="mt-8 w-full max-w-[320px]"
        role="grid"
        aria-label={`${monthLabel} ${year} calendar`}
      >
        {/* Weekday header row */}
        <div className="grid grid-cols-7 text-center" role="row">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              role="columnheader"
              className="pb-4 text-[10px] font-semibold uppercase tracking-[0.15em]
                         text-calendar-weekday/70"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <span key={`blank-${idx}`} role="gridcell" />;
            }

            const isSelected = isSelectedMonth && day === selectedDay;
            const isWeekend = isWeekendDate(year, month, day);
            const isPast = isBeforeMin(year, month, day, minDate);
            const isBusy = busyDates.has(toDateISO(year, month, day));
            const isDisabled = isWeekend || isPast || isBusy;

            return (
              <span key={day} role="gridcell">
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  aria-label={`${monthLabel} ${day}, ${year}${isBusy ? " (fully booked)" : ""}`}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelectDate(new Date(year, month, day));
                    }
                  }}
                  className={`
                    mx-auto flex h-9 w-9 items-center justify-center
                    rounded-full text-sm font-medium transition
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-white
                    ${isSelected
                      ? "bg-white text-slate-blue font-semibold"
                      : isDisabled
                        ? "text-calendar-day-muted cursor-not-allowed opacity-50"
                        : "text-white hover:bg-white/15 cursor-pointer"
                    }
                  `}
                >
                  {day}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
