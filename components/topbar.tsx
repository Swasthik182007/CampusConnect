"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  PlusCircle,
  Menu,
  Sparkles,
  Check,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { formatDateTime } from "@/lib/utils";

interface TopbarProps {
  onMobileMenuOpen?: () => void;
  title?: string;
  subtitle?: string;
}

export function Topbar({ onMobileMenuOpen, title, subtitle }: TopbarProps) {
  const { user, role } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = dataStore.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title ? (
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search textbooks, hackathons, tutors, or communities across Karnataka..."
              className="w-80 lg:w-96 pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Post Item Action */}
        <Link
          href="/marketplace/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200/60 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Post Listing</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dataStore.markAllNotificationsAsRead()}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => dataStore.markNotificationAsRead(notif.id)}
                      className={`p-3.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !notif.is_read ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 capitalize">
                          {notif.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[11px]">
                          {notif.payload.event_title ||
                            notif.payload.subject ||
                            notif.payload.applicant_name ||
                            notif.payload.user_name ||
                            "CampusConnect update"}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formatDateTime(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Current User Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 overflow-hidden">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || "U"
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
