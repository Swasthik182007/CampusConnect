"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Users,
  Compass,
  Cpu,
  Layers,
  ChevronRight,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

interface RoleBenchmark {
  id: string;
  title: string;
  matchScore: number;
  marketDemand: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendedTutors: { name: string; subject: string; college: string; link: string }[];
  recommendedNotes: { title: string; category: string; link: string }[];
}

export default function SmartSkillPassportPage() {
  const { user } = useAuth();

  const userSkills = user?.skills?.length
    ? user.skills
    : ["Java", "Python", "ML", "React"];

  const roles: RoleBenchmark[] = [
    {
      id: "aiml",
      title: "AI / Machine Learning Engineer",
      matchScore: 78,
      marketDemand: "Very High in Bengaluru & Mysuru Tech Hubs",
      requiredSkills: ["Python", "ML", "PyTorch", "Generative AI", "Docker", "Cloud"],
      matchedSkills: ["Python", "ML"],
      missingSkills: ["Generative AI", "Cloud (AWS/GCP)", "Docker"],
      recommendedTutors: [
        {
          name: "Swasthik S.",
          subject: "PyTorch & Computer Vision",
          college: "VVCE Mysuru",
          link: "/tutoring",
        },
        {
          name: "Aditya Somayaji",
          subject: "Hugging Face & NLP Models",
          college: "RVCE Bengaluru",
          link: "/tutoring",
        },
      ],
      recommendedNotes: [
        {
          title: "Generative AI & LLM Fine-Tuning Guide (VTU Elective)",
          category: "Study Notes",
          link: "/resources",
        },
        {
          title: "Docker & Containerization for Campus Microservices",
          category: "Tutorials",
          link: "/resources",
        },
      ],
    },
    {
      id: "fullstack",
      title: "Full Stack Web Developer",
      matchScore: 85,
      marketDemand: "High (Razorpay, Swiggy, Bosch Hubs)",
      requiredSkills: ["React", "JavaScript", "TypeScript", "Node.js", "PostgreSQL", "Next.js"],
      matchedSkills: ["React", "Web Dev", "Java"],
      missingSkills: ["PostgreSQL", "Docker", "CI/CD"],
      recommendedTutors: [
        {
          name: "Swarna N.",
          subject: "React & Modern UI Architecture",
          college: "VVCE Mysuru",
          link: "/tutoring",
        },
      ],
      recommendedNotes: [
        {
          title: "Complete Next.js App Router Architecture Blueprint",
          category: "Code Snippets",
          link: "/resources",
        },
      ],
    },
    {
      id: "cloud-devops",
      title: "Cloud & DevOps Specialist",
      matchScore: 62,
      marketDemand: "Critical shortage across Karnataka IT firms",
      requiredSkills: ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "Python"],
      matchedSkills: ["Python"],
      missingSkills: ["Kubernetes", "AWS", "Terraform", "Linux"],
      recommendedTutors: [
        {
          name: "Rohan Kumar",
          subject: "Linux Systems & DevOps Automation",
          college: "RVCE Bengaluru",
          link: "/tutoring",
        },
      ],
      recommendedNotes: [
        {
          title: "VTU Cloud Computing & Virtualization Complete Notes",
          category: "Study Notes",
          link: "/resources",
        },
      ],
    },
  ];

  const [selectedRole, setSelectedRole] = useState<RoleBenchmark>(roles[0]);

  return (
    <AppShell
      title="Smart Skill Passport 🎯"
      subtitle="AI-driven competency benchmark against Karnataka industry hiring standards"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Student Competency Passport</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Skill Gap & Career Readiness Matrix
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Benchmarking your verified profile skills against 2025 Karnataka campus recruitment criteria at Infosys, Bosch, Wipro, and Tier-1 Bengaluru product teams.
              </p>
            </div>

            {/* Circular Gauge matching Blueprint Sheet 2 Screen 4 */}
            <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 shadow-inner">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/20"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-1000 ease-out"
                    strokeDasharray={`${selectedRole.matchScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{selectedRole.matchScore}%</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-200 mt-2">Skill Match Score</span>
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto text-xs font-bold">
            <span className="text-xs text-slate-400 font-semibold mr-1">Target Role:</span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedRole.id === r.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {r.title} ({r.matchScore}%)
              </button>
            ))}
          </div>
        </div>

        {/* Skills Breakdown Grid (Matching Blueprint Sheet 2 Screen 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Your Verified Skills */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900">Your Verified Skills</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {userSkills.length} Verified
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {userSkills.map((sk) => (
                <div
                  key={sk}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{sk}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Verified by CampusConnect Academic Network</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Skills are endorsed through completed hackathons, verified lab records, and peer tutoring evaluations.
              </p>
            </div>
          </div>

          {/* Right: Skill Gap & Recommended Upgrades */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Skill Gap (Recommended)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {selectedRole.missingSkills.length} To Unlock 100%
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedRole.missingSkills.map((gap) => (
                <div
                  key={gap}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Acquiring these {selectedRole.missingSkills.length} skills will raise your match score to{" "}
              <strong className="text-slate-900 font-bold">98%+</strong> for {selectedRole.title} opportunities.
            </p>

            {/* Fast-track Bridge Recommendations */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Ways to Close the Gap:
              </span>

              {selectedRole.recommendedTutors.map((tut, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">Book session with {tut.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {tut.subject} • {tut.college}
                    </p>
                  </div>
                  <Link
                    href={tut.link}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] shadow-sm hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Book 1-on-1
                  </Link>
                </div>
              ))}

              {selectedRole.recommendedNotes.map((note, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{note.title}</p>
                    <p className="text-[11px] text-slate-500">{note.category}</p>
                  </div>
                  <Link
                    href={note.link}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 whitespace-nowrap"
                  >
                    Read Notes
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

