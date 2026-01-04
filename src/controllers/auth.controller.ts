// backend/src/controllers/auth.controller.ts - FIXED WITH BETTER ERROR HANDLING
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const SALT_ROUNDS = 10;

const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email }, 
    JWT_SECRET, 
    {
      algorithm: 'HS256',
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email }, 
    JWT_REFRESH_SECRET, 
    {
      algorithm: 'HS256',
      expiresIn: "30d",
    }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("========= JWT REGISTER DEBUG =========");
    console.log("1. Registration attempt for:", email);

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password");
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      res.status(400).json({ error: "Please use a valid email address" });
      return;
    }

    // Password validation
    if (password.length < 6) {
      console.log("❌ Password too short");
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    console.log("2. Checking if user exists...");
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log("❌ User already exists");
      res.status(409).json({ error: "User already exists" });
      return;
    }

    console.log("3. Hashing password...");
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log("4. Creating user in database...");

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        clerkId: null,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("✅ User created successfully:", user.id);
    console.log("5. Generating tokens...");

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    console.log("6. Storing refresh token...");

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Registration complete!");
    console.log("==================================");

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user,
      authMethod: "jwt",
    });
  } catch (error) {
    console.error("========= REGISTER ERROR =========");
    console.error("Error details:", error);
    console.error("==================================");
    
    res.status(500).json({ 
      error: "Registration failed. Please try again.",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("========= JWT LOGIN DEBUG =========");
    console.log("1. Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing credentials");
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    console.log("2. Finding user in database...");

    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        OR: [
          { clerkId: null },
          { password: { not: null } }
        ]
      },
    });

    console.log("3. User found:", !!user);

    if (!user || !user.password) {
      console.log("❌ User not found or is Clerk user");
      res.status(401).json({ 
        error: "Invalid credentials"
      });
      return;
    }

    console.log("4. Verifying password...");

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    
    console.log("5. Password valid:", validPassword);

    if (!validPassword) {
      console.log("❌ Invalid password");
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.log("6. Generating tokens...");

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    console.log("7. Storing refresh token...");

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Login successful!");
    console.log("==================================");

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
      authMethod: "jwt",
    });
  } catch (error) {
    console.error("========= LOGIN ERROR =========");
    console.error("Error details:", error);
    console.error("==================================");
    
    res.status(500).json({ 
      error: "Login failed. Please try again.",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        algorithms: ['HS256']
      }) as {
        id: number;
        email: string;
      };
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(decoded.id, decoded.email);
    const newRefreshToken = generateRefreshToken(decoded.id, decoded.email);

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ 
      error: "Token refresh failed",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Revoke the refresh token
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    res.json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({ error: "Logout all failed" });
  }
};