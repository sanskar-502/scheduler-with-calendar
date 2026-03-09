import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Meeting Scheduler API is running smoothly!' });
});

app.use('/api/bookings', bookingRoutes);

// Connect to DB, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});