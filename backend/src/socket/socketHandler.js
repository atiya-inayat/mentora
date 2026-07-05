import Message from "../models/Message.js";
import Session from "../models/Session.js";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";

const resolveSession = async (id) => {
  let session = await Session.findById(id);
  if (!session) {
    session = await Session.findOne({ bookingId: id });
  }
  return session;
};

const isParticipant = async (session, userId) => {
  const booking = await Booking.findById(session.bookingId);
  if (!booking) return false;
  return (
    booking.mentorId.toString() === userId.toString() ||
    booking.menteeId.toString() === userId.toString()
  );
};

const isMentor = async (session, userId) => {
  const booking = await Booking.findById(session.bookingId);
  if (!booking) return false;
  return booking.mentorId.toString() === userId.toString();
};

export const initSocket = (io) => {
  io.use((socket, next) => {
    const raw = socket.request.headers.cookie || "";
    const token = raw
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1]
      ?.trim();

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

    socket.join(`user:${socket.user.sub}`);

    socket.on("join_session", async ({ sessionId }) => {
      try {
        const session = await resolveSession(sessionId);
        if (!session) {
          socket.emit("error", { message: "The meeting is being prepared. Please try again." });
          return;
        }

        if (session.status === "completed") {
          socket.emit("error", { message: "This session has already ended." });
          return;
        }

        if (!(await isParticipant(session, socket.user.sub))) {
          socket.emit("error", { message: "You are not a participant of this session." });
          return;
        }

        if (session.status !== "host_joined" && session.status !== "guest_waiting" && session.status !== "live") {
          socket.emit("error", { message: "Session is not available right now." });
          return;
        }

        const roomId = session._id.toString();
        socket.join(roomId);
        socket.currentRoomId = roomId;

        const messages = await Message.find({ sessionId: roomId }).sort({ createdAt: 1 }).limit(100);
        socket.emit("session_messages", messages);

        const otherSockets = await io.in(roomId).fetchSockets();
        if (otherSockets.length > 1) {
          socket.to(roomId).emit("participant_present", { userId: socket.user.sub });
        }
      } catch (error) {
        console.error("join_session error:", error);
        socket.emit("error", { message: "An error occurred while joining the session." });
      }
    });

    const sendMessageHandler = async ({ sessionId, receiverId, content, file }) => {
      try {
        const session = await resolveSession(sessionId);
        if (!session) {
          socket.emit("error", { message: "Session not found." });
          return;
        }

        if (session.status !== "live") {
          socket.emit("error", { message: "Chat is only available during an active session." });
          return;
        }

        const senderId = socket.user.sub;
        const roomId = session._id.toString();

        if (!(await isParticipant(session, senderId))) {
          socket.emit("error", { message: "You are not a participant of this session." });
          return;
        }

        if (!content && !file) {
          socket.emit("error", { message: "Message content or file is required." });
          return;
        }

        const messageData = { receiverId, sessionId: roomId, senderId };
        if (content) messageData.content = content;
        if (file) messageData.file = file;

        const message = await Message.create(messageData);
        io.to(roomId).emit("receive_message", message);
      } catch (error) {
        console.error("send_message error:", error);
        socket.emit("error", { message: "An error occurred while sending the message." });
      }
    };

    socket.on("send_message", sendMessageHandler);

    socket.on("video-offer", ({ offer, sessionId }) => {
      const roomId = socket.currentRoomId;
      if (roomId) socket.to(roomId).emit("video-offer", { offer, senderId: socket.user.sub });
    });

    socket.on("video-answer", ({ answer, sessionId }) => {
      const roomId = socket.currentRoomId;
      if (roomId) socket.to(roomId).emit("video-answer", { answer, senderId: socket.user.sub });
    });

    socket.on("ice-candidate", ({ candidate, sessionId }) => {
      const roomId = socket.currentRoomId;
      if (roomId) socket.to(roomId).emit("ice-candidate", { candidate, senderId: socket.user.sub });
    });

    socket.on("end-call", ({ sessionId }) => {
      const roomId = socket.currentRoomId;
      if (roomId) socket.to(roomId).emit("call-ended", { senderId: socket.user.sub });
    });

    socket.on("admission_request", async ({ sessionId }) => {
      try {
        const session = await resolveSession(sessionId);
        if (!session) return;
        const booking = await Booking.findById(session.bookingId);
        if (booking) {
          io.to(`user:${booking.mentorId}`).emit("admission_request", {
            sessionId: session._id.toString(),
            menteeId: socket.user.sub,
          });
        }
      } catch (error) {
        console.error("admission_request error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
