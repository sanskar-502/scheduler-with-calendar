/**
 * MainLayout.tsx – Page-level layout shell
 * Contains the step-aware progress stepper (steps 1–3), logo, and the main card.
 */
import type { ReactNode } from "react";

/* ── TypeScript interfaces ── */

export interface MainLayoutProps {
  /** Current booking step (1 = choose time, 2 = your info, 3 = confirmed) */
  currentStep: 1 | 2 | 3;
  /** Content rendered inside the main card */
  children: ReactNode;
}

/* ── Reusable checkmark icon ── */

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3 w-3 text-white"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Progress Stepper (internal)
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   Progress Stepper (internal)
   ═══════════════════════════════════════════ */

function ProgressStepper({ step }: { step: 1 | 2 | 3 }) {
  const step1Done = step > 1;
  const step2Done = step > 2;
  const step2Active = step === 2;

  return (
    <nav aria-label="Booking progress" className="flex items-center justify-center gap-0 pt-3 pb-6">
      {/* Step 1 */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2
            ${step1Done
              ? "border-orange-400 bg-orange-400"
              : "border-orange-400 bg-white"
            }`}
          aria-current={step === 1 ? "step" : undefined}
        >
          {step1Done ? (
            <CheckIcon />
          ) : (
            <span className="h-2 w-2 rounded-full bg-orange-400" />
          )}
        </div>
        <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Choose Time
        </span>
      </div>

      {/* Connector line (Widened to w-40) */}
      <div
        className={`mx-2 mb-5 h-px w-55 ${step1Done ? "bg-orange-400" : "bg-gray-300"}`}
        aria-hidden="true"
      />

      {/* Step 2 */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2
            ${step2Done
              ? "border-orange-400 bg-orange-400"
              : step2Active
                ? "border-orange-400 bg-white"
                : "border-gray-300 bg-white"
            }`}
          aria-current={step === 2 ? "step" : undefined}
        >
          {step2Done ? (
            <CheckIcon />
          ) : (
            <span
              className={`h-2 w-2 rounded-full ${step2Active ? "bg-orange-400" : "bg-gray-300"
                }`}
            />
          )}
        </div>
        <span
          className={`mt-1.5 text-[11px] font-semibold uppercase tracking-wider
            ${step2Active || step2Done ? "text-slate-600" : "text-gray-400"}`}
        >
          Your Info
        </span>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   Climatiq Logo (internal)
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   Climatiq Logo (internal)
   ═══════════════════════════════════════════ */

function ClimatiqLogo() {
  return (
    <div className="mt-8 mb-10 flex items-center gap-3 pb-6" aria-label="Climatiq logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        className="h-15 w-15"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="8" fill="#2d3e50" />
        <path
          d="M12 28L20 12L28 28Z"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 24L20 16L24 24Z"
          fill="none"
          stroke="#5a9ab5"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-3xl font-bold tracking-tight text-slate-blue">
        climatiq
      </span>
    </div >
  );
}

/* ═══════════════════════════════════════════
   MainLayout
   ═══════════════════════════════════════════ */

export default function MainLayout({ currentStep, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page-bg px-4 py-6">
      <ProgressStepper step={currentStep} />
      {currentStep < 3 && <ClimatiqLogo />}

      {/* ── Main card ── */}
      <main
        className={`w-full max-w-[750px] min-h-[500px] rounded-2xl bg-white shadow-lg
                   ring-1 ring-card-border
                   flex flex-col md:flex-row
                   ${currentStep === 3 ? "mt-8" : ""}`}
        role="main"
      >
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-6 text-center pt-5">
        <a
          href="#admin"
          className="group cursor-pointer inline-flex items-center gap-1 text-lg text-slate-700
                     transition hover:text-slate-900
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-timezone-teal"
        >
          Admin
          <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </footer>
    </div>
  );
}
