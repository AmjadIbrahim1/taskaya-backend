// src/config/db.ts
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" }, 
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
  ],
});

prisma.$on("query", (e) => {
  if (e.duration > 100) {
    console.log("Slow query detected:", {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  }
});

export const initDB = async (): Promise<void> => {
  try {
    console.log("✅ Prisma Client is ready to use");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

export const closeDB = async () => {
  await prisma.$disconnect();
  console.log("Database connection closed");
};
