/**
 * Authentication Middleware
 *
 * Protects routes by verifying the access token cookie
 *
 * Flow:
 * 1. Extract accessToken from cookies
 * 2. Verify JWT signature and expiration
 * 3. Fetch user from database
 * 4. Attach user to request object
 * 5. Continue to route handler
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Protect routes - requires valid access token
 * Verifies accessToken cookie and attaches user to request
 */
export const protect = async (req, res, next) => {
  try {
    // Get access token from cookies (not Authorization header)
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login.",
        code: "NO_TOKEN",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET);
    } catch (err) {
      // Token expired or invalid
      return res.status(401).json({
        success: false,
        message: "Token expired or invalid",
        code: "TOKEN_INVALID",
      });
    }

    // Verify token type is access token
    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    // Fetch user from database (exclude password)
    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account suspended",
        code: "USER_BLOCKED",
      });
    }

    // Attach user to request object
    // This makes user available in route handlers as req.user
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

/**
 * Role-based access control
 *
 * Usage: restrictTo('admin', 'mentor')
 *
 * Checks if authenticated user has required role
 * Returns 403 if user doesn't have permission
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};
