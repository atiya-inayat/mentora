"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/lib/hooks/useNotifications";
import Link from "next/link";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 transition rounded-full hover:bg-surface/20"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 card rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-white/40 hover:text-primary"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-center text-white/30">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-center text-white/30">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-white/5 transition hover:bg-white/[0.06] ${
                    !n.read ? "bg-white/[0.04]" : ""
                  }`}
                >
                  {n.link ? (
                    <Link href={n.link} onClick={() => setOpen(false)}>
                      <NotificationItem notification={n} onRead={markAsRead.mutate} />
                    </Link>
                  ) : (
                    <NotificationItem notification={n} onRead={markAsRead.mutate} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onRead }) {
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        if (!notification.read) onRead(notification._id);
      }}
    >
      <p className="text-sm font-medium text-primary">{notification.title}</p>
      <p className="text-xs text-white/40 mt-0.5">{notification.message}</p>
      <p className="text-[10px] text-white/30 mt-1">
        {formatTimeAgo(new Date(notification.createdAt))}
      </p>
    </div>
  );
}

function formatTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
