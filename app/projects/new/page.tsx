"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderGit2,
  Sparkles,
  Users,
  Code2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsStr, setSkillsStr] = useState("Next.js, Python, PostgreSQL, Docker");
  const [tagsStr, setTagsStr] = useState("AI, Web3, Smart Mobility");
  const [teamSize, setTeamSize] = useState(4);
  const [hackathonUrl, setHackathonUrl] = useState("https://karnatakahackathon2025.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in title and description.");
      return;
    }

    setLoading(true);
    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const proj = dataStore.createProject({
        title,
        description,
        skills,
        tags,
        team_size: teamSize,
        hackathon_url: hackathonUrl || undefined,
      });

      router.push(`/projects/${proj.id}`);
    } catch {
      setError("Failed to create project.");
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Project Squad" subtitle="Assemble a team of students with complementary engineering skills">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Project Squad Details
              </h2>
              <p className="text-xs text-slate-500">
                Specify skills needed and set your team capacity.
              </p>
            </div>
          </div>

          {error && (
            <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Campus Navigation & Autonomous Delivery Rover"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Target Team Size *
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Hackathon / Competition URL (optional)
                </label>
                <input
                  type="url"
                  value={hackathonUrl}
                  onChange={(e) => setHackathonUrl(e.target.value)}
                  placeholder="https://karnatakahackathon2025.in"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Domain Tags (Comma separated) *
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="e.g. AI, IoT, Web, AgriTech, FinTech"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Required Skills & Tech Stack (Comma separated) *
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="e.g. Next.js, PyTorch, ROS, Embedded C, Figma"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Detailed Problem Statement & Scope *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you plan to build, current progress, architecture components, and what roles you want applicants to fulfill..."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/projects"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? "Publishing Squad..." : "Publish Project Squad →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
