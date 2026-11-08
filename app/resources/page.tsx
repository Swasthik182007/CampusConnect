"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Star,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Database,
  Code2,
  FolderArchive,
  Layers,
  X,
  BadgeCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

interface ResourceItem {
  id: string;
  title: string;
  category: "Study Notes" | "Question Papers" | "Datasets" | "Lab Manuals" | "Tutorials" | "Code Snippets" | "Project Kits";
  branch: string;
  semester: string;
  fileType: string;
  fileSize: string;
  downloads: number;
  rating: number;
  author: string;
  college: string;
  description: string;
}

export default function ResourceHubPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ResourceItem["category"]>("Study Notes");
  const [newBranch, setNewBranch] = useState("Computer Science");
  const [newSemester, setNewSemester] = useState("3rd Sem");
  const [newDesc, setNewDesc] = useState("");

  const [resources, setResources] = useState<ResourceItem[]>([
    {
      id: "res-1",
      title: "VTU 3rd Sem Data Structures in C (Complete Notes + Algorithms)",
      category: "Study Notes",
      branch: "Computer Science",
      semester: "3rd Sem",
      fileType: "PDF",
      fileSize: "14.2 MB",
      downloads: 1420,
      rating: 4.9,
      author: "Swarna N. (Topper, 9.6 CGPA)",
      college: "VVCE Mysuru",
      description: "Handwritten and typed comprehensive notes covering Stacks, Queues, Linked Lists, Trees, Graphs, and Hashing with handwritten diagrams.",
    },
    {
      id: "res-2",
      title: "VTU Solved Model Question Papers (2021 - 2024 Scheme) - Design & Analysis of Algorithms",
      category: "Question Papers",
      branch: "Computer Science",
      semester: "4th Sem",
      fileType: "PDF",
      fileSize: "8.6 MB",
      downloads: 980,
      rating: 4.8,
      author: "Teju B.M.",
      college: "VVCE Mysuru",
      description: "Step-by-step solved 5 years VTU exam papers with recurrence relations, Master theorem solutions, and dynamic programming tables.",
    },
    {
      id: "res-3",
      title: "Karnataka Agricultural Soil & Crop Blight Dataset",
      category: "Datasets",
      branch: "All Branches",
      semester: "All",
      fileType: "CSV / ZIP",
      fileSize: "280 MB",
      downloads: 640,
      rating: 4.9,
      author: "Swasthik S.",
      college: "VVCE Mysuru",
      description: "6,500 annotated multi-spectral leaf images across Mandya and Mysuru agricultural zones for CNN training in hackathons.",
    },
    {
      id: "res-4",
      title: "VTU Microcontroller & Embedded Systems Official Lab Manual",
      category: "Lab Manuals",
      branch: "ECE / CSE",
      semester: "4th Sem",
      fileType: "PDF",
      fileSize: "6.1 MB",
      downloads: 810,
      rating: 4.7,
      author: "Kavya Nair",
      college: "VVCE Mysuru",
      description: "Assembly language code and Keil uVision simulation screenshots with external viva questions and answers.",
    },
    {
      id: "res-5",
      title: "Smart India Hackathon (SIH) High-Scoring Project Pitch Template",
      category: "Project Kits",
      branch: "All Branches",
      semester: "All",
      fileType: "PPTX",
      fileSize: "12.4 MB",
      downloads: 1850,
      rating: 5.0,
      author: "CampusConnect Innovation Cell",
      college: "Karnataka Innovation Network",
      description: "Official 12-slide template proven to score top marks in jury rounds, including architecture diagrams, feasibility, and state impact.",
    },
    {
      id: "res-6",
      title: "FastAPI + Supabase Auth Production Starter Boilerplate",
      category: "Code Snippets",
      branch: "Computer Science",
      semester: "All",
      fileType: "ZIP",
      fileSize: "3.2 MB",
      downloads: 520,
      rating: 4.8,
      author: "Aditya Somayaji",
      college: "RVCE Bengaluru",
      description: "Clean architecture Python FastAPI repo with JWT validation, CORS, PostgreSQL async drivers, and Dockerfile.",
    },
  ]);

  const categories = [
    "All",
    "Study Notes",
    "Question Papers",
    "Datasets",
    "Lab Manuals",
    "Tutorials",
    "Code Snippets",
    "Project Kits",
  ];

  const filtered = resources.filter((r) => {
    if (activeCategory !== "All" && r.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleDownload = (res: ResourceItem) => {
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, downloads: r.downloads + 1 } : r))
    );
    alert(`Downloading "${res.title}" (${res.fileSize})...`);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: ResourceItem = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      branch: newBranch,
      semester: newSemester,
      fileType: "PDF",
      fileSize: "5.4 MB",
      downloads: 1,
      rating: 5.0,
      author: `${user?.full_name || "Teju B.M."}`,
      college: user?.college?.name || "VVCE Mysuru",
      description: newDesc.trim() || "Uploaded by verified Karnataka student.",
    };

    setResources((prev) => [item, ...prev]);
    setUploadModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    alert("Resource uploaded and published to all Karnataka partner colleges!");
  };

  return (
    <AppShell
      title="Smart Campus Resource Sharing 📚"
      subtitle="Peer-curated VTU study notes, question papers, datasets, and project kits"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-700/40 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Zero-Cost Open Academic Exchange</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Resource Hub: Notes • Papers • Datasets
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                High-quality academic materials shared by toppers and rank holders across VVCE, RVCE, BMSCE, and MSRIT.
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Share Study Material</span>
            </button>
          </div>
        </div>

        {/* Categories Carousel & Search */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic (Data Structures, DAA, SIH Pitch, Keil, Datasets) or author..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Resources Cards Grid (Matching Blueprint Sheet 2 Screen 9) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-indigo-400 shadow-card hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                    {res.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{res.rating}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100">{res.branch}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100">{res.semester}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{res.fileType}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[150px]">By {res.author}</span>
                  <span>{res.downloads.toLocaleString()} DLs</span>
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resource ({res.fileSize})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Resource Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Share Study Material
                </h3>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. VTU 5th Sem Computer Networks Full Question Bank"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={newSemester}
                      onChange={(e) => setNewSemester(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="1st Sem">1st Sem</option>
                      <option value="2nd Sem">2nd Sem</option>
                      <option value="3rd Sem">3rd Sem</option>
                      <option value="4th Sem">4th Sem</option>
                      <option value="5th Sem">5th Sem</option>
                      <option value="6th Sem">6th Sem</option>
                      <option value="7th/8th Sem">7th / 8th Sem</option>
                      <option value="All">All Semesters</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Briefly describe what chapters or solved problems are included..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-1">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Drop your PDF, ZIP or PPTX file here</p>
                  <p className="text-[10px] text-slate-500">Max file size: 50 MB</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
                  >
                    Publish to Campus Hub
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

