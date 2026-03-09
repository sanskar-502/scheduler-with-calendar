# 📅 Climatiq Scheduler Clone

A robust, pixel-perfect scheduling and booking application built to mirror the Climatiq booking interface. This full-stack application allows users to select time slots, specify their timezone, fill out a booking form, and receive automated email confirmations with dynamic Google Meet links.

## ✨ Key Features

- **Pixel-Perfect UI**: Carefully crafted CSS and Tailwind implementations to match high-fidelity design mockups, including complex overlapping layouts and precise margins.
- **Advanced Time Zone Handling**: IANA-timezone-aware time slot generation. Accurately calculates available slots based on the user's selected timezone and handles complex offsets securely.
- **Smart Slot Filtering**: Automatic past-time filtering for the current day, ensuring users cannot book meetings in the past, accounting for timezone shifts.
- **Booking Conflict Resolution**: A robust backend mechanism that queries the database to prevent double-booking and overlapping meetings.
- **Automated Emails (Gmail SMTP)**: Utilizes Nodemailer to send visually appealing HTML confirmation emails containing dynamic Google Meet links, complete with real working "Reschedule" and "Cancel" buttons.
- **Admin Dashboard**: A secure central hub to view, filter, and manage all upcoming and past bookings.
- **Full CRUD Functionality**: Complete end-to-end flows for creating, reading, updating (Rescheduling), and deleting (Canceling) meetings.

## 🛠️ Tech Stack

**Frontend:**
- React (bootstrapped with Vite)
- TypeScript
- Tailwind CSS v4
- React Testing Library & Vitest (for automated unit testing)

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose (ODM)
- Nodemailer (for SMTP email delivery)

## ⚙️ Environment Variables

To run this project locally, you will need to create two `.env` files—one in the `backend` folder and one in the `frontend` folder. 

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/climatiq-scheduler

# Email Service (Gmail SMTP)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# Booking Demo Configurations
DEFAULT_MEET_LINK=https://meet.google.com/your-permanent-link
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tese-scheduler-assessment
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   # Ensure your .env is configured correctly
   npm run dev
   ```
   *The backend server should now be running on `http://localhost:5000`.*

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   # Ensure your .env is configured correctly
   npm run dev
   ```
   *The frontend application should now be running on `http://localhost:5173`.*

4. **Running Tests**
   To execute the Vite and React Testing Library frontend tests:
   ```bash
   cd frontend
   npm run test
   ```

## 🌐 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/bookings` | Fetches all booking records (used by Admin Dashboard). |
| `POST` | `/api/bookings` | Creates a new booking. Requires name, email, date, time, and timezone. |
| `GET` | `/api/bookings/availability` | Fetches booked times for a specific date to disable conflicting slots. |
| `GET` | `/api/bookings/busy-dates` | Returns a list of dates that have no available slots remaining. |
| `PUT` | `/api/bookings/:id` | Updates an existing booking (Reschedule flow). |
| `DELETE`| `/api/bookings/:id` | Deletes a booking from the database (Cancel flow). |
