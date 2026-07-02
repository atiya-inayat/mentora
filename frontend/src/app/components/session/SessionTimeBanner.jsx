"use client";

import { Calendar, Clock, AlertCircle, Play } from "lucide-react";

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
      </div>
    );
  }

  if (timeStatus === "ready") {
    const ms = Math.max(0, timeRemaining);
    const totalMins = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return (
      <div className="p-4 text-center bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
        <Play className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          Session is ready to start!{" "}
          {hours > 0 || mins > 0 ? (
            <span className="text-green-600/80 text-sm">
              (Available in {hours > 0 ? `${hours}h ` : ""}
              {mins}m)
            </span>
          ) : (
            <span className="text-green-600/80 text-sm">(Available now)</span>
          )}
        </span>
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
