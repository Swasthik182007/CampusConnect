"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  BadgeCheck,
  Building2,
  Mail,
  Phone,
  FolderGit2,
  Award,
  Layers,
  GraduationCap,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";

export default function AIResumeBuilderPage() {
  const { user } = useAuth();
  const [includePhone, setIncludePhone] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<"ats" | "modern">("ats");
  const [copied, setCopied] = useState(false);

  const fullName = user?.full_name || "Teju B.M.";
  const collegeName = user?.college?.name || "Vidyavardhaka College of Engineering, Mysuru";
  const branch = user?.branch || "Computer Science & Engineering";
  const usn = user?.usn || "4VV24CS001";
  const email = user?.email || "teju.b@vvce.ac.in";
  const phone = user?.phone || "+91 98450 12345";
  const skills = user?.skills?.length ? user.skills : ["Java", "Python", "ML", "Web Dev", "PostgreSQL", "React"];

  const projects = [
    {
      title: "AI-based Waste Sorting & Recycling System",
      tech: "Python, PyTorch, YOLOv8, Raspberry Pi, React",
      period: "2025",
      points: [
        "Architected edge computer vision classifier for campus cafeteria waste segregation with 94.2% accuracy.",
        "Built real-time student gamification dashboard using React & Tailwind, increasing recycling compliance by 40%.",
        "Shortlisted as SIH 2026 preliminary finalist across Karnataka engineering institutions.",
      ],
    },
    {
      title: "KrishiMitra AI - Smart Agricultural Advisory",
      tech: "Python, TensorFlow, FastAPI, React, MongoDB",
      period: "2025",
      points: [
        "Implemented MobileNet leaf disease recognition for sugarcane and paddy crops in Karnataka farming districts.",
        "Integrated real-time APMC Mandi pricing APIs and weather forecasting microservice in Kannada.",
      ],
    },
  ];

  const achievements = [
    "Winner - VVCE Annual Student Hackathon 2025 (1st Place out of 45 teams)",
    "Karnataka Innovation Network Verified Peer Contributor",
    "Completed 3 Collaborative Multi-College Engineering Squad Projects",
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textResume = `
=========================================
${fullName.toUpperCase()}
USN: ${usn} | ${branch}
${collegeName}
Email: ${email} | Phone: ${phone}
=========================================

EDUCATION:
- B.E. in ${branch}
  ${collegeName} (VTU Affiliated)
  Academic Year: 2024 - 2028

TECHNICAL SKILLS:
${skills.join(", ")}

FEATURED PROJECTS:
${projects.map((p) => `* ${p.title} (${p.tech})\n  ${p.points.join("\n  ")}`).join("\n\n")}

HONORS & ACHIEVEMENTS:
${achievements.map((a) => `- ${a}`).join("\n")}
=========================================
    `;
    navigator.clipboard.writeText(textResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="AI Resume Builder 📄"
      subtitle="Compile verified campus projects and credentials into an ATS-friendly resume"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-700/40 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Click Verified Student Resume</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ATS-Optimized Resume Generator
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                Automatically extracts your verified college credentials, hackathon squad achievements, and skills into a standardized resume proven to pass company ATS scanners.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={handleCopyText}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 border border-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Builder Controls & Live Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-5">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Resume Settings</h3>
              <p className="text-[11px] text-slate-500">Customize what appears on your export</p>
            </div>

            {/* ATS Score Indicator */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">ATS Compatibility</span>
                <span className="text-xs font-black text-emerald-700 px-2 py-0.5 rounded bg-emerald-100">
                  94 / 100
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "94%" }} />
              </div>
              <p className="text-[10px] text-emerald-800">
                Keyword density matches Karnataka Tier-1 campus placement guidelines.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Privacy & Contact Toggles
              </h4>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includeEmail}
                  onChange={(e) => setIncludeEmail(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>Include College Email ({email})</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includePhone}
                  onChange={(e) => setIncludePhone(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>Include Phone Number</span>
              </label>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Layout Styling
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedTemplate("ats")}
                  className={`p-2.5 rounded-xl border text-left font-bold ${
                    selectedTemplate === "ats"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ATS Standard
                </button>
                <button
                  onClick={() => setSelectedTemplate("modern")}
                  className={`p-2.5 rounded-xl border text-left font-bold ${
                    selectedTemplate === "modern"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Modern Tech
                </button>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download ATS Resume (PDF)</span>
            </button>
          </div>

          {/* Document Preview Column (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xl space-y-6 font-sans text-slate-900 print:p-0 print:border-none print:shadow-none">
            {/* Resume Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight uppercase">{fullName}</h2>
              <p className="text-xs text-slate-700 font-semibold">
                B.E. in {branch} • USN: {usn}
              </p>
              <p className="text-xs text-slate-600">
                {collegeName} • Mysuru, Karnataka
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 pt-1">
                {includeEmail && <span>Email: {email}</span>}
                {includePhone && <span>Phone: {phone}</span>}
                <span>CampusConnect Verified Student</span>
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Education
              </h3>
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold text-slate-900">{collegeName}</p>
                  <p className="text-slate-700">Bachelor of Engineering in {branch}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-800">2024 – 2028</p>
                  <p>VTU Belagavi, Karnataka</p>
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Technical Skills
              </h3>
              <div className="text-xs space-y-1">
                <p>
                  <strong className="font-bold">Programming & Core:</strong>{" "}
                  {skills.join(", ")}
                </p>
                <p>
                  <strong className="font-bold">Frameworks & Tools:</strong> Next.js, FastAPI, Git, GitHub, Docker, Linux, Supabase
                </p>
                <p>
                  <strong className="font-bold">Domains:</strong> Edge AI, Machine Learning, AgriTech, IoT, Full Stack Web Development
                </p>
              </div>
            </div>

            {/* Featured Projects */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Academic & Hackathon Projects
              </h3>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {proj.title} | <span className="font-normal italic text-slate-600">{proj.tech}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 shrink-0 ml-2">{proj.period}</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px] pl-1">
                    {proj.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Honors & Certifications */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Honors & Campus Achievements
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                {achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

