import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import validatePasswordStrength from "../utils/passwordValidator.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

if (JWT_SECRET === JWT_REFRESH_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET and JWT_REFRESH_SECRET are the same. Use separate secrets for better security.",
  );
}

const ACCESS_TOKEN_EXPIRY_SEC = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SEC = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRY_MS = ACCESS_TOKEN_EXPIRY_SEC * 1000;
const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_EXPIRY_SEC * 1000;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "true",
  sameSite: "strict",
  path: "/",
  maxAge: maxAge,
});

const generateTokenFamily = () => {
  return crypto.randomUUID();
};

const generateTokens = (user, tokenFamily = null) => {
  const family = tokenFamily || generateTokenFamily();

  const accessPayload = {
    sub: user._id,
    role: user.role,
    type: "access",
    family,
  };

  const refreshPayload = {
    sub: user._id,
    type: "refresh",
    family,
    jti: crypto.randomUUID(),
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SEC,
  });

  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SEC,
  });

  return { accessToken, refreshToken, tokenFamily: family };
};

const saveRefreshToken = async (userId, token, tokenFamily, userAgent, ipAddress) => {
  const hashedToken = hashToken(token);

  await RefreshToken.create({
    userId,
    token: hashedToken,
    tokenFamily,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    userAgent,
    ipAddress,
  });
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return null;
    }

    return decoded;
  } catch (err) {
    return null;
  }
};

const rotateRefreshToken = async (oldToken, user) => {
  const decoded = verifyRefreshToken(oldToken);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const hashedOldToken = hashToken(oldToken);

  const updatedToken = await RefreshToken.findOneAndUpdate(
    { token: hashedOldToken, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() },
    { returnDocument: "before" },
  );

  if (!updatedToken) {
    throw new Error("TOKEN_ALREADY_ROTATED");
  }

  const { accessToken, refreshToken, tokenFamily } = generateTokens(user, decoded.family);

  await saveRefreshToken(user._id.toString(), refreshToken, tokenFamily);

  return { accessToken, refreshToken, tokenFamily };
};

const revokeRefreshTokens = async (userId, tokenFamily = null) => {
  const query = { userId: userId.toString(), isRevoked: false };

  if (tokenFamily) {
    query.tokenFamily = tokenFamily;
  }

  await RefreshToken.updateMany(query, { isRevoked: true, revokedAt: new Date() });
};

const clearAuthCookies = (res) => {
  const isSecure = process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "true";
  res.clearCookie("accessToken", {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
  });
};

export const register = async function (req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FIELDS",
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        code: passwordCheck.code,
        message: passwordCheck.message,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "USER_EXISTS",
        message: "User with this email already exists",
      });
    }

    const newUser = await User.create({ name, email: normalizedEmail, password, role });

    const { accessToken, refreshToken, tokenFamily } = generateTokens(newUser);

    await saveRefreshToken(
      newUser._id.toString(),
      refreshToken,
      tokenFamily,
      req.headers["user-agent"],
      req.ip,
    );

    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY_MS));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY_MS));

    return res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        photo: newUser.photo,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Internal server error during registration",
    });
  }
};

export const login = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FIELDS",
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    const dummyHash = "$2b$10$t4R7jpilfYld29Z8enlMmuRzbfSgLcBNBlkJRpJoUuTMfQOe59BzG";

    let isMatch = false;
    if (user) {
      isMatch = await user.comparePassword(password);
    } else {
      try {
        await bcrypt.compare(password, dummyHash);
      } catch {}
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    if (user.isBlocked) {
      await revokeRefreshTokens(user._id.toString());
      clearAuthCookies(res);

      return res.status(403).json({
        success: false,
        code: "USER_BLOCKED",
        message: "Your account has been suspended. Contact support.",
      });
    }

    const { accessToken, refreshToken, tokenFamily } = generateTokens(user);

    await saveRefreshToken(
      user._id.toString(),
      refreshToken,
      tokenFamily,
      req.headers["user-agent"],
      req.ip,
    );

    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY_MS));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY_MS));

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Internal server error during login",
    });
  }
};

export const logout = async function (req, res) {
  try {
    const refreshTokenValue = req.cookies.refreshToken;

    if (refreshTokenValue) {
      const hashedToken = hashToken(refreshTokenValue);
      await RefreshToken.updateOne(
        { token: hashedToken },
        { isRevoked: true, revokedAt: new Date() },
      );
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      code: "LOGGED_OUT",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Error during logout",
    });
  }
};

export const refreshToken = async function (req, res) {
  try {
    const refreshTokenValue = req.cookies.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        code: "NO_REFRESH_TOKEN",
        message: "Refresh token not found. Please login again.",
      });
    }

    const decoded = verifyRefreshToken(refreshTokenValue);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    const hashedToken = hashToken(refreshTokenValue);
    const storedToken = await RefreshToken.findOne({ token: hashedToken });

    if (!storedToken || storedToken.isRevoked) {
      if (decoded.sub) {
        await revokeRefreshTokens(decoded.sub, decoded.family);
      }

      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        code: "TOKEN_REVOKED",
        message: "Token already used. Please login again.",
      });
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found. Please login again.",
      });
    }

    if (user.isBlocked) {
      await revokeRefreshTokens(user._id.toString());
      clearAuthCookies(res);

      return res.status(403).json({
        success: false,
        code: "USER_BLOCKED",
        message: "Account suspended",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(
      refreshTokenValue,
      user,
    );

    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY_MS));
    res.cookie("refreshToken", newRefreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY_MS));

    return res.status(200).json({
      success: true,
      code: "TOKEN_ROTATED",
      message: "Token refreshed successfully (rotated)",
    });
  } catch (error) {
    if (error.message === "TOKEN_ALREADY_ROTATED") {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        code: "TOKEN_ROTATION_ERROR",
        message: "Token already rotated. Please login again.",
      });
    }

    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      code: "JWT_ERROR",
      message: "Error refreshing token",
    });
  }
};

export const getMe = async function (req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Getme error:", error);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Error fetching user",
    });
  }
};

export const getSessions = async function (req, res) {
  try {
    const userId = req.user._id.toString();

    const tokens = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select("-token -__v")
      .sort({ createdAt: -1 })
      .limit(10);

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
      code: "DATABASE_ERROR",
      message: "Error fetching sessions",
    });
  }
};

export const revokeAllSessions = async function (req, res) {
  try {
    const userId = req.user._id.toString();

    await revokeRefreshTokens(userId);

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      code: "SESSIONS_REVOKED",
      message: "All sessions revoked. Please login again.",
    });
  } catch (error) {
    console.error("Revoke sessions error:", error);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Error revoking sessions",
    });
  }
};
