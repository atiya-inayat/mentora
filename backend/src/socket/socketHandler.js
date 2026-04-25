import Message from "../models/Message.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";

export const initSocket = (io) => {
  // middleware - run once when client connects
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // 1. Joining a session room
    socket.on("join_session", async ({ sessionId }) => {
      const session = await Session.findById(sessionId);
      if (!session || session.status !== "ongoing") {
        socket.emit("error", { message: "Session  must be ongoing." });
        return;
      }

      socket.join(sessionId);
      console.log("client joined");
    });

    socket.on("send_message", async ({ sessionId, receiverId, content }) => {
      const session = await Session.findById(sessionId);
      if (!session || session.status !== "ongoing") {
        socket.emit("error", { message: "Session  must be ongoing." });
        return;
      }

      const senderId = socket.user.sub;

      const message = await Message.create({
        receiverId,
        sessionId,
        content,
        senderId,
      });

      io.to(sessionId).emit("recieve_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
