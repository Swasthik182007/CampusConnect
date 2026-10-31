"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Hash,
  School,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";

export default function SignupPage() {
  const router = useRouter();
  const { signup, validateCollegeEmail } = useAuth();
  const colleges = dataStore.getColleges();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [usn, setUsn] = useState("");
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || "col-vvce");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [year, setYear] = useState(1);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-detect college if email domain matches
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val.includes("@")) {
      const check = validateCollegeEmail(val);
      if (check.isValid && check.college) {
        setCollegeId(check.college.id);
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate domain
    const val = validateCollegeEmail(email);
    if (!val.isValid) {
      setError(val.error || "Email domain is not recognized as an accredited Karnataka college.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        fullName,
        email,
        usn,
        collegeId,
        branch,
        year,
        password,
      });

      if (res.success) {
        router.push("/onboarding");
      } else {
        setError(res.error || "Registration failed.");
      }
    } catch {
      setError("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC]">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              CampusConnect
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strictly Verified Student Community
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create student account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join thousands of verified engineering and university students across Karnataka.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Darshan Gowda"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email (Must match accredited domain)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="e.g. student@vvce.ac.in, @rvce.edu.in, @nitk.edu.in"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Allowed: vvce.ac.in, rvce.edu.in, bmsce.ac.in, msrit.edu, pes.edu, nitk.edu.in
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University / College USN
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="e.g. 4VV21CS042"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                >
                  <option value={1}>1st Year (Fresher)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Pre-final)</option>
                  <option value={4}>4th Year (Final Year)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.short_name} • {c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engineering Branch / Stream
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science (AI & DS)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Registering & Verifying..." : "Create Account & Continue →"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          CampusConnect Karnataka • Row-Level Security Protected
        </div>
      </div>

      {/* Right Column: Campus Image Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-indigo-950 text-white relative overflow-hidden">
        <div className="relative z-10 flex justify-end">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm border border-white/10">
            Karnataka Collegiate Hub
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Verified Student Safety
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            "We formed our Smart India Hackathon squad with RVCE & BMSCE devs within 2 days on CampusConnect!"
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-400/20 border border-indigo-300/40 flex items-center justify-center font-bold text-sm">
              DG
            </div>
            <div>
              <p className="text-sm font-semibold">Darshan Gowda</p>
              <p className="text-xs text-slate-400">3rd Year CSE • VVCE Mysuru</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-6">
          <span>Supported: VVCE • RVCE • BMSCE • MSRIT • PESU • NITK</span>
          <span>Zero External Advertisers</span>
        </div>
      </div>
    </div>
  );
}
