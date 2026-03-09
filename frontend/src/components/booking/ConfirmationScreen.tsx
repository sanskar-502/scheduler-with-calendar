/**
 * ConfirmationScreen.tsx – Step 3: Booking confirmed
 * Displays a celebratory graphic, confirmation heading, and meeting details.
 */

/* ── TypeScript interfaces ── */

export interface ConfirmationScreenProps {
  /** Name of the host */
  hostName: string;
  /** The confirmed date */
  selectedDate: Date;
  /** The confirmed time slot (e.g. "16:30") */
  selectedTime: string;
  /** Callback to reset booking state and return to the calendar view */
  onBookAnother: () => void;
}

/* ── Celebratory SVG graphic ── */

function CelebrationGraphic() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      className="mx-auto h-36 w-36"
      aria-hidden="true"
    >
      {/* Light teal diamond background */}
      <rect
        x="40" y="60" width="80" height="80" rx="8"
        transform="rotate(-10 80 100)"
        fill="#d5eff5" opacity="0.5"
      />

      {/* Large checkmark */}
      <path
        d="M50 100 L72 122 L120 58"
        fill="none"
        stroke="#6cc4a4"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Red balloon */}
      <ellipse cx="78" cy="35" rx="12" ry="15" fill="#e8636f" />
      <line x1="78" y1="50" x2="76" y2="72" stroke="#e8636f" strokeWidth="1.5" />

      {/* Blue/purple balloon */}
      <ellipse cx="58" cy="48" rx="10" ry="13" fill="#7b7fda" />
      <line x1="58" y1="61" x2="60" y2="80" stroke="#7b7fda" strokeWidth="1.5" />

      {/* Gold/yellow balloon */}
      <ellipse cx="98" cy="52" rx="11" ry="14" fill="#f0c75e" />
      <line x1="98" y1="66" x2="96" y2="85" stroke="#f0c75e" strokeWidth="1.5" />

      {/* Sparkle top-right */}
      <g transform="translate(118, 28)" stroke="#f0c75e" strokeWidth="1.5" fill="none">
        <line x1="0" y1="-6" x2="0" y2="6" />
        <line x1="-6" y1="0" x2="6" y2="0" />
        <line x1="-4" y1="-4" x2="4" y2="4" />
        <line x1="4" y1="-4" x2="-4" y2="4" />
      </g>

      {/* Sparkle small */}
      <g transform="translate(38, 72)" stroke="#7b7fda" strokeWidth="1" fill="none">
        <line x1="0" y1="-3" x2="0" y2="3" />
        <line x1="-3" y1="0" x2="3" y2="0" />
      </g>

      {/* Confetti dots */}
      <circle cx="35" cy="85" r="2" fill="#e8636f" opacity="0.6" />
      <circle cx="130" cy="75" r="1.5" fill="#7b7fda" opacity="0.6" />
      <circle cx="42" cy="60" r="1.5" fill="#f0c75e" opacity="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   ConfirmationScreen component
   ═══════════════════════════════════════════ */

export default function ConfirmationScreen({
  hostName,
  selectedDate,
  selectedTime,
  onBookAnother,
}: ConfirmationScreenProps) {
  /** Format date as "9 March 2026" */
  const formattedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className="flex w-full flex-col items-center justify-center
                 rounded-2xl bg-white px-8 py-16 text-center"
      aria-label="Booking confirmation"
      aria-live="polite"
    >
      {/* Celebratory graphic */}
      <div>
        <CelebrationGraphic />
      </div>


      {/* Heading */}
      <h2 className="mt-6 text-2xl font-bold text-slate-blue pb-2">
        Booking confirmed
      </h2>

      {/* Subtext */}
      <p className="mt-3 text-sm leading-relaxed text-slate-500 pb-2">
        You&rsquo;re booked with {hostName}.
        <br />
        An invitation has been emailed to you.
      </p>

      {/* Date & Time */}
      <div className="mt-6 pb-5">
        <p className="text-lg font-bold text-slate-blue">{formattedDate}</p>
        <p className="text-lg font-bold text-slate-blue">{selectedTime}</p>
      </div>

      {/* Book Another Meeting button */}
      <button
        type="button"
        onClick={onBookAnother}
        className="mt-8 cursor-pointer rounded-lg bg-slate-blue px-8 py-3 text-sm font-semibold
                   text-white shadow-md transition hover:bg-[#253545]
                   focus-visible:outline-2 focus-visible:outline-offset-2
                   focus-visible:outline-slate-blue"
      >
        Book Another Meeting
      </button>
    </section>
  );
}
