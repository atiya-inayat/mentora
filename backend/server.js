import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import router from "./src/routes/authRoutes.js";
import mentorRoutes from "./src/routes/mentorRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import sessionRouter from "./src/routes/sessionRoutes.js";
import reviewRouter from "./src/routes/reviewRoutes.js";
import adminRoutes from "./src/routes/adminRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/socket/socketHandler.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { limiter, registerLimiterExport } from "./src/middleware/rateLimiter.js";
import { loginLimiter, createBackoffMiddleware } from "./src/middleware/advancedRateLimiter.js";

const authBackoff = createBackoffMiddleware();
import cookieParser from "cookie-parser";

const app = express();
const httpServer = createServer(app);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
});

initSocket(io);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(limiter);
app.use("/api/auth/register", authBackoff, registerLimiterExport);
app.use("/api/auth/login", authBackoff, loginLimiter);
app.use("/api/auth", router);
app.use("/api/mentors", mentorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sessions", sessionRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
