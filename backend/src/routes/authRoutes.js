/**
 * Auth Routes
 *
 * All auth endpoints - no authentication required except /me
 *
 * Public Routes:
 * - POST /register - Create new user
 * - POST /login - Authenticate user
 *
 * Protected Routes (require valid access token):
 * - POST /refresh - Refresh access token (with rotation)
 * - POST /logout - End session
 * - GET /me - Get current user (session hydration)
 * - GET /sessions - Get active sessions
 * - POST /sessions/revoke - Revoke all sessions
 */

import {
  login,
  register,
  logout,
  refreshToken,
  getMe,
  getSessions,
  revokeAllSessions,
} from "../controllers/authController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// No authentication required

/**
 * POST /api/auth/register
 * Create new user account
 * Body: { name, email, password, role }
 */
router.post("/register", validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Authenticate user and create session
 * Body: { email, password }
 */
router.post("/login", validate(loginSchema), login);

// ==================== PROTECTED ROUTES ====================
// Require valid access token in cookies

/**
 * POST /api/auth/refresh
 * Refresh access token with ROTATION
 * - Invalidates old refresh token
 * - Issues new refresh token
 * - Limits damage from stolen tokens
 * Cookies: accessToken, refreshToken
 */
router.post("/refresh", refreshToken);

/**
 * POST /api/auth/logout
 * End user session and clear cookies
 * Also revokes the current refresh token
 */
router.post("/logout", logout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Used for session hydration on page load
 * Returns user data without password
 */
router.get("/me", protect, getMe);

/**
 * GET /api/auth/sessions
 * Get user's active sessions
 * Returns list of active tokens (without token values)
 */
router.get("/sessions", protect, getSessions);

/**
 * POST /api/auth/sessions/revoke
 * Revoke ALL sessions (logout everywhere)
 * Clears all tokens for this user
 */
router.post("/sessions/revoke", protect, revokeAllSessions);

export default router;
