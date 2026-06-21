import Message from "../models/Message.js";
import Session from "../models/Session.js";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;

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

const getTimeStatus = (session) => {
  const now = new Date();
  if (session.status === "completed" || session.status === "expired") return session.status;
  if (!session.scheduledAt) return "active";

  const scheduledAt = new Date(session.scheduledAt);
  const expiresAt = session.expiresAt
    ? new Date(session.expiresAt)
    : new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

  if (now > expiresAt) return "expired";
  if (now >= scheduledAt) return "active";
  if (now >= scheduledAt.getTime() - FIFTEEN_MIN_MS) return "ready_to_start";
  return "upcoming";
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

    socket.on("join_session", async ({ sessionId }) => {
      const session = await resolveSession(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found." });
        return;
      }

      const timeStatus = getTimeStatus(session);
      if (timeStatus === "expired") {
        socket.emit("error", { message: "This session has expired." });
        return;
      }

      if (timeStatus === "completed") {
        socket.emit("error", { message: "This session has already ended." });
        return;
      }

      if (session.status !== "ongoing") {
        socket.emit("error", { message: "Session must be ongoing." });
        return;
      }

      if (!(await isParticipant(session, socket.user.sub))) {
        socket.emit("error", { message: "You are not a participant of this session." });
        return;
      }

      const roomId = session._id.toString();
      socket.join(roomId);
      socket.currentRoomId = roomId;

      const messages = await Message.find({ sessionId: roomId })
        .sort({ createdAt: 1 })
        .limit(100);

      socket.emit("session_messages", messages);

      const otherSockets = await io.in(roomId).fetchSockets();
      if (otherSockets.length > 1) {
        socket.emit("participant_joined", { userId: socket.user.sub });
      }
    });

    const sendMessageHandler = async ({ sessionId, receiverId, content, file }) => {
      const session = await resolveSession(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found." });
        return;
      }

      const timeStatus = getTimeStatus(session);
      if (timeStatus !== "active") {
        socket.emit("error", { message: "Chat is only available during the active session time." });
        return;
      }

      if (session.status !== "ongoing") {
        socket.emit("error", { message: "Session must be ongoing." });
        return;
      }

      const senderId = socket.user.sub;
      const roomId = session._id.toString();

      if (!(await isParticipant(session, senderId))) {
        socket.emit("error", { message: "You are not a participant of this session." });
        return;
      }

      const messageCount = await Message.countDocuments({ sessionId: roomId });
      if (messageCount === 0) {
        const booking = await Booking.findById(session.bookingId);
        if (!booking || booking.mentorId.toString() !== senderId) {
          socket.emit("error", { message: "Only the mentor can start the conversation." });
          return;
        }
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

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
