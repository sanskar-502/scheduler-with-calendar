/**
 * Booking.ts – Mongoose model for meeting bookings
 * Schema matches the data collected by the frontend BookingForm.
 */
import { Schema, model, type Document } from "mongoose";

/* ── TypeScript interface ── */

export interface IBooking extends Document {
  firstName: string;
  lastName: string;
  email: string;
  selectedDate: Date;
  selectedTime: string;
  timezone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */

const bookingSchema = new Schema<IBooking>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
        message: (props: { value: string }) =>
          `${props.value} is not a valid email address`,
      },
    },
    selectedDate: {
      type: Date,
      required: [true, "Selected date is required"],
    },
    selectedTime: {
      type: String,
      required: [true, "Selected time is required"],
      trim: true,
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      trim: true,
    },
    status: {
      type: String,
      default: "confirmed",
      enum: ["confirmed", "cancelled", "pending"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

/* ── Model ── */

const Booking = model<IBooking>("Booking", bookingSchema);

export default Booking;
