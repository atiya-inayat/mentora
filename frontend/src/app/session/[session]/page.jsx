"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useSession, useEndSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import ConfirmDialog from "@/app/components/shared/ConfirmDialog";
import VideoCall from "@/app/components/session/VideoCall";
import SessionTimeBanner from "@/app/components/session/SessionTimeBanner";
import { Spinner } from "@/app/components/shared/LoadingSkeleton";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Send,
  MessageSquare,
  StopCircle,
  CalendarClock,
  X,
  Paperclip,
  FileText,
  Download,
} from "lucide-react";

export default function SessionPage() {
  usePageTitle("Session");
  const { session: sessionId } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: sessionData, isLoading } = useSession(sessionId);
  const { mutate: endSession, isPending: ending } = useEndSession();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [postponing, setPostponing] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const session = sessionData?.data;
  const mentorId = session?.bookingId?.mentorId?._id;
  const menteeId = session?.bookingId?.menteeId?._id;
  const isMentor = user?.id === mentorId;
  const receiverId = isMentor ? menteeId : mentorId;
  const isOngoing = session?.status === "ongoing";
  const timeStatus = session?.timeStatus || "upcoming";
  const isExpired = timeStatus === "expired" || timeStatus === "completed";
  const scheduledAt = session?.scheduledAt;

  const canVideoCall = isOngoing && timeStatus === "active" && !isExpired;
  const canChat = isOngoing && timeStatus === "active" && !isExpired;

  useEffect(() => {
    if (!sessionId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join_session", { sessionId });

    socket.on("session_messages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("session_ended", () => {
      setError("Session has ended. Redirecting...");
      setTimeout(() => router.push("/my-sessions"), 2000);
    });

    socket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    });

    return () => {
      socket.off("session_messages");
      socket.off("receive_message");
      socket.off("session_ended");
      socket.off("error");
      disconnectSocket();
    };
  }, [sessionId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      sessionId,
      content: input,
      receiverId,
    });

    setMessages((prev) => [...prev, { content: input, senderId: user?.id, createdAt: new Date() }]);

    setInput("");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("File size exceeds 10MB limit");
      setTimeout(() => setError(""), 5000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/upload", formData);
      const { file: uploaded } = res.data;

      socketRef.current?.emit("send_message", {
        sessionId,
        content: "",
        receiverId,
        file: uploaded,
      });

      setMessages((prev) => [
        ...prev,
        {
          content: "",
          file: uploaded,
          senderId: user?.id,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "File upload failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePostpone = async () => {
    if (!newDate) return;
    setPostponing(true);
    try {
      await api.put(`/api/sessions/${session?.bookingId?._id}/postpone`, {
        newScheduledAt: newDate,
      });
      router.push("/my-sessions");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to postpone session");
    } finally {
      setPostponing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] text-white/40">
          <p>Session not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href="/my-sessions"
          className="inline-flex items-center gap-1 mb-3 text-xs transition text-white/40 hover:text-primary"
        >
          ← Back to Sessions
        </Link>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-primary font-fugaz">Session</h1>
              {session?.bookingId?.mentorId?.name && (
                <p className="text-sm text-white/60">
                  {isMentor
                    ? `With ${session.bookingId.menteeId?.name || "Mentee"}`
                    : `With ${session.bookingId.mentorId?.name || "Mentor"}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canChat && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition rounded-full ${
                  showChat
                    ? "bg-primary text-white"
                    : "bg-white/[0.06] text-primary hover:bg-white/[0.10]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {showChat ? "Hide Chat" : "Chat"}
              </button>
            )}

            {isMentor && isOngoing && !isExpired && (
              <>
                <button
                  onClick={() => setShowPostpone(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition rounded-full glass-card text-amber-400 hover:bg-white/[0.08]"
                >
                  <CalendarClock className="w-4 h-4" />
                  Postpone
                </button>
                <button
                  onClick={() => setShowEndConfirm(true)}
                  disabled={ending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/[0.15] disabled:opacity-50"
                >
                  <StopCircle className="w-4 h-4" />
                  {ending ? "Ending..." : "End Session"}
                </button>
              </>
            )}
          </div>
        </div>

        <SessionTimeBanner
          timeStatus={timeStatus}
          scheduledAt={scheduledAt}
          timeRemaining={session?.timeRemaining}
          readyToStartIn={session?.readyToStartIn}
        />

        {error && (
          <div className="p-3 mt-3 mb-3 text-sm text-red-600 bg-red-100 rounded-xl">{error}</div>
        )}

        {showPostpone && (
          <div className="p-6 mb-4 glass-card rounded-2xl">
            <h3 className="mb-3 text-sm font-semibold text-primary">Reschedule Session</h3>
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none bg-white/[0.04] border-white/5 focus:border-primary text-primary"
              />
              <button
                onClick={handlePostpone}
                disabled={postponing || !newDate}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
              >
                {postponing ? "Saving..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowPostpone(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/[0.04] text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="relative flex gap-4">
          <div className={`transition-all duration-300 ${showChat ? "w-[65%]" : "w-full"}`}>
            <div className="h-[70vh] rounded-2xl overflow-hidden border border-white/5 shadow-lg">
              {canVideoCall ? (
                <VideoCall
                  socketRef={socketRef}
                  sessionId={sessionId}
                  isMentor={isMentor}
                  onCallEnded={() => {}}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white/70">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
                  {timeStatus === "upcoming" && (
                    <>
                      <p className="text-lg">Waiting for session time...</p>
                      <p className="mt-1 text-sm opacity-50">
                        Video and chat will be available at the scheduled time
                      </p>
                    </>
                  )}
                  {timeStatus === "ready_to_start" && (
                    <>
                      <p className="text-lg">Session ready to start</p>
                      <p className="mt-1 text-sm opacity-50">
                        Video and chat will activate once the session begins
                      </p>
                    </>
                  )}
                  {(timeStatus === "expired" || timeStatus === "completed") && (
                    <>
                      <p className="text-lg">Session has ended</p>
                      <p className="mt-1 text-sm opacity-50">This session is no longer available</p>
                    </>
                  )}
                  {timeStatus === "active" && !isOngoing && (
                    <>
                      <p className="text-lg">Session not started</p>
                      <p className="mt-1 text-sm opacity-50">
                        Please wait for the mentor to start the session
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {showChat && canChat && (
            <div className="w-[35%] h-[70vh] flex flex-col glass-card rounded-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-primary">Messages</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/40 hover:text-primary"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-white/30">
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl ${
                            isMine
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-white/[0.04] text-primary rounded-bl-md"
                          }`}
                        >
                          {msg.content && <p className="text-sm leading-5 break-words">{msg.content}</p>}
                          {msg.file && (
                            <a
                              href={msg.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 mt-1 p-2 rounded-lg ${
                                isMine ? "bg-white/[0.06]" : "bg-white/[0.02]"
                              } hover:opacity-80 transition-opacity`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="text-xs truncate max-w-[180px]">
                                {msg.file.name}
                              </span>
                              <Download className="w-3 h-3 ml-auto shrink-0" />
                            </a>
                          )}
                          <p
                            className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-white/30"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-2 p-3 border-t bg-white/[0.02] rounded-b-2xl border-white/5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.zip,.rar"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 transition-colors rounded-xl text-white/40 hover:text-primary hover:bg-white/[0.06] disabled:opacity-50"
                  title="Attach file"
                >
                  {uploading ? (
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full border-primary animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border outline-none rounded-xl bg-surface border-white/5 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-white/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="p-2 transition-colors rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showEndConfirm}
        onOpenChange={setShowEndConfirm}
        title="End Session"
        description="Are you sure you want to end this session? This will release the payment to you (90% after platform fee) and cannot be undone."
        confirmLabel="End Session"
        variant="danger"
        loading={ending}
        onConfirm={() => {
          endSession(session?.bookingId?._id, {
            onSuccess: () => router.push("/my-sessions"),
          });
          setShowEndConfirm(false);
        }}
      />
    </main>
  );
}
