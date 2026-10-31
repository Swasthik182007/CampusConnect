"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  ShoppingBag,
  Calendar,
  Users,
  FolderGit2,
  ShieldCheck,
  Award,
  MessageSquare,
  CheckCircle2,
  X,
  School,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";

export default function LandingPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const colleges = dataStore.getColleges();
  const listings = dataStore.getListings();
  const events = dataStore.getEvents();
  const communities = dataStore.getCommunities();
  const tutors = dataStore.getTutors();

  const totalMembers = communities.reduce((acc, c) => acc + (c.member_count || 0), 0);

  const features = [
    {
      icon: ShoppingBag,
      title: "Campus Marketplace",
      description:
        "Buy and sell VTU engineering textbooks, lab equipment, drafters, and calculators with peer zero-shipping handoff.",
      tag: "Zero Commission",
    },
    {
      icon: Calendar,
      title: "Karnataka Hackathons & Events",
      description:
        "Discover state-level tech fests, cultural extravaganzas, and workshops with 1-click registration and .ics calendar sync.",
      tag: "Live RSVP",
    },
    {
      icon: BookOpen,
      title: "Peer-to-Peer Tutoring",
      description:
        "Book 1-on-1 sessions with top senior rank holders for DSA, Math, Embedded Systems, and placement prep.",
      tag: "Verified Tutors",
    },
    {
      icon: Users,
      title: "Campus Communities",
      description:
        "Join active guilds for coding, robotics, GATE preparation, Kannada Sahitya, and college sports.",
      tag: "Realtime Feeds",
    },
    {
      icon: FolderGit2,
      title: "Project Collaboration",
      description:
        "Assemble balanced hackathon squads with skill badges (AI, Web, IoT, Drone tech) and recruit teammates.",
      tag: "Team Matcher",
    },
    {
      icon: ShieldCheck,
      title: "Verified Student Network",
      description:
        "Only accredited college emails (.ac.in / .edu.in) are admitted. No spam, no scams, authentic peer trust.",
      tag: "Strict RLS",
    },
    {
      icon: MessageSquare,
      title: "Direct & Group Messaging",
      description:
        "Connect directly with sellers, tutors, and project leads with instant chat and attachment sharing.",
      tag: "End-to-End Safety",
    },
    {
      icon: Award,
      title: "Student Portfolios",
      description:
        "Showcase academic projects, hackathon achievements, verified skills, and campus ratings.",
      tag: "Reputation Score",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                CampusConnect
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Karnataka
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="#colleges" className="hover:text-indigo-600 transition-colors">
              Colleges
            </Link>
            <Link href="/events" className="hover:text-indigo-600 transition-colors">
              Events
            </Link>
            <Link href="/marketplace" className="hover:text-indigo-600 transition-colors">
              Marketplace
            </Link>
            <Link href="#about" className="hover:text-indigo-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-slate-300 transition-all bg-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-indigo-50/20 to-[#F8FAFC]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.12),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dedicated to Verified College Students in Karnataka, India</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Connect. Learn. Share. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              Grow Together.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified collegiate ecosystem for VTU and Karnataka university students.
            Trade coursework textbooks, assemble hackathon teams, book top senior tutors,
            and discover state-level events with verified collegiate safety.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setVideoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span>Watch Video</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Live Demo →</span>
            </Link>
          </div>

          {/* Verification Trust Pill */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Only .ac.in & .edu.in emails allowed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero marketplace fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Realtime chat & moderation
            </span>
          </div>
        </div>
      </section>

      {/* 3. LIVE STATS STRIP (Computed from database) */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">
                2,500+
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Verified Students
              </p>
            </div>
            <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">
                {colleges.length}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Premier Karnataka Colleges
              </p>
            </div>
            <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">
                {events.length}+
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Active State Events & Hackathons
              </p>
            </div>
            <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">
                {totalMembers.toLocaleString()}+
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Community Members
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID (8 Cards) */}
      <section id="features" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Complete Student Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Built for the Modern Campus Experience
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Everything an engineering student in Karnataka needs, organized in one seamless place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card card-hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group cursor-pointer">
                    <span>Explore feature</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PARTICIPATING COLLEGES SECTION */}
      <section id="colleges" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Accredited Hubs
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Participating Colleges in Karnataka
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Exclusively open to authorized student and faculty institutional domains.
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-4 md:mt-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Join with your college ID →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((c) => (
              <div
                key={c.id}
                className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-indigo-300 transition-all card-hover-lift flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <School className="w-7 h-7 text-indigo-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {c.short_name}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      @{c.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{c.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {c.city}, Karnataka
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience Karnataka's premier student network?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto">
            Log in with your college credentials or explore our instant demo sandbox in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all hover:scale-105"
            >
              Sign Up with College Email
            </Link>
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-900/60 text-white hover:bg-indigo-900/80 border border-indigo-400/40 transition-all"
            >
              Open Instant Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="about" className="bg-[#0F172A] text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Karnataka's student community and campus engagement platform.
              Empowering VVCE, RVCE, BMSCE, MSRIT, PES, and NITK students.
            </p>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} CampusConnect. Built for CodeQuest Hackathon.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Campus Marketplace
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Hackathons & Events
                </Link>
              </li>
              <li>
                <Link href="/tutoring" className="hover:text-white transition-colors">
                  Peer Tutoring
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-white transition-colors">
                  Student Communities
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Project Collaboration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Safety & Moderation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Verification Portal
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Allowed Domains Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Row Level Security (RLS)</span>
              </li>
              <li>
                <span className="text-slate-400">Zero Commercial Ads</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Demo Accounts
            </h4>
            <div className="space-y-2 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
              <p className="text-indigo-400 font-semibold">Student Account:</p>
              <p className="text-[11px] text-slate-300 font-mono">demo-student@vvce.ac.in</p>
              <p className="text-indigo-400 font-semibold mt-2">Admin Account:</p>
              <p className="text-[11px] text-slate-300 font-mono">demo-admin@vvce.ac.in</p>
            </div>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                CampusConnect Platform Overview
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center mb-4 text-indigo-400">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold">CampusConnect Karnataka Video Showcase</h4>
              <p className="text-xs text-slate-400 max-w-md mt-2">
                Demonstrating peer-to-peer textbook handoffs, real-time Karnataka hackathon RSVP,
                tutor slot bookings with conflict prevention, and collaborative projects.
              </p>
              <Link
                href="/dashboard"
                onClick={() => setVideoModalOpen(false)}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Launch Live Interactive Prototype
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
