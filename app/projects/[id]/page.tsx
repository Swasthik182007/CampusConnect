"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderGit2,
  Users,
  Code2,
  ExternalLink,
  BadgeCheck,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Send,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const project = dataStore.getProjectById(id);
  const currentUserId = dataStore.getCurrentUserId();
  const [joinMessage, setJoinMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!project) {
    return (
      <AppShell title="Project Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Project Squad Not Found</h2>
          <Link
            href="/projects"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const isOwner = project.owner_id === currentUserId;
  const isMember = project.is_member || isOwner;
  const membersCount = project.current_members_count || (project.members?.length || 1);
  const needed = Math.max(0, project.team_size - membersCount);

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinMessage.trim()) return;

    dataStore.requestToJoinProject(project.id, joinMessage.trim());
    setRequestSent(true);
  };

  const handleRespondRequest = (reqId: string, accept: boolean) => {
    dataStore.respondToProjectRequest(project.id, reqId, accept);
  };

  const handleOpenGroupChat = () => {
    const convId = dataStore.startOrGetDirectConversation(
      project.owner_id,
      `${project.title} Squad Chat`,
      "project",
      project.id
    );
    router.push(`/messages?conv=${convId}`);
  };

  return (
    <AppShell title={project.title} subtitle="Student Innovation & Hackathon Squad">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            {isMember && (
              <button
                onClick={handleOpenGroupChat}
                className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Squad Group Chat</span>
              </button>
            )}
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {project.tags.map((tg) => (
                  <span
                    key={tg}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {tg}
                  </span>
                ))}
                {needed > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Looking for {needed} more members
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    Squad Full
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Created by {project.owner?.full_name}</span>
                {project.owner?.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                )}
                <span>• {project.owner?.college?.name}</span>
              </div>
            </div>

            {project.hackathon_url && (
              <a
                href={project.hackathon_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              >
                <span>Hackathon Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem Statement & Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Required Tech Stack & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Members & Application Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Member Roster (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                Squad Members ({membersCount}/{project.team_size})
              </h3>
              {isMember && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  You are a Member
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {project.members?.map((m) => (
                <div key={m.user_id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 overflow-hidden">
                      {m.user?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.user.avatar_url} alt="Member" className="w-full h-full object-cover" />
                      ) : (
                        m.user?.full_name?.charAt(0) || "M"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {m.user?.full_name}
                        {m.user?.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {m.user?.college?.short_name || "VVCE"} • {m.user?.branch}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Owner Pending Requests Review Box */}
            {isOwner && project.requests && project.requests.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600">
                  Pending Join Requests ({project.requests.filter((r) => r.status === "pending").length})
                </h4>
                <div className="space-y-2">
                  {project.requests
                    .filter((r) => r.status === "pending")
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {req.user?.full_name} ({req.user?.branch})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {req.user?.college?.short_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{req.message}"</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleRespondRequest(req.id, true)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept into Squad
                          </button>
                          <button
                            onClick={() => handleRespondRequest(req.id, false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Apply to Join (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Join this Squad
            </h3>

            {isMember ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">You are on the Team!</h4>
                <p className="text-xs text-emerald-700">
                  Coordinate with teammates using the Squad Group Chat.
                </p>
                <button
                  onClick={handleOpenGroupChat}
                  className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Open Squad Group Chat
                </button>
              </div>
            ) : project.has_requested || requestSent ? (
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto" />
                <h4 className="font-bold text-sm">Application Sent!</h4>
                <p className="text-xs text-indigo-700">
                  The project lead has been notified. You'll receive a notification when they review your request.
                </p>
              </div>
            ) : needed <= 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-center text-xs">
                This project squad has already reached maximum capacity ({project.team_size} members).
              </div>
            ) : (
              <form onSubmit={handleRequestJoin} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Tell the team lead about your relevant skills, past hackathons, and how you want to contribute.
                </p>
                <div>
                  <textarea
                    rows={4}
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder="e.g. Hi! I'm a 3rd year CSE student at VVCE. I have experience with Next.js and Tailwind, and I'd love to handle the frontend UI for this project!"
                    required
                    className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Send Join Request →</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="post"
        targetId={project.id}
        targetTitle={project.title}
      />
    </AppShell>
  );
}
