/**
 * App.tsx – Root application component
 * Multi-step booking flow: Step 1 → Step 2 → Step 3 (Confirmation).
 * Routing: #admin → AdminDashboard, /cancel → CancelBooking, /reschedule → RescheduleBooking.
 */
import { useState, useEffect } from "react";
import MainLayout from "./components/layout/MainLayout";
import Calendar from "./components/calendar/Calendar";
import TimeSlotPicker from "./components/booking/TimeSlotPicker";
import BookingForm from "./components/booking/BookingForm";
import ConfirmationScreen from "./components/booking/ConfirmationScreen";
import AdminDashboard from "./components/admin/AdminDashboard";
import CancelBooking from "./components/booking/CancelBooking";
import RescheduleBooking from "./components/booking/RescheduleBooking";

/** Earliest selectable date (prototype cutoff) */
const MIN_DATE = new Date(2026, 2, 9); // March 9, 2026

/** Default timezone offset key */
const DEFAULT_TZ_OFFSET = "+05:30";

/** Extract the booking ID from the URL search params (?id=...) */
function getBookingIdFromURL(): string | null {
  return new URLSearchParams(window.location.search).get("id");
}

/* ═══════════════════════════════════════════
   App
   ═══════════════════════════════════════════ */

export default function App() {
  /* ── Routing state ── */
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");
  const [pathname] = useState(window.location.pathname);
  const [bookingId] = useState(getBookingIdFromURL);

  useEffect(() => {
    function onHashChange() {
      setIsAdmin(window.location.hash === "#admin");
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  /* ── Booking flow state ── */
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(2026, 2, 9),
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TZ_OFFSET);

  /* ── Derived ── */
  const selectedDateLabel = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ── Handlers ── */

  function handleDateChange(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setCurrentStep(2);
  }

  function handleGoBack() {
    setCurrentStep(1);
  }

  function handleBookingSuccess() {
    setCurrentStep(3);
  }

  function handleBookAnother() {
    setCurrentStep(1);
    setSelectedTime(null);
    window.location.hash = "";
  }

  /* ── Route: /cancel?id=... ── */
  if (pathname === "/cancel" && bookingId) {
    return <CancelBooking bookingId={bookingId} />;
  }

  /* ── Route: /reschedule?id=... ── */
  if (pathname === "/reschedule" && bookingId) {
    return <RescheduleBooking bookingId={bookingId} />;
  }

  /* ── Route: #admin ── */
  if (isAdmin) {
    return <AdminDashboard />;
  }

  /* ── Render booking flow ── */

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <>
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
          </>
        );

      case 2:
        return (
          <BookingForm
            selectedDate={selectedDate}
            selectedTime={selectedTime!}
            selectedTimezone={selectedTimezone}
            meetingLocation="Google Meet"
            onBack={handleGoBack}
            onSuccess={handleBookingSuccess}
          />
        );

      case 3:
        return (
          <ConfirmationScreen
            hostName="Victoire Serruys"
            selectedDate={selectedDate}
            selectedTime={selectedTime!}
            onBookAnother={handleBookAnother}
          />
        );
    }
  }

  return (
    <MainLayout currentStep={currentStep}>
      {renderStep()}
    </MainLayout>
  );
}