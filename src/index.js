import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Forcefully exit
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Exit process if DB fails
  }
};

// Start the server
startServer();

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
