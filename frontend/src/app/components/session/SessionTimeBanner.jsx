"use client";

import { Calendar, Clock, AlertCircle, Play } from "lucide-react";

export default function SessionTimeBanner({ timeStatus, scheduledAt, timeRemaining, readyToStartIn }) {
  if (timeStatus === "upcoming") {
    const ms = Math.max(0, timeRemaining);
    const totalMins = Math.floor(ms / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return (
      <div className="p-4 text-center bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
        <Calendar className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          Your session is scheduled for{" "}
          {new Date(scheduledAt).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
        <div className="mt-1.5 text-sm text-blue-600/80">
          <Clock className="inline w-4 h-4 mr-1" />
          Time remaining until your next session:{" "}
          <span className="font-semibold">
            {hours > 0 ? `${hours}h ` : ""}{mins}m
          </span>
        </div>
      </div>
    );
  }

  if (timeStatus === "ready_to_start") {
    const ms = Math.max(0, timeRemaining);
    const totalMins = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return (
      <div className="p-4 text-center bg-green-50 text-green-700 rounded-xl border border-green-200">
        <Play className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          Session is ready to start!{" "}
          {hours > 0 || mins > 0 ? (
            <span className="text-green-600/80 text-sm">
              (Starts in {hours > 0 ? `${hours}h ` : ""}{mins}m)
            </span>
          ) : (
            <span className="text-green-600/80 text-sm">(Starting now)</span>
          )}
        </span>
      </div>
    );
  }

  if (timeStatus === "expired") {
    return (
      <div className="p-4 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
        <AlertCircle className="inline w-5 h-5 mr-2 mb-0.5" />
        <span className="font-medium">
          This session was scheduled for{" "}
          {new Date(scheduledAt).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}{" "}
          and has expired.
        </span>
      </div>
    );
  }

  if (timeStatus === "completed") {
    return (
      <div className="p-4 text-center bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
        <Clock className="inline w-5 h-5 mr-2 mb-0.5" />
        This session has already ended.
      </div>
    );
  }

  return null;
}
