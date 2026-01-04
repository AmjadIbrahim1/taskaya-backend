// backend/src/middleware/jwt.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTRequest extends Request {
  userId?: number;
  userEmail?: string;
}

interface JwtPayload {
  id: number;
  email: string;
}

export const jwtAuth = (
  req: JWTRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    console.log("🔐 Verifying JWT token...");

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    console.log("✅ JWT token verified for user:", decoded.email);

    next();
  } catch (error) {
    console.error("❌ JWT authentication error:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};