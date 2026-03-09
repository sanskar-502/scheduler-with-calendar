/**
 * db.ts – Mongoose database connection utility
 * Connects to MongoDB using the MONGO_URI environment variable.
 */
import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB.
 * Logs success or failure to the console.
 * @throws Will throw and log an error if the connection fails.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
