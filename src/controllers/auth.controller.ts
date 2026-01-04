// backend/src/controllers/auth.controller.ts - FIXED: HS256 Algorithm
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const SALT_ROUNDS = 10;

// ✅ FIXED: Generate Access Token (15 minutes) with explicit HS256
const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email }, 
    JWT_SECRET, 
    {
      algorithm: 'HS256',  // ✅ Explicit algorithm
      expiresIn: "15m",
    }
  );
};

// ✅ FIXED: Generate Refresh Token (30 days) with explicit HS256
const generateRefreshToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email }, 
    JWT_REFRESH_SECRET, 
    {
      algorithm: 'HS256',  // ✅ Explicit algorithm
      expiresIn: "30d",
    }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("📝 JWT Registration attempt for:", email);

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Validate email format (any valid email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Please use a valid email address" });
      return;
    }

    // Password validation
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("🔐 Password hashed successfully");

    // Create user (without clerkId)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        clerkId: null, // JWT users don't have clerkId
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("✅ JWT User created successfully:", user.email);

    // Generate tokens with HS256
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    console.log("🔑 Generated tokens with HS256 algorithm");

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user,
      authMethod: "jwt",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("========= JWT LOGIN DEBUG =========");
    console.log("1. Login attempt for email:", email);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user (only JWT users - those without clerkId or with null clerkId)
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        OR: [
          { clerkId: null },
          { password: { not: null } }
        ]
      },
    });

    console.log("2. User found in DB:", !!user);

    if (!user || !user.password) {
      console.log("❌ User not found or is a Clerk user");
      res.status(401).json({ 
        error: "Invalid credentials. If you signed up with Google/GitHub/LinkedIn, please use those methods to sign in." 
      });
      return;
    }

    // Verify password
    console.log("3. Comparing passwords...");
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("4. Password valid:", validPassword);

    if (!validPassword) {
      console.log("❌ Invalid password");
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.log("✅ JWT Login successful!");

    // Generate tokens with HS256
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    console.log("🔑 Generated tokens with HS256 algorithm");

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("🎉 Tokens generated and stored");
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
    console.error("========= JWT LOGIN ERROR =========");
    console.error("Login error:", error);
    console.error("==================================");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Verify refresh token with HS256
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        algorithms: ['HS256']  // ✅ Explicit algorithm
      }) as {
        id: number;
        email: string;
      };
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // Check if refresh token exists in database and is not revoked
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

    // Generate new access token with HS256
    const newAccessToken = generateAccessToken(decoded.id, decoded.email);

    // Generate new refresh token (rotation) with HS256
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
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Revoke all refresh tokens for the user
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
    res.status(500).json({ error: "Internal server error" });
  }
};