/**
 * TimeSlotPicker.tsx – Right column of the scheduler card
 * Full 24-hour time slots with IANA-timezone-aware past-time filtering
 * and MongoDB booking conflict resolution.
 */
import { useMemo, useState, useRef, useEffect } from "react";
import {
  TIMEZONE_OPTIONS,
  generateAllSlots,
  filterAvailableSlots,
  type TimezoneOption,
} from "../../utils/timeSlots";

/* ── TypeScript interfaces ── */

export interface TimeSlotPickerProps {
  /** Meeting location label (e.g. "Google Meet") */
  meetingLocation: string;
  /** Duration string displayed in the bar (e.g. "30 mins") */
  meetingDuration: string;
  /** Formatted selected date (e.g. "9 March 2026") */
  selectedDateLabel: string;
  /** ISO date string for availability API calls (e.g. "2026-03-09") */
  selectedDateISO: string;
  /** Currently selected timezone offset (e.g. "+05:30") */
  selectedTimezone: string;
  /** Callback when timezone changes */
  onTimezoneChange: (offset: string) => void;
  /** Currently selected time slot (e.g. "16:30") or null */
  selectedTime: string | null;
  /** Callback when a time slot is clicked */
  onSelectTime: (time: string) => void;
}

/* ═══════════════════════════════════════════
   TimeSlotPicker component
   ═══════════════════════════════════════════ */

export default function TimeSlotPicker({
  meetingLocation,
  meetingDuration,
  selectedDateLabel,
  selectedDateISO,
  selectedTimezone,
  onTimezoneChange,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  /* ── Derived data ── */
  const currentTz: TimezoneOption =
    TIMEZONE_OPTIONS.find((tz) => tz.offset === selectedTimezone) ??
    TIMEZONE_OPTIONS[1]; // fallback to +05:30

  /* Generate all 96 slots (00:00–23:45) — no timezone math, pure generation */
  const allSlots = useMemo(() => generateAllSlots(), []);

  /* ── Booked slots from API ── */
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDateISO) return;

    let cancelled = false;

    async function fetchAvailability() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(
          `${API_URL}/bookings/availability?date=${selectedDateISO}`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const data: string[] = await res.json();
        if (!cancelled) setBookedSlots(data);
      } catch {
        if (!cancelled) setBookedSlots([]);
      }
    }

    fetchAvailability();
    return () => { cancelled = true; };
  }, [selectedDateISO]);

  /* ── Filter: past-time (IANA-aware) + booking conflicts ── */
  const availableSlots = useMemo(
    () => filterAvailableSlots(allSlots, bookedSlots, selectedDateISO, currentTz.iana),
    [allSlots, bookedSlots, selectedDateISO, currentTz.iana],
  );

  /* ── Dropdown state ── */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close on Escape
  function handleDropdownKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  }

  function selectTimezone(tz: TimezoneOption) {
    onTimezoneChange(tz.offset);
    setDropdownOpen(false);
    // Return focus to trigger for keyboard users
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <section
      className="flex flex-1 md:flex-none md:w-1/2 flex-col bg-white md:p-7
                 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none"
      aria-label="Time slot selection"
    >
      {/* ── Meeting location ── */}
      <div className="pb-5 pl-1.5">
        <h3 className="text-[17px] font-bold text-[#21364A]">
          Meeting location
        </h3>
        <div className="flex items-center gap-1.5 mt-3 text-[15px] font-medium text-slate-500">
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

      {/* ── Meeting duration ── */}
      <div className="mb-8 pb-5">
        <h3 className="text-[17px] font-bold text-[#21364A] mt-8 pb-2">
          Meeting duration
        </h3>
        <div className="w-full bg-[#cbd5e1]/60 text-[#334155] text-[15px] font-semibold py-2.5 rounded-md mt-4 text-center">
          {meetingDuration}
        </div>
      </div>

      {/* ── What time works best? ── */}
      <div className="mb-2 pb-3">
        <h2 className="text-[19px] font-bold text-[#21364A] mt-10">
          What time works best?
        </h2>
        <p className="text-[15px] font-medium text-slate-500 mt-3">
          Showing times for{" "}
          <span className="font-semibold text-slate-700">
            {selectedDateLabel}
          </span>
        </p>
      </div>

      {/* ── Timezone dropdown ── */}
      <div
        ref={dropdownRef}
        className="relative mt-2 mb-4 self-start pb-2"
        onKeyDown={handleDropdownKeyDown}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="text-[15px] font-bold text-[#0f766e] mt-4 flex items-center cursor-pointer gap-1
                     transition hover:opacity-80
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-timezone-teal"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label={`Select timezone, currently ${currentTz.label}`}
        >
          <span>{currentTz.label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <ul
            role="listbox"
            aria-label="Timezone options"
            className="absolute left-0 top-full z-10 mt-1 w-max min-w-full
                       rounded-lg border border-gray-200 bg-white py-1
                       shadow-lg"
          >
            {TIMEZONE_OPTIONS.map((tz) => {
              const isActive = tz.offset === selectedTimezone;
              return (
                <li
                  key={tz.offset}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => selectTimezone(tz)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectTimezone(tz);
                    }
                  }}
                  className={`cursor-pointer px-4 py-2 text-sm transition
                    ${isActive
                      ? "bg-timezone-teal/10 font-semibold text-timezone-teal"
                      : "text-slate-600 hover:bg-gray-50"
                    }
                    focus-visible:outline-2 focus-visible:-outline-offset-2
                    focus-visible:outline-timezone-teal`}
                >
                  {tz.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Time slots (scrollable) ── */}
      <div
        className="time-slots-scroll -mr-2 flex-1 overflow-y-auto pr-2"
        role="listbox"
        aria-label="Available time slots"
        tabIndex={0}
        style={{ maxHeight: "340px" }}
      >
        <div className="flex flex-col gap-2.5">
          {availableSlots.map((time) => {
            const isActive = time === selectedTime;
            return (
              <div
                key={time}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => onSelectTime(time)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTime(time);
                  }
                }}
                className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-lg
                  border text-sm font-medium transition
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-timezone-teal
                  ${isActive
                    ? "border-timezone-teal bg-timezone-teal/10 font-semibold text-timezone-teal"
                    : "border-gray-200 bg-white text-slate-600 hover:border-timezone-teal hover:text-timezone-teal"
                  }`}
              >
                {time}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
