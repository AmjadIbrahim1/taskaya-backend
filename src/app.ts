// backend/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import { debugMiddleware } from "./middleware/debug.middleware";

dotenv.config();
const app = express();

console.log("\n🚀 Starting Taskaya API...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Frontend URL:", process.env.FRONTEND_URL);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", 
  "https://taskaya-frontend.vercel.app", 
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

console.log("✅ Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        console.log("✅ Request with no origin (allowed)");
        return callback(null, true);
      }
      
      const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
      
      if (isAllowed) {
        console.log(`✅ CORS allowed for origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        if (process.env.NODE_ENV === "production") {
          callback(new Error("Not allowed by CORS"));
        } else {
          callback(null, true); 
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(debugMiddleware);
}

app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl} - Origin: ${req.get("origin") || "none"}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({
    message: "Taskaya API is running",
    version: "5.0.0 - JWT Only",
    auth: "JWT Authentication",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

console.log("\n📍 Registering routes...");
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
console.log("✅ Routes registered:");
console.log("   - POST /api/auth/register");
console.log("   - POST /api/auth/login");
console.log("   - POST /api/auth/refresh");
console.log("   - POST /api/auth/logout");
console.log("   - GET  /api/tasks");
console.log("   - POST /api/tasks");
console.log("   - ... (other task routes)\n");

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Global Error Handler:");
  console.error("  Path:", req.path);
  console.error("  Method:", req.method);
  console.error("  Error:", err.message);
  console.error("  Stack:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

export default app;