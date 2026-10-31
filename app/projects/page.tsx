"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Search,
  PlusCircle,
  Users,
  Code2,
  ExternalLink,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "recruiting" | "my-projects">("all");
  const [search, setSearch] = useState("");

  const projects = dataStore.getProjects();
  const currentUserId = dataStore.getCurrentUserId();

  const filteredProjects = projects.filter((p) => {
    if (activeTab === "recruiting") {
      const needed = p.team_size - (p.current_members_count || 1);
      if (needed <= 0) return false;
    }
    if (activeTab === "my-projects" && !p.is_member) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some((sk) => sk.toLowerCase().includes(q)) ||
        p.tags.some((tg) => tg.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <AppShell
      title="Project Collaboration & Hackathon Squads"
      subtitle="Find teammates with matching skills for SIH, VTU mini-projects, and Karnataka hackathons"
    >
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("recruiting")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "recruiting" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Looking for Members
            </button>
            <button
              onClick={() => setActiveTab("my-projects")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "my-projects" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Projects ({projects.filter((p) => p.is_member).length})
            </button>
          </div>

          <Link
            href="/projects/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Project Squad</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by required skills (PyTorch, Next.js, IoT, Flutter) or project domain..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const membersCount = proj.current_members_count || (proj.members ? proj.members.length : 1);
            const needed = Math.max(0, proj.team_size - membersCount);
            return (
              <div
                key={proj.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card card-hover-lift p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tg) => (
                        <span
                          key={tg}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>

                    {needed > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Looking for {needed} {needed === 1 ? "member" : "members"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Squad Full
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>Led by {proj.owner?.full_name}</span>
                      {proj.owner?.is_verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span>• {proj.owner?.college?.short_name || "VVCE"}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  {/* Skills tags */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Team: {membersCount} / {proj.team_size}
                  </span>

                  <Link
                    href={`/projects/${proj.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    View Project Space →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
