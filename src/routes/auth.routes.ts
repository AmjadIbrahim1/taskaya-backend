// backend/src/routes/auth.routes.ts - JWT LEGACY AUTH ONLY
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

// ============= JWT LEGACY AUTHENTICATION =============
// These routes are ONLY for legacy JWT users
// New users should use Clerk authentication

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh", refreshTokenValidator, refreshToken);
router.post("/logout", logoutValidator, logout);
router.post("/logout-all", logoutAll);

export default router;