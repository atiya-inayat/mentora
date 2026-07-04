"use client";

import { Calendar, Clock, AlertCircle, Play, Loader } from "lucide-react";

export default function SessionTimeBanner({
  timeStatus,
  scheduledAt,
  timeRemaining,
  readyToStartIn,
}) {
  if (timeStatus === "upcoming") {
    const ms = Math.max(0, timeRemaining);
    const totalMins = Math.floor(ms / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return (
      <div className="p-4 text-center bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
        <Calendar className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          Your session is scheduled for{" "}
          {new Date(scheduledAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <div className="mt-1.5 text-sm text-blue-400/80">
          <Clock className="inline w-4 h-4 mr-1" />
          Time remaining until session:{" "}
          <span className="font-semibold">
            {hours > 0 ? `${hours}h ` : ""}
            {mins}m
          </span>
        </div>
        <div className="mt-2 text-xs text-blue-400/60">
          You can join 15 minutes before the start time
        </div>
      </div>
    );
  }

  if (timeStatus === "ready") {
    return (
      <div className="p-4 text-center bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
        <Play className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          The session is ready! You can join now.
        </span>
        <div className="mt-1.5 text-xs text-green-400/60">
          Click Join Session to enter the waiting room
        </div>
      </div>
    );
  }

  if (timeStatus === "waiting") {
    return (
      <div className="p-4 text-center bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
        <Loader className="inline w-5 h-5 mr-2 mb-0.5 animate-spin" />
        <span className="font-medium">
          Waiting for the other participant to join...
        </span>
        <div className="mt-1.5 text-xs text-yellow-400/60">
          The session will start automatically when both participants have joined
        </div>
      </div>
    );
  }

  if (timeStatus === "expired") {
    return (
      <div className="p-4 text-center bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
        <AlertCircle className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          This session was scheduled for{" "}
          {new Date(scheduledAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          and has expired.
        </span>
      </div>
    );
  }

  if (timeStatus === "completed") {
    return (
      <div className="p-4 text-center bg-white/5 text-gray-400 rounded-xl border border-white/10">
        <Clock className="inline w-5 h-5 mr-2 mb-0.5" />
        This session has already ended.
      </div>
    );
  }

  return null;
}