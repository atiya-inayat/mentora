import "dotenv/config"; // loads .env file first, before anything else
import express from "express"; // default import — the express framework
import cors from "cors"; // allows frontend to talk to your backend
import { connectDB } from "./src/config/db.js"; // named import —  db function
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
import { authLimiter, limiter } from "./src/middleware/rateLimiter.js";
import cookieParser from "cookie-parser";

const app = express(); // creates your express app
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

initSocket(io);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
); // middleware — enables cross-origin requests
app.use(express.json()); // middleware — lets you read JSON request bodies

const PORT = process.env.PORT || 3000; // reads PORT from .env

app.use(cookieParser());
app.use(limiter);
app.use("/api/auth", authLimiter, router);
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
