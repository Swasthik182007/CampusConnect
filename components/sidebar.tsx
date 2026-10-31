"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  BookOpen,
  Users,
  FolderGit2,
  MessageSquare,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  ChevronDown,
  Sparkles,
  School,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = dataStore.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Peer Tutoring", href: "/tutoring", icon: BookOpen },
    { name: "Communities", href: "/communities", icon: Users },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Admin section
  if (role === "admin" || role === "moderator") {
    navItems.push({ name: "Admin Portal", href: "/admin", icon: ShieldCheck });
  }

  const content = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0F172A] to-[#1E1B4B] text-slate-300 w-64 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={onMobileClose}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-lg tracking-tight">CampusConnect</span>
            </div>
            <span className="text-[11px] font-medium text-indigo-400 tracking-wider uppercase flex items-center gap-1">
              Karnataka Hub
            </span>
          </div>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Campus Identity Badge */}
      <div className="px-4 py-3 mx-3 my-2 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-2.5">
        <School className="w-4 h-4 text-indigo-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            {user?.college?.short_name || "VVCE Mysuru"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {user?.branch || "Engineering"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <BadgeCheck className="w-3 h-3" />
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Quick Demo Switcher & Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40 relative">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.full_name || "User")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.full_name || "Student"}
                  </span>
                  {user?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 capitalize">
                  {user?.role === "admin" ? "Admin / Moderator" : `${user?.role || "Student"} (${user?.college?.short_name || "Karnataka"})`}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* User profile & session dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 space-y-1">
              <Link
                href="/profile"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>My Profile & Settings</span>
              </Link>

              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Moderation Console</span>
                </Link>
              )}

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                  window.location.href = "/login";
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of CampusConnect</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
