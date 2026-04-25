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

const app = express(); // creates your express app
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

initSocket(io);

app.use(cors()); // middleware — enables cross-origin requests
app.use(express.json()); // middleware — lets you read JSON request bodies

const PORT = process.env.PORT || 5000; // reads PORT from .env

app.use("/api/auth", router);
app.use("/api/mentors", mentorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sessions", sessionRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRoutes);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
