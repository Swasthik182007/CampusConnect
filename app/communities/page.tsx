"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  PlusCircle,
  Globe,
  Code2,
  Cpu,
  GraduationCap,
  Palette,
  Sparkles,
  Briefcase,
  Trophy,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { CommunityCategory, Community } from "@/lib/types";

const CATEGORIES: ("All" | CommunityCategory)[] = [
  "All",
  "Tech",
  "Academics",
  "Clubs",
  "Cultural",
  "Career",
  "Sports",
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-5 h-5 text-indigo-600" />,
  Globe: <Globe className="w-5 h-5 text-indigo-600" />,
  Cpu: <Cpu className="w-5 h-5 text-indigo-600" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-indigo-600" />,
  Palette: <Palette className="w-5 h-5 text-indigo-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-indigo-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-indigo-600" />,
  Trophy: <Trophy className="w-5 h-5 text-indigo-600" />,
};

export default function CommunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | CommunityCategory>("All");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal fields
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState<CommunityCategory>("Tech");

  const communities = dataStore.getCommunities();

  const handleToggleJoin = (cId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dataStore.toggleCommunityMembership(cId);
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    dataStore.createCommunity({
      name: newName,
      description: newDesc,
      category: newCat,
      icon_url: "Globe",
    });

    setNewName("");
    setNewDesc("");
    setShowCreateModal(false);
  };

  const filteredCommunities = communities.filter((c) => {
    if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <AppShell
      title="Student Communities & Guilds"
      subtitle="Connect across VTU, RVCE, BMSCE, VVCE, PES, and NITK student networks"
    >
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coding clubs, GATE study groups, cultural societies..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Community Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((comm) => (
            <div
              key={comm.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-card card-hover-lift p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {comm.icon_url && ICON_MAP[comm.icon_url] ? (
                      ICON_MAP[comm.icon_url]
                    ) : (
                      <Users className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {comm.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {comm.member_count?.toLocaleString()} student members
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {comm.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/communities/${comm.id}`}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-center block text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  View Feed →
                </Link>

                <button
                  onClick={(e) => handleToggleJoin(comm.id, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    comm.is_member
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  {comm.is_member ? "Joined ✓" : "+ Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Create a Student Community
            </h3>
            <p className="text-xs text-slate-500">
              Communities are open to all verified students across Karnataka colleges.
            </p>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. VTU Autonomous Coding Consortium"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as CommunityCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Tech">Tech</option>
                  <option value="Academics">Academics</option>
                  <option value="Clubs">Clubs</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Career">Career</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Description & Purpose *
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain what members can share, discuss, and build together..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
