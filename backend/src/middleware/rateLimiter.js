import { registerLimiter, loginLimiter, generalLimiter } from "./advancedRateLimiter.js";

export const limiter = generalLimiter;
export const authLimiter = loginLimiter;
export const registerLimiterExport = registerLimiter;
