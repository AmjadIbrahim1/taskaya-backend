// backend/src/app.ts - FIXED FOR RAILWAY
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();
const app = express();

// ✅ FIXED: Railway-compatible CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", 
  "https://taskaya-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(null, true); // Allow for now, log warning
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

// JSON parsing middleware with error handling
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Health check
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Global Error Handler:");
  console.error("  Path:", req.path);
  console.error("  Method:", req.method);
  console.error("  Error:", err.message);
  console.error("  Stack:", err.stack);

  // Always return JSON
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

export default app;