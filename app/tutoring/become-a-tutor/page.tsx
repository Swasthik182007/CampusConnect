"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { TutoringMode, TutorAvailability } from "@/lib/types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BecomeTutorPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [subjectsStr, setSubjectsStr] = useState("Data Structures & Algorithms, C++, Operating Systems");
  const [hourlyRate, setHourlyRate] = useState(400);
  const [mode, setMode] = useState<TutoringMode>("both");
  const [bio, setBio] = useState(
    "Senior VTU student with strong concepts in problem solving, algorithm design, and semester exam strategies."
  );
  const [availability, setAvailability] = useState<Omit<TutorAvailability, "id" | "tutor_id">[]>([
    { weekday: 1, start_time: "18:00", end_time: "20:00" },
    { weekday: 3, start_time: "18:00", end_time: "20:00" },
    { weekday: 6, start_time: "14:00", end_time: "18:00" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSlot = () => {
    setAvailability([...availability, { weekday: 2, start_time: "17:00", end_time: "19:00" }]);
  };

  const handleRemoveSlot = (idx: number) => {
    setAvailability(availability.filter((_, i) => i !== idx));
  };

  const handleUpdateSlot = (idx: number, field: string, val: any) => {
    const updated = [...availability];
    (updated[idx] as any)[field] = val;
    setAvailability(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio.trim() || !subjectsStr.trim()) {
      setError("Please fill in your bio and subjects.");
      return;
    }

    setLoading(true);
    const subjects = subjectsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      dataStore.becomeTutor({
        subjects,
        hourly_rate: hourlyRate,
        mode,
        bio,
        availability: availability.map((a, i) => ({
          ...a,
          id: `av-custom-${i}`,
          tutor_id: user?.id || "usr-demo-student",
        })),
      });

      alert("Tutor profile registered successfully!");
      router.push(`/tutoring/${user?.id}`);
    } catch {
      setError("Failed to register tutor profile.");
      setLoading(false);
    }
  };

  return (
    <AppShell title="Become a Peer Tutor" subtitle="Share your academic mastery and mentor fellow Karnataka students">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/tutoring"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tutors</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Peer Tutor Profile
              </h2>
              <p className="text-xs text-slate-500">
                Set your subjects, pricing, and weekly time slots.
              </p>
            </div>
          </div>

          {error && (
            <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Subjects You Teach (Comma separated) *
              </label>
              <input
                type="text"
                value={subjectsStr}
                onChange={(e) => setSubjectsStr(e.target.value)}
                placeholder="e.g. Data Structures, Engineering Mathematics M1/M2, Embedded C, Python"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Hourly Rate (₹ INR) *
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Teaching Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TutoringMode)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="both">Both (Online & Campus Offline)</option>
                  <option value="online">Online Only (Google Meet / Zoom)</option>
                  <option value="offline">Offline Only (Campus Library / Study Lab)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Bio & Academic Credentials *
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your academic performance, rank, GATE scores, hackathon wins, or placement accomplishments..."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400"
              />
            </div>

            {/* Availability Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Weekly Available Windows
                </label>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time Slot</span>
                </button>
              </div>

              <div className="space-y-2">
                {availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <select
                      value={slot.weekday}
                      onChange={(e) => handleUpdateSlot(idx, "weekday", Number(e.target.value))}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                    >
                      {WEEKDAYS.map((day, dIdx) => (
                        <option key={day} value={dIdx}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-400">from</span>
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleUpdateSlot(idx, "start_time", e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />

                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleUpdateSlot(idx, "end_time", e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />

                    {availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/tutoring"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? "Registering..." : "Publish Tutor Profile →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
