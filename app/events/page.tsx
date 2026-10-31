"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { EventType, Event } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

const EVENT_TABS: ("All" | EventType)[] = [
  "All",
  "Hackathons",
  "Tech",
  "Workshops",
  "Cultural",
  "College Events",
  "State Level",
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"All" | EventType>("All");
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "my-registrations">("all");

  const events = dataStore.getEvents();
  const approvedEvents = events.filter((e) => e.status === "approved");

  // Top featured event (Karnataka Student Hackathon 2025)
  const featuredEvent = approvedEvents.find((e) => e.id === "evt-1") || approvedEvents[0];

  const handleRegister = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = dataStore.registerForEvent(eventId);
    alert(res.message);
  };

  const filteredEvents = approvedEvents.filter((evt) => {
    if (viewFilter === "my-registrations" && !evt.is_registered) return false;
    if (activeTab !== "All") {
      if (activeTab === "State Level") {
        if (evt.level !== "state") return false;
      } else if (activeTab === "College Events") {
        if (evt.level !== "college") return false;
      } else if (evt.type !== activeTab) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.city.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <AppShell
      title="Campus & State Events"
      subtitle="Karnataka inter-college hackathons, technical fests, workshops, and cultural fests"
    >
      <div className="space-y-7">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewFilter("all")}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewFilter === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Events ({approvedEvents.length})
            </button>
            <button
              onClick={() => setViewFilter("my-registrations")}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewFilter === "my-registrations" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Registrations ({events.filter((e) => e.is_registered).length})
            </button>
          </div>

          <Link
            href="/events/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Campus Event</span>
          </Link>
        </div>

        {/* 1. Featured Top Banner Event */}
        {featuredEvent && viewFilter === "all" && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#1E1B4B] to-indigo-950 text-white border border-indigo-900 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    Featured Karnataka Event
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-xs">
                    State Level
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  {featuredEvent.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl line-clamp-3">
                  {featuredEvent.description}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-indigo-200 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{formatDate(featuredEvent.start_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{featuredEvent.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{featuredEvent.registered_count}/{featuredEvent.capacity} spots filled</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <Link
                    href={`/events/${featuredEvent.id}`}
                    className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {featuredEvent.is_registered ? (
                    <span className="px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleRegister(featuredEvent.id, e)}
                      className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                    >
                      Instant RSVP
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredEvent.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Search & Tabs Navigation */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title, keyword, college venue, or city..."
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {EVENT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const percentage = Math.min(
              100,
              Math.round(((evt.registered_count || 1) / evt.capacity) * 100)
            );
            return (
              <Link
                key={evt.id}
                href={`/events/${evt.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-card card-hover-lift overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Poster Banner */}
                  <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.poster_url || "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/80">
                        {evt.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-900/80 text-white uppercase">
                        {evt.level}
                      </span>
                    </div>

                    {evt.is_registered && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Registered
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-bold">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{formatDate(evt.start_at)}</span>
                      <span>•</span>
                      <span>{evt.city}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </p>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>Attendance</span>
                        <span className="font-bold text-slate-800">
                          {evt.registered_count}/{evt.capacity} spots
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentage >= 90 ? "bg-rose-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center block text-slate-700 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {evt.is_registered ? "View Registration Details →" : "View & Register →"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
