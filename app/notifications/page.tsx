"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Calendar,
  BookOpen,
  Users,
  FolderGit2,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { formatDateTime } from "@/lib/utils";

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  registration_confirmed: <Calendar className="w-4 h-4 text-emerald-600" />,
  booking_request: <BookOpen className="w-4 h-4 text-indigo-600" />,
  booking_accepted: <BookOpen className="w-4 h-4 text-emerald-600" />,
  booking_rejected: <BookOpen className="w-4 h-4 text-rose-600" />,
  join_request: <FolderGit2 className="w-4 h-4 text-amber-600" />,
  post_like: <Sparkles className="w-4 h-4 text-rose-500" />,
  post_comment: <MessageSquare className="w-4 h-4 text-indigo-600" />,
  event_approved: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  new_message: <MessageSquare className="w-4 h-4 text-indigo-600" />,
};

export default function NotificationsPage() {
  const notifications = dataStore.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead();
  };

  const handleMarkRead = (id: string) => {
    dataStore.markNotificationAsRead(id);
  };

  return (
    <AppShell title="Campus Notifications" subtitle="Real-time updates on your event RSVPs, tutoring requests, and messages">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">
              All Activity Alerts
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No notifications yet. Activity from your event registrations, tutor bookings, and squad applications will appear here.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                  !notif.is_read ? "bg-indigo-50/40 hover:bg-indigo-50/70" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {NOTIF_ICONS[notif.type] || <Bell className="w-4 h-4 text-indigo-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 capitalize">
                      {notif.type.replace(/_/g, " ")}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {notif.payload.event_title && (
                      <span>
                        Confirmed RSVP for <strong>{notif.payload.event_title}</strong> at {notif.payload.venue}.
                      </span>
                    )}
                    {notif.payload.tutor_name && (
                      <span>
                        Tutoring session with <strong>{notif.payload.tutor_name}</strong> for {notif.payload.subject}.
                      </span>
                    )}
                    {notif.payload.applicant_name && (
                      <span>
                        <strong>{notif.payload.applicant_name}</strong> applied to join your project squad <em>{notif.payload.project_title}</em>.
                      </span>
                    )}
                    {notif.payload.user_name && (
                      <span>
                        <strong>{notif.payload.user_name}</strong> liked your post in {notif.payload.community}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
