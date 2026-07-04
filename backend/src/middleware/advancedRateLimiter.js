import rateLimit from "express-rate-limit";

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message:
      "Too many registration attempts. Please try again after 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  validate: { xForwardedForHeader: false },
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many login attempts. Please try again after 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const backoffStore = new Map();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, data] of backoffStore.entries()) {
    if (now > data.resetAt) backoffStore.delete(key);
  }
}, 60000);
if (cleanupInterval.unref) cleanupInterval.unref();

export const createBackoffMiddleware = () => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let record = backoffStore.get(key);

    if (!record || now > record.resetAt) {
      record = { blockedCount: 0, blockedUntil: 0, resetAt: now + 3600000 };
      backoffStore.set(key, record);
    }

    if (now < record.blockedUntil) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message: `Too many requests. Try again in ${retryAfter}s.`,
        retryAfter,
      });
    }

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode === 429) {
        record.blockedCount++;
        const n = record.blockedCount;
        const backoffMs = Math.min(Math.pow(2, n) * 2000, 3600000);
        record.blockedUntil = now + backoffMs;
        record.resetAt = now + backoffMs + 3600000;
      } else {
        record.blockedCount = 0;
        record.blockedUntil = 0;
      }
      return originalJson(body);
    };

    next();
  };
};

export { registerLimiter, loginLimiter, generalLimiter };
