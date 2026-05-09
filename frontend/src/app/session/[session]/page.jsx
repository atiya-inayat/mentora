"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useSession } from "@/lib/hooks/useSession";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SessionChatPage() {
  const { sessionId } = useParams();

  const { user } = useAuth();
  const { data: sessionData, isLoading } = useSession(sessionId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socketRef = useRef(null);

  // booking participants
  const mentorId = sessionData?.bookingId?.mentorId;
  const menteeId = sessionData?.bookingId?.menteeId;

  // determine who the other user is
  const receiverId = user?.sub === mentorId ? menteeId : mentorId;

  useEffect(() => {
    if (!sessionId) return;

    // Connect and join session room
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join_session", { sessionId });

    // Listen for incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
    });

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      socket.off("error");
      disconnectSocket();
    };
  }, [sessionId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socketRef.current.emit("send_message", {
      sessionId,
      content: input,
      receiverId,
    });

    setInput("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Session Chat</h1>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <p>{msg.content}</p>

            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
