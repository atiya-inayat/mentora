/**
 * Production-Ready Authentication Controller with Token Rotation
 * 
 * Security Features:
 * - Access Token: Short-lived (15 min) for API requests
 * - Refresh Token: Long-lived (7 days) with ROTATION on each use
 * - Token stored in database for tracking and revocation
 * - Token family for grouping tokens from same login session
 * 
 * Rotation Strategy:
 * 1. Each refresh generates NEW refresh token
 * 2. OLD refresh token is invalidated immediately
 * 3. Even if stolen, attacker can only use once
 * 4. Logout invalidates the specific token
 * 5. "Logout everywhere" invalidates ALL tokens
 */

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

/**
 * Hash a token using SHA-256
 * @param {string} token - Raw token to hash
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Cookie configuration helper
 * Returns secure cookie options based on environment
 */
const getCookieOptions = (maxAge) => ({
  httpOnly: true, // Prevents JavaScript access - protects against XSS
  secure: process.env.NODE_ENV === "production", // HTTPS only - prevents MITM attacks
  sameSite: "strict", // CSRF protection - only sent in first-party context
  path: "/", // Available on all paths
  maxAge: maxAge, // Expiration in seconds
});

/**
 * Generate a new token family ID
 * Used to group all tokens from the same login session
 * @returns {string} UUID-like token family ID
 */
const generateTokenFamily = () => {
  return crypto.randomUUID();
};

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @param {string} tokenFamily - Token family ID (optional - for new logins)
 * @returns {Object} { accessToken, refreshToken, tokenFamily }
 */
const generateTokens = (user, tokenFamily = null) => {
  // Create token family for new logins
  const family = tokenFamily || generateTokenFamily();

  // Access token - short-lived for frequent rotation
  const accessPayload = {
    sub: user._id,
    role: user.role,
    type: "access",
    family, // Include family in access token for easy identification
  };

  // Refresh token - long-lived but ROTATED on each use
  const refreshPayload = {
    sub: user._id,
    type: "refresh",
    family, // Link to token family
    jti: crypto.randomUUID(), // Unique ID for this specific token
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken, tokenFamily: family };
};

/**
 * Save refresh token to database
 * @param {string} userId - User ID
 * @param {string} token - Refresh token (hashed)
 * @param {string} tokenFamily - Token family ID
 * @param {string} userAgent - Browser user agent
 * @param {string} ipAddress - Client IP address
 */
const saveRefreshToken = async (userId, token, tokenFamily, userAgent, ipAddress) => {
  // Hash the token before storing
  const hashedToken = hashToken(token);

  await RefreshToken.create({
    userId,
    token: hashedToken,
    tokenFamily,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
    userAgent,
    ipAddress,
  });
};

/**
 * Verify and validate refresh token
 * @param {string} token - Raw refresh token
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    // Verify it's a refresh token
    if (decoded.type !== "refresh") {
      return null;
    }

    return decoded;
  } catch (err) {
    return null;
  }
};

/**
 * Rotate refresh token
 * Invalidates old token and creates new one
 * @param {string} oldToken - Current refresh token
 * @param {Object} user - User object
 * @returns {Object} New tokens and family
 */
const rotateRefreshToken = async (oldToken, user) => {
  // Verify old token
  const decoded = verifyRefreshToken(oldToken);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  // Hash old token and mark as revoked
  const hashedOldToken = hashToken(oldToken);
  await RefreshToken.updateOne(
    { token: hashedOldToken },
    { isRevoked: true }
  );

  // Generate new tokens with same family
  const { accessToken, refreshToken, tokenFamily } = generateTokens(user, decoded.family);

  // Save new refresh token to database
  await saveRefreshToken(user._id.toString(), refreshToken, tokenFamily);

  return { accessToken, refreshToken, tokenFamily };
};

/**
 * Revoke all refresh tokens for a user
 * Used during logout everywhere
 * @param {string} userId - User ID
 * @param {string} tokenFamily - Optional: only revoke tokens from specific family
 */
const revokeRefreshTokens = async (userId, tokenFamily = null) => {
  const query = { userId: userId.toString(), isRevoked: false };

  if (tokenFamily) {
    query.tokenFamily = tokenFamily;
  }

  await RefreshToken.updateMany(query, { isRevoked: true });
};

