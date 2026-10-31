"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  X,
  Plus,
  BookOpen,
  Users,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  HelpCircle,
} from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { createClient } from "@/lib/supabase/client";

// Zod validation schemas
const step1Schema = z.object({
  branch: z.string().min(2, "Please select your academic branch"),
  year: z.number().int().min(1).max(4, "Academic year must be between 1 and 4"),
  bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
});

const step2Schema = z.object({
  interests: z.array(z.string()).min(3, "Please pick at least 3 academic or tech interests"),
});

const step3Schema = z.object({
  skills: z.array(z.string()).max(10, "You can add up to 10 skills"),
});

const BRANCH_OPTIONS = [
  "Computer Science & Engineering",
  "Information Science & Engineering",
  "Electronics & Communication Engineering",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical & Electronics Engineering",
];

const STANDARD_INTERESTS = [
  "AI/ML",
  "Web Development",
  "App Development",
  "IoT",
  "Robotics",
  "Cybersecurity",
  "Data Science",
  "Cloud",
  "UI/UX",
  "Open Source",
  "Hackathons",
  "Placements",
  "GATE",
  "Sports",
  "Music",
  "Photography",
  "Entrepreneurship",
];

const SUGGESTED_SKILLS = [
  "Python",
  "Java",
  "C",
  "C++",
  "JavaScript",
  "React",
  "Node.js",
  "SQL",
  "Git",
  "Figma",
  "Embedded C",
  "Flutter",
  "Docker",
  "TypeScript",
  "Linux",
  "Tailwind CSS",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const supabase = createClient();
  const communities = dataStore.getCommunities();

  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Step 1: About You State
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || "Student")}`
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [branch, setBranch] = useState<string>(user?.branch || "Computer Science & Engineering");
  const [year, setYear] = useState<number>(user?.year || 1);
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Interests State
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests && user.interests.length > 0 ? user.interests : ["Web Development", "Hackathons", "AI/ML"]
  );
  const [customInterest, setCustomInterest] = useState("");
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Step 3: Skills State
  const [skills, setSkills] = useState<string[]>(
    user?.skills && user.skills.length > 0 ? user.skills : ["Python", "Git", "React"]
  );
  const [skillInput, setSkillInput] = useState("");
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Step 4: Communities State
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [peerTutoringInterest, setPeerTutoringInterest] = useState(false);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial redirect and progress restoration
  useEffect(() => {
    if (!user) return;

    // If student has already completed onboarding, redirect to dashboard
    if (user.role === "admin" || user.role === "moderator" || user.onboarding_completed) {
      window.location.href = "/dashboard";
      return;
    }

    if (user.full_name && (!avatarUrl || avatarUrl.includes("Student"))) {
      setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`);
    }
    if (user.branch) setBranch(user.branch);
    if (user.year) setYear(user.year);
    if (user.bio) setBio(user.bio);

    // Check saved onboarding progress to resume at first incomplete step
    const saved = dataStore.getOnboardingProgress(user.id);
    if (saved) {
      if (saved.step && saved.step >= 1 && saved.step <= 4) {
        setCurrentStep(saved.step);
      }
      if (saved.branch) setBranch(saved.branch);
      if (saved.year) setYear(saved.year);
      if (saved.bio !== undefined) setBio(saved.bio);
      if (saved.avatar_url) setAvatarUrl(saved.avatar_url);
      if (saved.interests && saved.interests.length > 0) setSelectedInterests(saved.interests);
      if (saved.skills && saved.skills.length > 0) setSkills(saved.skills);
      if (saved.communities) setJoinedCommunityIds(saved.communities);
      if (saved.peer_tutoring !== undefined) setPeerTutoringInterest(saved.peer_tutoring);
    } else {
      // Initialize joined communities from dataStore
      const userComm = communities.filter((c) => c.is_member).map((c) => c.id);
      setJoinedCommunityIds(userComm.length > 0 ? userComm : [communities[0]?.id || "comm-1"]);
    }
  }, [user]);

  // Handle avatar image selection and validation (2 MB limit, jpeg/png/webp)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setStep1Error("Please upload a valid image (JPEG, PNG, or WebP).");
      return;
    }

    // Check size limit: 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setStep1Error("Avatar image must be smaller than 2 MB.");
      return;
    }

    setStep1Error(null);
    setAvatarFile(file);

    // Create local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar to Supabase Storage bucket 'avatars' if connected
  const uploadAvatarIfPossible = async (): Promise<string> => {
    if (!avatarFile || !supabase || !user) return avatarUrl;

    try {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (error) {
        console.warn("Supabase Storage avatar upload error:", error);
        return avatarUrl;
      }

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return publicData.publicUrl || avatarUrl;
    } catch {
      return avatarUrl;
    }
  };

  // Step 1: Save & Proceed
  const handleNextStep1 = async () => {
    setStep1Error(null);
    const parsed = step1Schema.safeParse({ branch, year, bio });
    if (!parsed.success) {
      setStep1Error(parsed.error.errors[0]?.message || "Please check your inputs.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAvatar = await uploadAvatarIfPossible();

      // Persist to user profile and step cache
      await updateProfile({
        branch,
        year,
        bio,
        avatar_url: finalAvatar,
      });

      if (user) {
        dataStore.saveOnboardingProgress(user.id, {
          step: 2,
          branch,
          year,
          bio,
          avatar_url: finalAvatar,
        });
      }

      showToast("Profile details saved!");
      setCurrentStep(2);
    } catch (err: any) {
      setStep1Error(err?.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Toggle & Add Interests
  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
    setStep2Error(null);
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInterest.trim();
    if (!clean) return;
    if (!selectedInterests.includes(clean)) {
      setSelectedInterests([...selectedInterests, clean]);
    }
    setCustomInterest("");
  };

  const handleNextStep2 = async () => {
    setStep2Error(null);
    const parsed = step2Schema.safeParse({ interests: selectedInterests });
    if (!parsed.success) {
      setStep2Error(parsed.error.errors[0]?.message || "Please select at least 3 interests.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ interests: selectedInterests });
      if (user) {
        dataStore.saveOnboardingProgress(user.id, {
          step: 3,
          interests: selectedInterests,
        });
      }
      showToast("Interests updated!");
      setCurrentStep(3);
    } catch (err: any) {
      setStep2Error(err?.message || "Failed to update interests.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Add/Remove Skills
  const handleAddSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (skills.length >= 10) {
      setStep3Error("Maximum of 10 skills allowed.");
      return;
    }
    if (!skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setSkillInput("");
    setStep3Error(null);
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleNextStep3 = async () => {
    setStep3Error(null);
    const parsed = step3Schema.safeParse({ skills });
    if (!parsed.success) {
      setStep3Error(parsed.error.errors[0]?.message || "Invalid skills selection.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ skills });
      if (user) {
        dataStore.saveOnboardingProgress(user.id, {
          step: 4,
          skills,
        });
      }
      showToast("Skills updated!");
      setCurrentStep(4);
    } catch (err: any) {
      setStep3Error(err?.message || "Failed to save skills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Sorted Communities (Matches user's selected interests first)
  const sortedCommunities = useMemo(() => {
    const userInterestLower = selectedInterests.map((i) => i.toLowerCase());
    return [...communities].sort((a, b) => {
      const aMatches =
        userInterestLower.includes(a.category?.toLowerCase() || "") ||
        userInterestLower.some((interest) => a.description?.toLowerCase().includes(interest));
      const bMatches =
        userInterestLower.includes(b.category?.toLowerCase() || "") ||
        userInterestLower.some((interest) => b.description?.toLowerCase().includes(interest));

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return (b.member_count || 0) - (a.member_count || 0);
    });
  }, [communities, selectedInterests]);

  const toggleCommunity = (id: string) => {
    if (joinedCommunityIds.includes(id)) {
      setJoinedCommunityIds(joinedCommunityIds.filter((cid) => cid !== id));
      dataStore.toggleCommunityMembership(id);
    } else {
      setJoinedCommunityIds([...joinedCommunityIds, id]);
      dataStore.toggleCommunityMembership(id);
    }
  };

  // Complete Onboarding & Redirect
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // 1. Mark onboarding completed in database and data store
      await updateProfile({
        onboarding_completed: true,
        interests: selectedInterests,
        skills,
        branch,
        year,
        bio,
        avatar_url: avatarUrl,
      });

      // 2. Clear onboarding step cache
      if (user) {
        dataStore.clearOnboardingProgress(user.id);
      }

      setIsFinished(true);

      // 3. Smooth transition to dashboard (hard navigation refreshes cookies and middleware session)
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch {
      showToast("Completing onboarding. Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip step helper
  const handleSkipTo = (nextStep: number) => {
    if (nextStep <= 4) {
      if (user) {
        dataStore.saveOnboardingProgress(user.id, { step: nextStep });
      }
      setCurrentStep(nextStep);
    } else {
      handleFinishOnboarding();
    }
  };

  // Finish Success Screen
  if (isFinished) {
    const firstName = user?.full_name?.split(" ")[0] || "Student";
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl text-center space-y-6 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Onboarding Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              You're all set, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Your personalized Karnataka campus feed, recommendations, and student groups are ready.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Opening your campus dashboard...
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                Go to Campus Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 relative">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-indigo-700">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="tracking-wide">Student Onboarding</span>
            </div>
            <span className="text-slate-500 font-semibold">Step {currentStep} of 4</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: ABOUT YOU */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                About You
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Help fellow students and faculty recognize you across study groups and campus events.
              </p>
            </div>

            {step1Error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step1Error}</span>
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-600 bg-white shadow-md relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-indigo-700 transition-colors"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-slate-900">Student Profile Photo</h4>
                <p className="text-[11px] text-slate-500">
                  Accepted formats: JPEG, PNG, WebP • Maximum file size: 2 MB
                </p>
                <label
                  htmlFor="avatar-upload"
                  className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-1"
                >
                  Choose file from device
                </label>
              </div>
            </div>

            {/* Academic Branch Dropdown (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Engineering / Academic Branch <span className="text-rose-500">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-medium"
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Selection (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Current Year of Study <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      year === y
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border-transparent"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Short Bio (Max 160 Characters) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Short Bio (Optional)
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    bio.length > 150 ? "text-amber-600 font-bold" : "text-slate-400"
                  }`}
                >
                  {bio.length} / 160
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                placeholder="e.g. 3rd year CSE student interested in Full Stack development and hackathons."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 resize-none placeholder-slate-400"
              />
            </div>

            {/* Bottom Actions for Step 1 */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Continue to Interests"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INTERESTS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Select Your Interests
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Pick at least 3 topics to customize your marketplace, project, and event recommendations.
              </p>
            </div>

            {step2Error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step2Error}</span>
              </div>
            )}

            {/* Standard Interest Chips */}
            <div>
              <div className="flex flex-wrap gap-2">
                {STANDARD_INTERESTS.map((item) => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Interest Input */}
            <form onSubmit={handleAddCustomInterest} className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Add Custom Interest
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="e.g. Competitive Coding, Rust, BioTech"
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </form>

            <div className="text-xs text-slate-500">
              Selected: <span className="font-bold text-indigo-700">{selectedInterests.length}</span> (minimum 3 required)
            </div>

            {/* Bottom Actions for Step 2 */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSkipTo(3)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                >
                  Skip for now
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextStep2}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Continue to Skills"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Add Your Skills
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Highlight your technical strengths to connect with project teams and tutoring opportunities (max 10).
              </p>
            </div>

            {step3Error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step3Error}</span>
              </div>
            )}

            {/* Tag Input for Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Current Skills ({skills.length}/10)
              </label>
              <div className="min-h-[52px] p-2 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-indigo-900 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder={skills.length >= 10 ? "Limit reached (10)" : "Type skill and press Enter..."}
                  disabled={skills.length >= 10}
                  className="flex-1 min-w-[120px] px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Suggested Skills */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Suggested Skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    disabled={skills.length >= 10}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors disabled:opacity-40"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions for Step 3 */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSkipTo(4)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                >
                  Skip for now
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextStep3}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Continue to Communities"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: JOIN COMMUNITIES & FINISH */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Join Student Communities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                We've sorted approved Karnataka student hubs that match your selected interests first.
              </p>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {sortedCommunities.slice(0, 6).map((comm) => {
                const isMember = joinedCommunityIds.includes(comm.id);
                return (
                  <div
                    key={comm.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isMember
                        ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate">{comm.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {comm.member_count} students • {comm.category}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCommunity(comm.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isMember
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isMember ? "Joined ✓" : "Join"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Optional Peer Tutoring Interest Toggle */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/60 border border-indigo-100 flex items-start gap-3">
              <input
                id="peer-tutoring"
                type="checkbox"
                checked={peerTutoringInterest}
                onChange={(e) => setPeerTutoringInterest(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="peer-tutoring" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-indigo-950 block mb-0.5">
                  I'd like to offer peer tutoring later
                </span>
                Earn peer credits or small stipends helping junior students in difficult subjects. (Shows a setup tip on your dashboard).
              </label>
            </div>

            {/* Bottom Actions for Step 4 */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                >
                  Skip for now
                </button>
              </div>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Finishing..." : "Complete Setup"}
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
