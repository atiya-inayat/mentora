"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import {
  useSession,
  useJoinSession,
  useAdmitGuest,
  useDeclineGuest,
  useEndSession,
} from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import ConfirmDialog from "@/app/components/shared/ConfirmDialog";
import VideoCall from "@/app/components/session/VideoCall";
import SessionTimeBanner from "@/app/components/session/SessionTimeBanner";
import { Spinner } from "@/app/components/shared/LoadingSkeleton";
import usePageTitle from "@/lib/hooks/usePageTitle";
import api from "@/lib/axios";
import {
  Send,
  MessageSquare,
  StopCircle,
  X,
  Paperclip,
  FileText,
  Download,
  Clock,
  Video,
  User,
  LogOut,
} from "lucide-react";

const ADMISSION_TIMEOUT_MS = 60000;

export default function SessionPage() {
  usePageTitle("Session");
  const { session: sessionId } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: sessionData, isLoading, refetch } = useSession(sessionId);
  const { mutate: joinSession, isPending: joining } = useJoinSession();
  const { mutate: admitGuest, isPending: admitting } = useAdmitGuest();
  const { mutate: declineGuest } = useDeclineGuest();
  const { mutate: endSession, isPending: ending } = useEndSession();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [admissionRequest, setAdmissionRequest] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const admissionTimerRef = useRef(null);

  const session = sessionData?.data;
  const mentorId = session?.bookingId?.mentorId?._id;
  const menteeId = session?.bookingId?.menteeId?._id;
  const isMentor = user?.id === mentorId;
  const receiverId = isMentor ? menteeId : mentorId;
  const timeStatus = session?.timeStatus || "upcoming";
  const scheduledAt = session?.scheduledAt;
  const sessionStatus = session?.status;
  const menteeName = session?.bookingId?.menteeId?.name || "the mentee";
  const mentorHasJoined = session?.participants?.mentor === true;
  const menteeHasJoined = session?.participants?.mentee === true;
  const hasJoined = isMentor ? mentorHasJoined : menteeHasJoined;

  useEffect(() => {
    if (!sessionId) return;
    if (sessionStatus === "live") setIsLive(true);
  }, [sessionId, sessionStatus]);

  const handleJoinSession = useCallback(() => {
    const bookingId = session?.bookingId?._id || session?.bookingId;
    joinSession(bookingId, {
      onSuccess: () => {
        setHasJoinedRoom(true);
        refetch();
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Could not join the session.";
        setError(msg);
        setTimeout(() => setError(""), 5000);
      },
    });
  }, [session, joinSession, refetch]);

  const handleAdmit = useCallback(() => {
    if (!sessionId) return;
    admitGuest(sessionId, {
      onSuccess: () => {
        setAdmissionRequest(null);
        setIsLive(true);
        refetch();
      },
      onError: (err) => {
        setError(err?.response?.data?.message || "Could not admit participant.");
        setTimeout(() => setError(""), 5000);
      },
    });
  }, [sessionId, admitGuest, refetch]);

  const handleDecline = useCallback(() => {
    if (!sessionId) return;
    declineGuest(sessionId);
    setAdmissionRequest(null);
  }, [sessionId, declineGuest]);

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

    socket.on("admission_request", ({ menteeName: name }) => {
      setAdmissionRequest({ menteeName: name || "A mentee" });
      if (admissionTimerRef.current) clearTimeout(admissionTimerRef.current);
      admissionTimerRef.current = setTimeout(() => {
        setAdmissionRequest(null);
      }, ADMISSION_TIMEOUT_MS);
    });

    socket.on("guest_admitted", () => {
      setIsLive(true);
      refetch();
    });

    socket.on("admission_declined", () => {
      setError("The host declined your request to join.");
      setTimeout(() => setError(""), 5000);
    });

    socket.on("session_ended", () => {
      setIsLive(false);
      setError("Session has ended. Redirecting...");
      setTimeout(() => router.push("/bookings"), 2000);
    });

    socket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    });

    return () => {
      socket.off("session_messages");
      socket.off("receive_message");
      socket.off("admission_request");
      socket.off("guest_admitted");
      socket.off("admission_declined");
      socket.off("session_ended");
      socket.off("error");
      disconnectSocket();
      if (admissionTimerRef.current) clearTimeout(admissionTimerRef.current);
    };
  }, [sessionId, router, refetch]);

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
        { content: "", file: uploaded, senderId: user?.id, createdAt: new Date() },
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "File upload failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          <p>The meeting is being prepared. Please try again in a few moments.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1 mb-3 text-xs transition text-white/40 hover:text-primary"
        >
          ← Back to Bookings
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Meeting</h1>
              {session?.bookingId?.mentorId?.name && (
                <p className="text-sm text-muted">
                  {isMentor
                    ? `With ${session.bookingId.menteeId?.name || "Mentee"}`
                    : `With ${session.bookingId.mentorId?.name || "Mentor"}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLive && (
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

            {isMentor && (isLive || sessionStatus === "host_joined" || sessionStatus === "guest_waiting") && (
              <button
                onClick={() => setShowEndConfirm(true)}
                disabled={ending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/[0.15] disabled:opacity-50"
              >
                <StopCircle className="w-4 h-4" />
                {ending ? "Ending..." : "End Meeting"}
              </button>
            )}
          </div>
        </div>

        <SessionTimeBanner
          timeStatus={timeStatus}
          scheduledAt={scheduledAt}
          timeRemaining={session?.timeRemaining}
          readyToStartIn={session?.readyToStartIn}
        />

        {timeStatus === "joinable" && !hasJoined && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleJoinSession}
              disabled={joining}
              className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium btn-primary rounded-xl disabled:opacity-50"
            >
              <Video className="w-5 h-5" />
              {joining ? "Joining..." : "Join Session"}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 mt-3 mb-3 text-sm text-red-600 bg-red-100 rounded-xl">{error}</div>
        )}

        {/* Admission Request Modal (Mentor Only) */}
        {isMentor && admissionRequest && !isLive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 mx-4 card rounded-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/20">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Join Request</h3>
                <p className="text-sm text-muted mb-6">
                  {admissionRequest.menteeName} wants to join this session.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={handleDecline}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.06] transition"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAdmit}
                    disabled={admitting}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {admitting ? "Admitting..." : "Admit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex gap-4">
          <div className={`transition-all duration-300 ${showChat ? "w-[65%]" : "w-full"}`}>
            <div className="h-[70vh] rounded-2xl overflow-hidden border border-white/5 shadow-lg">
              {isLive ? (
                <VideoCall
                  socketRef={socketRef}
                  sessionId={sessionId}
                  isMentor={isMentor}
                  onCallEnded={() => {}}
                />
              ) : isMentor && (sessionStatus === "host_joined" || sessionStatus === "guest_waiting") ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white/70 px-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Video className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <p className="text-xl font-medium text-white mb-2">Meeting Ready</p>
                  <p className="text-sm text-white/50 text-center max-w-sm">
                    {sessionStatus === "guest_waiting"
                      ? `${menteeName} is waiting to be admitted.`
                      : "Waiting for participants..."}
                  </p>
                  {sessionStatus === "guest_waiting" && (
                    <button
                      onClick={handleAdmit}
                      disabled={admitting}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
                    >
                      <Video className="w-4 h-4" />
                      {admitting ? "Admitting..." : "Admit to Meeting"}
                    </button>
                  )}
                </div>
              ) : !isMentor && (sessionStatus === "guest_waiting" || (hasJoinedRoom && sessionStatus !== "live")) ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white/70 px-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xl font-medium text-white mb-2">Waiting for the host</p>
                  <p className="text-sm text-white/50 text-center max-w-sm">
                    The mentor will admit you shortly. Do not close this page.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white/70">
                  <Video className="w-16 h-16 mb-4 opacity-30" />
                  {timeStatus === "upcoming" && (
                    <>
                      <p className="text-lg">Waiting for session time...</p>
                      <p className="mt-1 text-sm opacity-50">
                        Video and chat will be available at the scheduled time
                      </p>
                    </>
                  )}
                  {timeStatus === "joinable" && !hasJoinedRoom && (
                    <>
                      <p className="text-lg">Session ready to start</p>
                      <p className="mt-1 text-sm opacity-50">
                        Click the Join Session button above to enter
                      </p>
                    </>
                  )}
                  {(timeStatus === "expired" || sessionStatus === "completed") && (
                    <>
                      <p className="text-lg">Session has ended</p>
                      <p className="mt-1 text-sm opacity-50">This session is no longer available</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {showChat && isLive && (
            <div className="w-[35%] h-[70vh] flex flex-col card rounded-2xl">
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
        title="End Meeting"
        description="Are you sure you want to end this meeting? This will disconnect all participants and cannot be undone."
        confirmLabel="End Meeting"
        variant="danger"
        loading={ending}
        onConfirm={() => {
          endSession(session?.bookingId?._id || session?.bookingId, {
            onSuccess: () => router.push("/bookings"),
          });
          setShowEndConfirm(false);
        }}
      />
    </main>
  );
}