/**
 * REGISTER - Create new user account
 */
export const register = async function (req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await User.create({ name, email, password, role });

    // Generate tokens with new family
    const { accessToken, refreshToken, tokenFamily } = generateTokens(newUser);

    // Save refresh token to database
    await saveRefreshToken(
      newUser._id.toString(),
      refreshToken,
      tokenFamily,
      req.headers["user-agent"],
      req.ip
    );

    // Set cookies
    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));

    // Return user data
    return res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

/**
 * LOGIN - Authenticate user and create session
 */
export const login = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    // Generate tokens with new family
    const { accessToken, refreshToken, tokenFamily } = generateTokens(user);

    // Save refresh token to database for tracking/rotation
    await saveRefreshToken(
      user._id.toString(),
      refreshToken,
      tokenFamily,
      req.headers["user-agent"],
      req.ip
    );

    // Set cookies
    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));

    // Return user data
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

/**
 * LOGOUT - Clear cookies and end session
 */
export const logout = async function (req, res) {
  try {
    // Get refresh token to revoke it specifically
    const refreshTokenValue = req.cookies.refreshToken;

    if (refreshTokenValue) {
      // Hash and revoke this specific token
      const hashedToken = hashToken(refreshTokenValue);
      await RefreshToken.updateOne(
        { token: hashedToken },
        { isRevoked: true }
      );
    }

    // Clear the cookies
    res.clearCookie("accessToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

/**
 * REFRESH - Get new access token with token rotation
 * 
 * CRITICAL: This rotates the refresh token!
 * - Old refresh token is invalidated
 * - New refresh token is issued
 * - This limits damage if token is stolen (attacker can only use once)
 */
export const refreshToken = async function (req, res) {
  try {
    // Get refresh token from cookies
    const refreshTokenValue = req.cookies.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found. Please login again.",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshTokenValue);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    // Check if token is revoked in database
    const hashedToken = hashToken(refreshTokenValue);
    const storedToken = await RefreshToken.findOne({ token: hashedToken });

    if (!storedToken || storedToken.isRevoked) {
      // Token was already used or revoked - possible theft attempt
      // Revoke ALL tokens for this user (security measure)
      if (decoded.sub) {
        await revokeRefreshTokens(decoded.sub, decoded.family);
      }

      return res.status(401).json({
        success: false,
        message: "Token already used. Please login again.",
        code: "TOKEN_REVOKED",
      });
    }

    // Find user
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account suspended",
      });
    }

    // ROTATE THE TOKEN
    // This invalidates the old token and creates a new one
    // Even if attacker stole the token, they can only use it once!
    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(
      refreshTokenValue,
      user
    );

    // Set new cookies
    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", newRefreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));

    // Return success
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully (rotated)",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Error refreshing token",
    });
  }
};

/**
 * ME - Get current user info (session hydration)
 */
export const getMe = async function (req, res) {
  try {
    // Get access token from cookies
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Verify access token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    // Verify token type
    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    // Fetch user from database
    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account suspended",
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Getme error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

/**
 * Get user's active sessions (for security awareness)
 */
export const getSessions = async function (req, res) {
  try {
    const userId = req.user._id.toString();

    // Get all non-revoked tokens for this user
    const tokens = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select("-token -__v")
      .sort({ createdAt: -1 })
      .limit(10);

    // Return session info (without revealing actual tokens)
    return res.status(200).json({
      success: true,
      sessions: tokens.map((t) => ({
        id: t._id,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        userAgent: t.userAgent,
        ipAddress: t.ipAddress,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sessions",
    });
  }
};

/**
 * Revoke all sessions (logout everywhere)
 */
export const revokeAllSessions = async function (req, res) {
  try {
    const userId = req.user._id.toString();

    // Revoke ALL tokens for this user
    await revokeRefreshTokens(userId);

    // Clear current cookies
    res.clearCookie("accessToken", { path: "/", httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie("refreshToken", { path: "/", httpOnly: true, secure: true, sameSite: "strict" });

    return res.status(200).json({
      success: true,
      message: "All sessions revoked. Please login again.",
    });
  } catch (error) {
    console.error("Revoke sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Error revoking sessions",
    });
  }
};