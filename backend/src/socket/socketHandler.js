// import Message from "../models/Message.js";
// import Session from "../models/Session.js";
// import jwt from "jsonwebtoken";

// export const initSocket = (io) => {
//   // Socket.IO authentication middleware
//   // Runs before a client connects
//   // - Extracts JWT token from handshake auth
//   // - Verifies the token using JWT secret
//   // - Attaches decoded user info to socket
//   // - Rejects connection if token is invalid
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;

//     if (!token) {
//       return next(new Error("Authentication required"));
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = decoded;
//       next();
//     } catch (error) {
//       next(new Error("Invalid token"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("User connected", socket.id);

//     // 1. Joining a session room
//     socket.on("join_session", async ({ sessionId }) => {
//       const session = await Session.findById(sessionId);
//       if (!session || session.status !== "ongoing") {
//         socket.emit("session_error", { message: "Session  must be ongoing." });
//         return;
//       }

//       socket.join(sessionId);
//       console.log("client joined");
//     });

//     socket.on("send_message", async ({ sessionId, receiverId, content }) => {
//       const session = await Session.findById(sessionId);
//       if (!session || session.status !== "ongoing") {
//         socket.emit("error", { message: "Session  must be ongoing." });
//         return;
//       }

//       const senderId = socket.user.sub;

//       const message = await Message.create({
//         receiverId,
//         sessionId,
//         content,
//         senderId,
//       });

//       io.to(sessionId).emit("receive_message", message);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });
//   });
// };

import Message from "../models/Message.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";

// Initialize all Socket.IO logic
export const initSocket = (io) => {
  //  Authentication middleware for all incoming socket connections
  // - Checks if client provided a JWT token in handshake
  // - Verifies token validity
  // - Attaches decoded user info to socket (socket.user)
  // - Blocks connection if token is missing/invalid
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // store authenticated user info
      next(); // allow connection
    } catch (error) {
      next(new Error("Invalid token")); // reject connection
    }
  });

  //  Runs when a client successfully connects
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    //  Join a session (room)
    // - Validates session exists and is ongoing
    // - Adds socket to a room using sessionId
    socket.on("join_session", async ({ sessionId }) => {
      const session = await Session.findById(sessionId);

      if (!session || session.status !== "ongoing") {
        socket.emit("error", { message: "Session must be ongoing." });
        return;
      }

      socket.join(sessionId); // join room
      console.log("client joined");
    });

    //  Send a message داخل session
    // - Validates session is active
    // - Creates message in database
    // - Broadcasts message to all users in the same session room
    socket.on("send_message", async ({ sessionId, receiverId, content }) => {
      const session = await Session.findById(sessionId);

      if (!session || session.status !== "ongoing") {
        socket.emit("error", { message: "Session must be ongoing." });
        return;
      }

      const senderId = socket.user.sub; // user from JWT

      const message = await Message.create({
        receiverId,
        sessionId,
        content,
        senderId,
      });

      //  Emit message to everyone in this session room
      io.to(sessionId).emit("recieve_message", message);
    });

    //  Handle client disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
