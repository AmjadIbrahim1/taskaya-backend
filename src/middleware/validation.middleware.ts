// backend/src/middleware/validation.middleware.ts
import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ Validation Errors:", errors.array());
    res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg,
      })),
    });
    return;
  }
  next();
};



export const registerValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be between 6 and 100 characters"),

  handleValidationErrors,
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password").trim().notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const refreshTokenValidator = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
  handleValidationErrors,
];

export const logoutValidator = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
  handleValidationErrors,
];


export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Title must be between 1 and 500 characters"),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("deadline")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (value && new Date(value) < new Date()) {
        throw new Error("Deadline cannot be in the past");
      }
      return true;
    }),
  body("is_urgent")
    .optional()
    .isBoolean()
    .withMessage("is_urgent must be a boolean"),
  handleValidationErrors,
];

export const updateTaskValidator = [
  param("id").isInt({ min: 1 }).withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Title must be between 1 and 500 characters"),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("deadline")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid date format"),
  body("is_urgent")
    .optional()
    .isBoolean()
    .withMessage("is_urgent must be a boolean"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed must be a boolean"),
  body("status")
    .optional()
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status value"),
  handleValidationErrors,
];

export const deleteTaskValidator = [
  param("id").isInt({ min: 1 }).withMessage("Invalid task ID"),
  handleValidationErrors,
];

export const searchTasksValidator = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be between 1 and 200 characters"),
  handleValidationErrors,
];
