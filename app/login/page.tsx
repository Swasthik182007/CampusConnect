"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isSafeRedirect } from "@/lib/auth-utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  // Role toggle: default is student, persisted in URL as ?as=admin
  const initialMode = searchParams.get("as") === "admin" ? "admin" : "student";
  const [roleMode, setRoleMode] = useState<"student" | "admin">(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync with URL query parameter changes
  useEffect(() => {
    const asParam = searchParams.get("as");
    if (asParam === "admin" && roleMode !== "admin") {
      setRoleMode("admin");
    } else if (asParam !== "admin" && roleMode === "admin") {
      setRoleMode("student");
    }
  }, [searchParams]);

  const handleRoleSwitch = (mode: "student" | "admin") => {
    setRoleMode(mode);
    setError(null);
    const params = new URLSearchParams(window.location.search);
    if (mode === "admin") {
      params.set("as", "admin");
    } else {
      params.delete("as");
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentMode: "student" | "admin") => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const nextMode = currentMode === "student" ? "admin" : "student";
      handleRoleSwitch(nextMode);
      setTimeout(() => {
        document.getElementById(`role-${nextMode}`)?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, roleMode);
      if (res.success) {
        const nextParam = searchParams.get("next");
        if (res.role === "admin" || res.role === "moderator") {
          router.push(isSafeRedirect(nextParam, res.role));
        } else {
          if (res.onboarding_completed === false) {
            router.push("/onboarding");
          } else {
            router.push(isSafeRedirect(nextParam, "student"));
          }
        }
      } else {
        setError(res.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = roleMode === "admin";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC]">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors duration-150 ${
                isAdmin ? "bg-[#3730A3] shadow-indigo-900/30" : "bg-indigo-600 shadow-indigo-600/30"
              }`}
            >
              {isAdmin ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              CampusConnect
            </span>
          </Link>
        </div>

        {/* Center Card */}
        <div className="max-w-md w-full mx-auto my-8">
          {/* Segmented Role Toggle at the Top of the Login Card */}
          <div className="mb-6">
            <div
              role="tablist"
              aria-label="Login Role"
              className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 gap-1"
            >
              <button
                type="button"
                role="tab"
                id="role-student"
                aria-selected={roleMode === "student"}
                aria-pressed={roleMode === "student"}
                tabIndex={roleMode === "student" ? 0 : -1}
                onClick={() => handleRoleSwitch("student")}
                onKeyDown={(e) => handleKeyDown(e, "student")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  roleMode === "student"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                role="tab"
                id="role-admin"
                aria-selected={roleMode === "admin"}
                aria-pressed={roleMode === "admin"}
                tabIndex={roleMode === "admin" ? 0 : -1}
                onClick={() => handleRoleSwitch("admin")}
                onKeyDown={(e) => handleKeyDown(e, "admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  roleMode === "admin"
                    ? "bg-[#3730A3] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Student Mode: Login / Sign Up Navigation Tabs */}
          {!isAdmin && (
            <div className="flex border-b border-slate-200 mb-6 transition-all duration-150">
              <button
                type="button"
                className="pb-2.5 px-4 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 focus:outline-none"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="pb-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Heading with 150ms smooth transition */}
          <div className="mb-6 transition-all duration-150">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${
                isAdmin
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Privileged Access Control
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Verified Karnataka Student Portal
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAdmin ? "Admin Portal" : "Welcome back"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isAdmin
                ? "Authorized administrators and moderators only."
                : "Enter your college email address or USN to access your campus dashboard."}
            </p>
          </div>

          {/* Quick 1-Click Demo Profiles Bar */}
          <div className="mb-5 p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                1-Click Demo Profiles (Team Code Quest)
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleRoleSwitch("student");
                  setEmail("teju.b@vvce.ac.in");
                  setPassword("DemoStudent@2025");
                }}
                className="p-2 rounded-xl bg-white border border-indigo-200 text-left hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                  <span>Teju B.M.</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 font-bold">Student</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate">VVCE • CSE Year 1</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRoleSwitch("student");
                  setEmail("swarna.n@vvce.ac.in");
                  setPassword("DemoTutor@2025");
                }}
                className="p-2 rounded-xl bg-white border border-indigo-200 text-left hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                  <span>Swarna N.</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">Top Tutor</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate">VVCE • 9.6 CGPA</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRoleSwitch("student");
                  setEmail("swasthik.s@vvce.ac.in");
                  setPassword("DemoStudent@2025");
                }}
                className="p-2 rounded-xl bg-white border border-indigo-200 text-left hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                  <span>Swasthik S.</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">AI / ML</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate">VVCE • ML Squad</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRoleSwitch("admin");
                  setEmail("demo-admin@vvce.ac.in");
                  setPassword("DemoAdmin@2025");
                }}
                className="p-2 rounded-xl bg-white border border-purple-200 text-left hover:border-purple-500 hover:shadow-sm transition-all cursor-pointer group"
              >
                <p className="text-[11px] font-bold text-purple-950 group-hover:text-purple-700 flex items-center justify-between">
                  <span>Prof. Anitha</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold">Admin</span>
                </p>
                <p className="text-[10px] text-purple-600 truncate">VVCE Faculty</p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isAdmin ? "Admin Email (.ac.in / .edu.in)" : "College Email or USN (.ac.in / .edu.in)"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={isAdmin ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? "e.g. admin@vvce.ac.in" : "e.g. yourname@vvce.ac.in or 4VV21CS042"}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset instructions sent to your institutional email.");
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-slate-600">
                Remember me on this campus device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all duration-150 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 ${
                isAdmin
                  ? "bg-[#3730A3] hover:bg-[#2E2888] shadow-indigo-950/25"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"
              }`}
            >
              {loading
                ? "Authenticating..."
                : isAdmin
                ? "Sign In to Admin Portal"
                : "Sign In to CampusConnect"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Student Mode Only: Google OAuth & Sign Up Options */}
          {!isAdmin && (
            <div className="transition-all duration-150">
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#F8FAFC] px-2 text-slate-400">or sign in with</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google (Campus SSO)</span>
                </button>

                <Link
                  href="/signup"
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Continue with College Email</span>
                </Link>
              </div>

              <p className="text-center text-xs text-slate-500 mt-6">
                New here?{" "}
                <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-800">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400">
          CampusConnect Karnataka • {isAdmin ? "Admin Security Monitoring Active" : "Row-Level Security Protected"}
        </div>
      </div>

      {/* Right Column: Campus Image Panel with Dynamic Tint & Overlay Text */}
      <div
        className={`hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden transition-all duration-150 ${
          isAdmin
            ? "bg-gradient-to-br from-[#0B0F19] via-[#1E1B4B] to-[#1E1B4B]"
            : "bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-indigo-950"
        }`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${
            isAdmin
              ? "bg-[radial-gradient(circle_at_top_right,rgba(55,48,163,0.35),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.25),transparent_50%)]"
          }`}
        />

        <div className="relative z-10 flex justify-end">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm border border-white/10">
            {isAdmin ? "Admin Operations Console" : "Karnataka Collegiate Hub"}
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isAdmin
                ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                : "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
            }`}
          >
            {isAdmin ? (
              <>
                <Shield className="w-4 h-4 text-amber-400" />
                Moderation & Safety Center
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Student Safety
              </>
            )}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            {isAdmin
              ? "Manage CampusConnect. Keep the community safe."
              : '"CampusConnect made finding seniors for DSA prep and buying semester notes effortless."'}
          </h2>

          {!isAdmin ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-400/20 border border-indigo-300/40 flex items-center justify-center font-bold text-sm">
                RK
              </div>
              <div>
                <p className="text-sm font-semibold">Rohan Kumar</p>
                <p className="text-xs text-slate-400">4th Year ISE • RVCE Bengaluru</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center font-bold text-sm text-amber-200">
                ADM
              </div>
              <div>
                <p className="text-sm font-semibold">CampusConnect Oversight</p>
                <p className="text-xs text-slate-400">Audit logs & safety enforcement enabled</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-6">
          <span>Supported: VVCE • RVCE • BMSCE • MSRIT • PESU • NITK</span>
          <span>{isAdmin ? "Admin Audit Log Active" : "End-to-End Encrypted"}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
