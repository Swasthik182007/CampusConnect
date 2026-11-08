"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Send,
  X,
  BadgeCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

interface OpportunityItem {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Job" | "Research";
  city: "Bengaluru" | "Mysuru" | "Hubballi" | "Remote";
  stipend: string;
  deadline: string;
  description: string;
  requiredSkills: string[];
  logo: string;
  verifiedSponsor: boolean;
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<"All" | "Internship" | "Job" | "Research">("All");
  const [search, setSearch] = useState("");
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicantNote, setApplicantNote] = useState("");

  const opportunities: OpportunityItem[] = [
    {
      id: "opp-1",
      title: "AI / ML Engineering Intern",
      company: "Infosys",
      type: "Internship",
      city: "Bengaluru",
      stipend: "₹25,000 / month",
      deadline: "30 Nov 2025",
      description:
        "Join Infosys AI Labs at Electronic City, Bengaluru. Work on computer vision, fine-tuning large language models, and developing automated document intelligence pipelines.",
      requiredSkills: ["Python", "Machine Learning", "PyTorch", "FastAPI"],
      logo: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=128&q=80",
      verifiedSponsor: true,
    },
    {
      id: "opp-2",
      title: "Software Development Engineer (SDE) Intern",
      company: "Bosch",
      type: "Internship",
      city: "Mysuru",
      stipend: "₹20,000 / month",
      deadline: "15 Dec 2025",
      description:
        "Bosch Global Software Technologies (BGSW) Mysuru campus is hiring student interns for vehicle infotainment and IoT telemetry dashboard microservices.",
      requiredSkills: ["C++", "Python", "React", "Linux"],
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&q=80",
      verifiedSponsor: true,
    },
    {
      id: "opp-3",
      title: "Graduate Research Fellow - AgriTech & IoT",
      company: "VTU & IISc Innovation Center",
      type: "Research",
      city: "Bengaluru",
      stipend: "₹30,000 / month",
      deadline: "20 Dec 2025",
      description:
        "Funded research fellowship investigating drone multispectral crop health classification and edge computing for smallholder Karnataka farmers.",
      requiredSkills: ["Python", "TensorFlow", "Computer Vision", "Research Paper Writing"],
      logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=128&q=80",
      verifiedSponsor: true,
    },
    {
      id: "opp-4",
      title: "Full Stack Engineer Intern",
      company: "Razorpay",
      type: "Internship",
      city: "Bengaluru",
      stipend: "₹35,000 / month",
      deadline: "10 Dec 2025",
      description:
        "Work directly on payment checkout UX, high-throughput Webhooks, and merchant onboarding dashboards using Next.js and Go.",
      requiredSkills: ["Next.js", "React", "TypeScript", "PostgreSQL"],
      logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&q=80",
      verifiedSponsor: true,
    },
    {
      id: "opp-5",
      title: "Embedded Systems & Edge Firmware Trainee",
      company: "L&T Technology Services",
      type: "Internship",
      city: "Mysuru",
      stipend: "₹22,000 / month",
      deadline: "25 Dec 2025",
      description:
        "Develop firmware on ARM Cortex-M and ESP32 microcontrollers for smart energy meters and industrial sensor nodes at LTTS Hebbal, Mysuru.",
      requiredSkills: ["Embedded C", "Microcontrollers", "RTOS", "Hardware"],
      logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=128&q=80",
      verifiedSponsor: true,
    },
    {
      id: "opp-6",
      title: "Cloud Operations & Site Reliability Engineer",
      company: "Wipro Technologies",
      type: "Job",
      city: "Bengaluru",
      stipend: "₹6.5 LPA (Full Time)",
      deadline: "18 Jan 2026",
      description:
        "Campus graduate engineering recruitment for Cloud Infrastructure, Terraform scripting, Kubernetes cluster management, and Azure cloud solutions.",
      requiredSkills: ["Linux", "Docker", "AWS", "Bash", "Networking"],
      logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&q=80",
      verifiedSponsor: true,
    },
  ];

  const filteredOpps = opportunities.filter((o) => {
    if (activeType !== "All" && o.type !== activeType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        o.title.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenApply = (opp: OpportunityItem) => {
    setSelectedOpp(opp);
    setApplicantNote(`Hi ${opp.company} team, I am ${user?.full_name || "Teju B.M."}, an engineering student at ${user?.college?.name || "VVCE Mysuru"}. My verified skills include ${user?.skills?.slice(0, 3).join(", ") || "Python, ML, React"}.`);
    setApplyModalOpen(true);
  };

  const handleConfirmApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setAppliedIds((prev) => ({ ...prev, [selectedOpp.id]: true }));
    setApplyModalOpen(false);
    alert(`Application successfully submitted to ${selectedOpp.company} for "${selectedOpp.title}"! Your verified student profile and ATS resume were attached.`);
  };

  return (
    <AppShell
      title="Internship & Job Opportunities 💼"
      subtitle="Exclusive campus recruitment & research openings across Karnataka tech hubs"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Karnataka Innovation Network Placement Board</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Opportunities: Internships • Jobs • Research
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Verified hiring partnerships for Karnataka engineering students at Infosys, Bosch, Razorpay, LTTS, and premier research labs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/resume-builder"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                1-Click ATS Resume Builder →
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Matching Blueprint Sheet 2 Screen 7 Filter Chips: All, Internship, Job, Research */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto">
            {(["All", "Internship", "Job", "Research"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeType === type
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company (Infosys, Bosch), city (Bengaluru, Mysuru), or skill..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-400 shadow-card hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opp.logo} alt={opp.company} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                          {opp.company}
                        </span>
                        {opp.verifiedSponsor && (
                          <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {opp.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                      opp.type === "Internship"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : opp.type === "Job"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {opp.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.city}, Karnataka</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{opp.stipend}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Deadline: {opp.deadline}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {opp.description}
                </p>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Required Tech Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Verified Campus Sponsor</span>
                {appliedIds[opp.id] ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Applied ✓</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenApply(opp)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
                  >
                    <span>Apply Now →</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Application Modal */}
        {applyModalOpen && selectedOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {selectedOpp.company} • {selectedOpp.type}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Apply for {selectedOpp.title}
                  </h3>
                </div>
                <button
                  onClick={() => setApplyModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Credentials Automatically Attached:</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  • Name: {user?.full_name || "Teju B.M."} (USN: {user?.usn || "4VV24CS001"})
                </p>
                <p className="text-[11px] text-slate-600">
                  • College: {user?.college?.name || "VVCE Mysuru"} ({user?.branch || "CSE"})
                </p>
                <p className="text-[11px] text-slate-600">
                  • CampusConnect Verified Resume & Innovation Karma attached
                </p>
              </div>

              <form onSubmit={handleConfirmApply} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cover Note to Recruiter
                  </label>
                  <textarea
                    rows={4}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verified Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

