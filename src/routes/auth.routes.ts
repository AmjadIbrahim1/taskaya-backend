// backend/src/routes/auth.routes.ts - FIXED WITH DEBUGGING
import { Router } from "express";
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  logoutAll 
} from "../controllers/auth.controller";
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  logoutValidator,
} from "../middleware/validation.middleware";

const router = Router();

console.log("🔧 Setting up auth routes...");

// Test route to verify router is working
router.get("/test", (_req, res) => {
  res.json({ message: "Auth routes are working!" });
});

// JWT Authentication Routes
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh", refreshTokenValidator, refreshToken);
router.post("/logout", logoutValidator, logout);
router.post("/logout-all", logoutAll);

console.log("✅ Auth routes configured");

export default router;