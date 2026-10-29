import 'dotenv/config';
import express from 'express';
import { db } from '../prisma/db.js';

import movieRoutes from './routes/movieRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Parse JSON request bodies so req.body is populated
app.use(express.json());

// API Routes
app.use("/movie", movieRoutes);

// 404 fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Close the HTTP server, then the database pool, then exit.
// The timeout guard prevents hanging forever if connections never drain.
const shutdown = async (signal, exitCode) => {
  console.log(`${signal} received, shutting down gracefully`);
  setTimeout(() => {
    console.error("Could not close connections in time, forcing shutdown");
    process.exit(exitCode);
  }, 3000).unref();

  server.close(async () => {
    await db.close();
    process.exit(exitCode);
  });
};

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection", 1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException", 1);
});

// Graceful shutdown
process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));
