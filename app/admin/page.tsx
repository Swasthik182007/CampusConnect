"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Users,
  School,
  Check,
  X,
  Trash2,
  Ban,
  Plus,
  BadgeCheck,
  UserCheck,
  Globe,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { removeListingAction } from "@/app/marketplace/actions";
import { formatDateTime } from "@/lib/utils";

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "reports" | "events" | "users" | "colleges"
  >("reports");

  // Client-side authentication and role guard
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login?as=admin&next=/admin");
      } else if (role !== "admin" && role !== "moderator") {
        router.replace("/dashboard");
      }
    }
  }, [user, role, isLoading, router]);

  const [newDomain, setNewDomain] = useState("");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeShort, setNewCollegeShort] = useState("");
  const [newCollegeCity, setNewCollegeCity] = useState("");

  const reports = dataStore.getReports();
  const events = dataStore.getEvents();
  const pendingEvents = events.filter((e) => e.status === "pending");
  const profiles = dataStore.getProfiles();
  const colleges = dataStore.getColleges();
  const allowedDomains = dataStore.getAllowedDomains();

  const handleResolveReport = async (
    reportId: string,
    action: "resolve" | "remove_content" | "suspend_user"
  ) => {
    const rep = reports.find((r) => r.id === reportId);
    if (rep && action === "remove_content" && rep.target_type === "listing") {
      await removeListingAction(
        rep.target_id,
        `Removed by moderator ${user?.full_name || "Admin"} following safety report`
      );
    }
    dataStore.resolveReport(reportId, action);
    dataStore.logAdminAudit(
      user?.id || "admin-system",
      `report_${action}`,
      { report_id: reportId, target_type: rep?.target_type, target_id: rep?.target_id }
    );
    alert(`Report marked as resolved with action: ${action}`);
  };

  const handleApproveEvent = (id: string) => {
    dataStore.approveEvent(id);
    alert("Event approved and published to all students!");
  };

  const handleRejectEvent = (id: string) => {
    dataStore.rejectEvent(id);
    alert("Event rejected.");
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    dataStore.addAllowedDomain(newDomain.trim());
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    if (confirm(`Remove domain ${domain} from accredited Karnataka allowlist?`)) {
      dataStore.removeAllowedDomain(domain);
    }
  };

  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName || !newCollegeShort || !newCollegeCity || !newDomain) return;

    dataStore.addCollege({
      id: `col-${Date.now()}`,
      name: newCollegeName,
      short_name: newCollegeShort,
      city: newCollegeCity,
      domain: newDomain.toLowerCase().trim(),
    });
    dataStore.addAllowedDomain(newDomain.toLowerCase().trim());

    setNewCollegeName("");
    setNewCollegeShort("");
    setNewCollegeCity("");
    setNewDomain("");
    alert("College and domain successfully added to accreditation registry!");
  };

  return (
    <AppShell
      title="Admin & Analytics Dashboard 🏛️"
      subtitle="State-level accreditation management, trust & safety reports, and innovation metrics"
    >
      <div className="space-y-6">
        {/* Metric Strip (Matching Blueprint Sheet 2 Screen 10) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <p className="text-3xl font-black text-indigo-700 mt-1 tabular-nums">
              12,480
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">↑ 18% this semester</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Colleges</span>
            <p className="text-3xl font-black text-emerald-600 mt-1 tabular-nums">
              42
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Across Karnataka</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <p className="text-3xl font-black text-amber-600 mt-1 tabular-nums">
              1,230
            </p>
            <span className="text-[10px] text-indigo-600 font-bold">SIH & Hackathon Squads</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Events & Fests</span>
            <p className="text-3xl font-black text-purple-600 mt-1 tabular-nums">
              98
            </p>
            <span className="text-[10px] text-slate-400 font-medium">State-Level Calendar</span>
          </div>
        </div>

        {/* Platform Engagement Visual Chart (Matching Blueprint Sheet 2 Screen 10) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Platform Engagement & Activity Trend
              </h3>
              <p className="text-xs text-slate-500">
                Weekly student peer transactions, hackathon team formations, and tutoring hours
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Active Student Engagement
              </span>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="relative h-44 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,95 C50,85 100,105 150,70 C200,35 250,60 300,40 C350,20 400,45 450,25 L500,10 L500,120 L0,120 Z"
                fill="url(#engagementGradient)"
              />
              <path
                d="M0,95 C50,85 100,105 150,70 C200,35 250,60 300,40 C350,20 400,45 450,25 L500,10"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Data points */}
              <circle cx="150" cy="70" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="300" cy="40" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="450" cy="25" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="10" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>Week 1 (Jul)</span>
              <span>Week 4 (Aug)</span>
              <span>Week 8 (Sep)</span>
              <span>Week 12 (Oct)</span>
              <span className="font-bold text-indigo-600">Peak (Nov 2025)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "reports" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Safety Reports ({reports.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "events" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Event Approvals ({pendingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "users" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Student Roster ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab("colleges")}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "colleges" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Allowed Domains & Colleges ({allowedDomains.length})
          </button>
        </div>

        {/* Tab 1: Reports Queue */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Community Moderation & Safety Reports Queue
            </h3>
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {rep.target_type}
                      </span>
                      <span className="font-bold text-slate-900">{rep.target_title || rep.target_id}</span>
                      <span className="text-slate-400">• {formatDateTime(rep.created_at)}</span>
                    </div>
                    <p className="text-slate-700">
                      <strong>Reason:</strong> {rep.reason}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Reported by: {rep.reporter?.full_name || "Verified Student"}
                    </p>
                  </div>

                  {rep.status === "pending" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, "resolve")}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, "remove_content")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 shadow-sm"
                      >
                        Remove Content
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, "suspend_user")}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                      >
                        Suspend User
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Resolved ({rep.action_taken || "action taken"})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Event Approvals */}
        {activeTab === "events" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Pending Campus Event Submissions
            </h3>
            {pendingEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                All submitted events have been reviewed. No pending approvals.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 text-xs max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{evt.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{evt.description}</p>
                      <p className="text-[11px] text-slate-500">
                        Venue: {evt.venue}, {evt.city} • Capacity: {evt.capacity} • Start: {formatDateTime(evt.start_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveEvent(evt.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Publish
                      </button>
                      <button
                        onClick={() => handleRejectEvent(evt.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Users List */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Verified Student Registry across Karnataka
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Email / USN</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.full_name}</td>
                      <td className="py-3 px-4">{p.college?.short_name || "VVCE"}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.email} <br />
                        <span className="text-[10px] text-slate-400">{p.usn}</span>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold">{p.role}</td>
                      <td className="py-3 px-4">
                        {p.is_suspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Verified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            dataStore.updateProfile({ is_suspended: !p.is_suspended });
                            alert(p.is_suspended ? "User reinstated" : "User suspended");
                          }}
                          className={`text-xs font-bold ${
                            p.is_suspended ? "text-emerald-600" : "text-rose-600"
                          } hover:underline`}
                        >
                          {p.is_suspended ? "Reinstate" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Colleges and Allowed Email Domains */}
        {activeTab === "colleges" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
              <h3 className="font-bold text-base text-slate-900">
                Accredited Karnataka College Email Domains Allowlist
              </h3>
              <p className="text-xs text-slate-500">
                Sign-up endpoints automatically reject any email addresses outside this approved domain registry.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {allowedDomains.map((dom) => (
                  <div
                    key={dom}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 flex items-center gap-2"
                  >
                    <span>@{dom}</span>
                    <button
                      onClick={() => handleRemoveDomain(dom)}
                      className="text-indigo-400 hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Domain Form */}
              <form onSubmit={handleAddDomain} className="flex gap-2 pt-4 border-t border-slate-100 max-w-md">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. sjce.ac.in or kle.edu.in"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  + Add Domain
                </button>
              </form>
            </div>

            {/* Add New College Registry Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
              <h3 className="font-bold text-base text-slate-900">
                Register New Karnataka College
              </h3>
              <form onSubmit={handleAddCollege} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  placeholder="Full College Name"
                  required
                  className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  value={newCollegeShort}
                  onChange={(e) => setNewCollegeShort(e.target.value)}
                  placeholder="Short Acronym (e.g. SJCE)"
                  required
                  className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white uppercase"
                />
                <input
                  type="text"
                  value={newCollegeCity}
                  onChange={(e) => setNewCollegeCity(e.target.value)}
                  placeholder="City (e.g. Mysuru)"
                  required
                  className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Register College
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
