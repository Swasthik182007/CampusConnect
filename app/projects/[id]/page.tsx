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
  Sparkles,
  Kanban,
  FileText,
  Github,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  assignee: string;
  priority: "High" | "Medium" | "Low";
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const project = dataStore.getProjectById(id);
  const currentUserId = dataStore.getCurrentUserId();
  const [activeTab, setActiveTab] = useState<"overview" | "matcher" | "tasks" | "files" | "github">("overview");

  const [joinMessage, setJoinMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [invitedStudents, setInvitedStudents] = useState<Record<string, boolean>>({});

  // Kanban workspace task board
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "task-1",
      title: "Collect campus cafeteria dataset (5,000 photos)",
      description: "Gather images of food waste, plastic bottles, and paper cups across VVCE cafeterias.",
      status: "todo",
      assignee: "Swasthik S.",
      priority: "High",
    },
    {
      id: "task-2",
      title: "Research YOLOv8 edge inference latency on Raspberry Pi 4",
      description: "Benchmark frames-per-second and thermal throttling for real-time edge processing.",
      status: "todo",
      assignee: "Teju B.M.",
      priority: "Medium",
    },
    {
      id: "task-3",
      title: "Annotate recyclable plastic vs compost categories in Roboflow",
      description: "Generate bounding boxes and data augmentation transformations.",
      status: "todo",
      assignee: "Kavya Nair",
      priority: "Medium",
    },
    {
      id: "task-4",
      title: "Train CNN classification model in PyTorch",
      description: "Run transfer learning on MobileNetV3 and evaluate accuracy metrics.",
      status: "in_progress",
      assignee: "Swasthik S.",
      priority: "High",
    },
    {
      id: "task-5",
      title: "Design dual-servo motor waste flipper mechanism",
      description: "CAD modeling and 3D printing specs for physical sorting flap.",
      status: "in_progress",
      assignee: "Naveen P.",
      priority: "High",
    },
    {
      id: "task-6",
      title: "Build React Tailwind student dashboard UI",
      description: "Create responsive student reward interface with points history.",
      status: "done",
      assignee: "Swarna N.",
      priority: "High",
    },
    {
      id: "task-7",
      title: "Setup GitHub monorepo and issue board",
      description: "Configured branch protection rules and CI/CD linting actions.",
      status: "done",
      assignee: "Teju B.M.",
      priority: "Low",
    },
    {
      id: "task-8",
      title: "Finalize sensor spec sheet and microcontroller",
      description: "Selected ESP32 with ultrasonic bin capacity sensor.",
      status: "done",
      assignee: "Naveen P.",
      priority: "Medium",
    },
    {
      id: "task-9",
      title: "Submit SIH 2026 preliminary idea presentation",
      description: "Presented slides to VVCE Department Review Committee.",
      status: "done",
      assignee: "Teju B.M.",
      priority: "High",
    },
  ]);

  // New task modal form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Teju B.M.");

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

  // AI Teammate Matching candidates (Blueprint Sheet 2 Screen 2)
  const candidateTeammates = [
    {
      id: "cand-swasthik",
      name: "Swasthik S.",
      branch: "Computer Science & Engineering",
      college: "VVCE Mysuru • Year 3",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&q=80",
      skills: ["Python", "Machine Learning", "PyTorch", "IoT"],
      matchRate: 96,
      reason: "High skill overlap with required PyTorch & ML models; verified hardware deployment experience.",
    },
    {
      id: "cand-swarna",
      name: "Swarna N.",
      branch: "Computer Science & Engineering",
      college: "VVCE Mysuru • Year 3",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80",
      skills: ["React", "UI/UX", "Python", "Data Structures"],
      matchRate: 92,
      reason: "Topper (CGPA 9.6) with React & UI expertise; perfect for student reward gamification frontend.",
    },
    {
      id: "cand-kavya",
      name: "Kavya Nair",
      branch: "Computer Science & Engineering",
      college: "VVCE Mysuru • Year 2",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80",
      skills: ["IoT", "Embedded C", "Sensors", "Hardware"],
      matchRate: 88,
      reason: "Embedded systems specialist with hands-on Raspberry Pi GPIO experience.",
    },
    {
      id: "cand-aditya",
      name: "Aditya Somayaji",
      branch: "Artificial Intelligence & Data Science",
      college: "RVCE Bengaluru • Year 3",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=256&q=80",
      skills: ["PyTorch", "FastAPI", "Python", "FastAPI"],
      matchRate: 85,
      reason: "FastAPI microservice backend developer with cross-campus hackathon finalist experience.",
    },
  ];

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinMessage.trim()) return;
    dataStore.requestToJoinProject(project.id, joinMessage.trim());
    setRequestSent(true);
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

  const handleInviteCandidate = (candName: string, candId: string) => {
    setInvitedStudents((prev) => ({ ...prev, [candId]: true }));
    dataStore.addNotification({
      user_id: candId,
      type: "join_request",
      payload: {
        project_title: project.title,
        message: `You have been invited by Teju to join "${project.title}" based on your AI skill match!`,
      },
    });
    alert(`Invitation sent to ${candName}! They will receive an invitation alert in CampusConnect.`);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskItem["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Sprint backlog task",
      status: "todo",
      assignee: newTaskAssignee,
      priority: newTaskPriority,
    };

    setTasks((prev) => [task, ...prev]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setShowAddTask(false);
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <AppShell title={project.title} subtitle="Student Innovation & Project Collaboration Workspace">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Actions Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenGroupChat}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Squad Group Chat</span>
            </button>
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  Active Innovation Squad
                </span>
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
                    Recruiting {needed} Members
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
                <span>Led by {project.owner?.full_name || "Teju B.M."}</span>
                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                <span>• {project.owner?.college?.name || "VVCE Mysuru"}</span>
              </div>
            </div>

            {project.hackathon_url && (
              <a
                href={project.hackathon_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shrink-0"
              >
                <span>Karnataka Hackathon Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Tab Navigation (Matching Blueprint Sheet 2 Screen 3) */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("matcher")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "matcher"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Teammate Matcher</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold">
                96% Match
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Task Board ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("files")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "files"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Files & Specs</span>
            </button>

            <button
              onClick={() => setActiveTab("github")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "github"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Project Description & Architecture
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
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 mb-3">
                  Current Squad Members ({membersCount}/{project.team_size})
                </h3>
                <div className="space-y-3">
                  {project.members?.map((m) => (
                    <div
                      key={m.user_id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
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
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                          </p>
                          <p className="text-[11px] text-slate-500">{m.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: Join Request / Squad CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Matchmaking Active</span>
                </div>
                <h3 className="text-lg font-bold">Find Matched Teammates</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  Our algorithm scans verified Karnataka students with matching skill sets (Python, ML, React, IoT) and ranks candidates by compatibility score.
                </p>
                <button
                  onClick={() => setActiveTab("matcher")}
                  className="w-full py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-indigo-50 transition-all"
                >
                  <span>Open AI Teammate Matcher →</span>
                </button>
              </div>

              {!isMember && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Apply to Join Squad</h3>
                  {requestSent ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Application Submitted!
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        The squad lead will review your profile and respond via notifications.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestJoin} className="space-y-3">
                      <textarea
                        rows={3}
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        placeholder="Explain your relevant skills (e.g. PyTorch, Next.js, IoT) and what you'd like to build..."
                        required
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Squad Application</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI TEAMMATE MATCHER (Blueprint Sheet 2 Screen 2) */}
        {activeTab === "matcher" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Smart Teammate Matcher</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Find the right teammates using AI
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Matching verified students across Karnataka colleges against required skills:{" "}
                <span className="font-semibold text-slate-900">Python, ML, React, IoT</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidateTeammates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-400 shadow-card hover:shadow-lg transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 overflow-hidden shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cand.avatar} alt={cand.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900">{cand.name}</h3>
                          <BadgeCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-[11px] text-slate-500">{cand.college}</p>
                        <p className="text-[11px] text-slate-600 font-medium">{cand.branch}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        {cand.matchRate}% Match
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Matched Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                    💡 <span className="font-medium">{cand.reason}</span>
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Verified Karnataka Student</span>
                    {invitedStudents[cand.id] ? (
                      <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Invited</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInviteCandidate(cand.name, cand.id)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite to Squad</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TASK BOARD (KANBAN WORKSPACE - Blueprint Sheet 2 Screen 3) */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Sprint Task Board
                </h2>
                <p className="text-xs text-slate-500">
                  Agile workflow board for AI Waste Sorting System squad milestones
                </p>
              </div>

              <button
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sprint Task</span>
              </button>
            </div>

            {/* Modal to add task */}
            {showAddTask && (
              <div className="bg-white p-5 rounded-3xl border-2 border-indigo-200 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Create Sprint Task</h3>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Integrate ESP32 telemetry with FastAPI backend"
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description & Acceptance Criteria
                    </label>
                    <textarea
                      rows={2}
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Provide context or testing details..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assignee
                      </label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Teju B.M.">Teju B.M. (Lead)</option>
                        <option value="Swasthik S.">Swasthik S. (ML)</option>
                        <option value="Swarna N.">Swarna N. (Frontend)</option>
                        <option value="Kavya Nair">Kavya Nair (Hardware)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3 Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* 1. TO DO */}
              <div className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      To Do
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 border border-slate-200">
                    {todoTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {todoTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            t.priority === "High"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                        <button
                          onClick={() => handleMoveTask(t.id, "in_progress")}
                          className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          Start →
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium text-slate-700">{t.assignee}</span>
                        <span>Sprint 1</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. IN PROGRESS */}
              <div className="bg-indigo-50/50 rounded-3xl p-4 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                      In Progress
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-indigo-700 border border-indigo-200">
                    {inProgressTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {inProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl p-4 border-2 border-indigo-200/80 shadow-sm space-y-2.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            t.priority === "High"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMoveTask(t.id, "todo")}
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={() => handleMoveTask(t.id, "done")}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                          >
                            Done ✓
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium text-indigo-700">{t.assignee}</span>
                        <span className="text-indigo-500 font-semibold">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. DONE */}
              <div className="bg-emerald-50/40 rounded-3xl p-4 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                      Done
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200">
                    {doneTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {doneTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl p-4 border border-emerald-100/80 shadow-sm space-y-2.5 opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Complete
                        </span>
                        <button
                          onClick={() => handleMoveTask(t.id, "in_progress")}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                        >
                          ← Reopen
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-through decoration-slate-400">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium text-slate-600">{t.assignee}</span>
                        <span className="text-emerald-600 font-bold">Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FILES & RESOURCES */}
        {activeTab === "files" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Project Files & Datasets</h3>
                <p className="text-xs text-slate-500">Shared specifications, dataset downloads, and pitch decks</p>
              </div>
              <button
                onClick={() => alert("Upload dialog opened. Max file size: 50MB.")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    ZIP
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">cafeteria-waste-dataset-v1.zip</p>
                    <p className="text-[11px] text-slate-500">4,200 annotated images • 340 MB • Uploaded by Swasthik S.</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Downloading cafeteria-waste-dataset-v1.zip...")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold"
                >
                  Download
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">SIH_2026_Idea_Submission_Deck.pdf</p>
                    <p className="text-[11px] text-slate-500">12 Slides • Problem statement, architecture & ROI • Uploaded by Teju B.M.</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Downloading SIH_2026_Idea_Submission_Deck.pdf...")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold"
                >
                  Download
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    CAD
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">waste-flipper-servo-mount.stl</p>
                    <p className="text-[11px] text-slate-500">3D printable bracket for servo motor • Uploaded by Naveen P.</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Downloading waste-flipper-servo-mount.stl...")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GITHUB INTEGRATION */}
        {activeTab === "github" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Swasthik182007 / CampusConnect
                  </h3>
                  <p className="text-xs text-slate-500">Connected repository • Branch: main</p>
                </div>
              </div>
              <a
                href="https://github.com/Swasthik182007/CampusConnect"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition-all"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Squad Commits
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 font-mono">feat: implement AI teammate matching algorithm</p>
                    <p className="text-[11px] text-slate-400">Teju B.M. committed 2 hours ago</p>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #a8f9c12
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 font-mono">model: train MobileNetV3 edge classifier with 94.2% val acc</p>
                    <p className="text-[11px] text-slate-400">Swasthik S. committed 5 hours ago</p>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #4b8e21a
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 font-mono">ui: complete task board kanban workflow with drag status</p>
                    <p className="text-[11px] text-slate-400">Swarna N. committed yesterday</p>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #9df30cb
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="project"
        targetId={project.id}
        targetTitle={project.title}
      />
    </AppShell>
  );
}
