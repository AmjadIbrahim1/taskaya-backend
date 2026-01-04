// backend/src/middleware/debug.middleware.ts
import { Request, Response, NextFunction } from "express";

export const debugMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log("\n===========================================");
  console.log("📨 INCOMING REQUEST");
  console.log("===========================================");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Full URL:", req.originalUrl);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Query:", JSON.stringify(req.query, null, 2));
  console.log("===========================================\n");
  next();
};