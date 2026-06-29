"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const STUN_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
};

export default function VideoCall({ socketRef, sessionId, isMentor, onCallEnded }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [waiting, setWaiting] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  const cleanupMedia = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
  }, [localStream]);

  const endCall = useCallback(() => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit("end-call", { sessionId });
    }
    cleanupMedia();
    onCallEnded?.();
  }, [socketRef, sessionId, cleanupMedia, onCallEnded]);

  const createPeerConnection = useCallback(
    (stream) => {
      const pc = new RTCPeerConnection(STUN_SERVERS);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", { candidate: e.candidate, sessionId });
        }
      };

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
        setWaiting(false);
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          cleanupMedia();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [sessionId, socketRef, cleanupMedia],
  );

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        setVideoOff(true);
        return stream;
      } catch {
        socketRef.current?.emit("error", { message: "Camera/microphone access denied." });
        return null;
      }
    }
  }, [socketRef]);

  useEffect(() => {
    if (!socketRef.current || !sessionId) return;

    const socket = socketRef.current;
    let initiator = false;

    const init = async () => {
      const stream = await startCall();
      if (!stream) return;

      if (isMentor) {
        initiator = true;
        setWaiting(true);
      }

      socket.on("video-offer", async ({ offer }) => {
        if (initiator) return;
        const pc = createPeerConnection(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("video-answer", { answer, sessionId });
      });

      socket.on("video-answer", async ({ answer }) => {
        if (!initiator) return;
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (pcRef.current && candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {}
        }
      });

      socket.on("call-ended", () => {
        cleanupMedia();
        onCallEnded?.();
      });

      if (initiator) {
        const pc = createPeerConnection(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", { offer, sessionId });
      }
    };

    const timeout = setTimeout(() => init(), 500);

    return () => {
      clearTimeout(timeout);
      cleanupMedia();
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [sessionId, isMentor, socketRef]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = audioMuted));
      setAudioMuted(!audioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = videoOff));
      setVideoOff(!videoOff);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      {remoteStream ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-white/70">
          <div className="w-20 h-20 mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <VideoOff className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">
            {waiting ? "Waiting for other participant..." : "Connecting..."}
          </p>
        </div>
      )}

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-20 right-4 w-36 h-28 object-cover rounded-xl border-2 border-white/30 bg-gray-800 shadow-lg"
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition ${
            audioMuted ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
          }`}
          title={audioMuted ? "Unmute" : "Mute"}
        >
          {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          title="End Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition ${
            videoOff ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
          }`}
          title={videoOff ? "Turn on camera" : "Turn off camera"}
        >
          {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
