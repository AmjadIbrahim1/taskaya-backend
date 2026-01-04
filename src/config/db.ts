// src/config/db.ts
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" }, // for slow queries
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
  ],
});

// Log slow queries (>100ms)
prisma.$on("query", (e) => {
  if (e.duration > 100) {
    console.log("Slow query detected:", {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  }
});

// Initialize database (optional if you use migrations)
export const initDB = async (): Promise<void> => {
  try {
    // Prisma handles tables automatically via migrations or db push
    console.log("✅ Prisma Client is ready to use");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

// Graceful shutdown
export const closeDB = async () => {
  await prisma.$disconnect();
  console.log("Database connection closed");
};
