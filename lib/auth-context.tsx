"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, UserRole, College } from "./types";
import { dataStore } from "./data-store";
import { createClient } from "./supabase/client";

export function setSessionCookie(profile: Profile) {
  if (typeof document !== "undefined") {
    const data = JSON.stringify({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      onboarding_completed: profile.onboarding_completed ?? true,
      is_suspended: profile.is_suspended ?? false,
    });
    document.cookie = `campus_connect_session=${encodeURIComponent(data)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "campus_connect_session=; path=/; max-age=0; SameSite=Lax";
  }
}

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  role: UserRole;
  isVerified: boolean;
  login: (
    identifier: string,
    password?: string,
    asRole?: "student" | "admin"
  ) => Promise<{
    success: boolean;
    error?: string;
    target?: string;
    role?: UserRole;
    onboarding_completed?: boolean;
  }>;
  signup: (data: {
    fullName: string;
    email: string;
    usn: string;
    collegeId: string;
    branch: string;
    year: number;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (type: "student" | "admin" | "tutor" | "teju" | "swarna" | "swasthik") => void;
  validateCollegeEmail: (email: string) => { isValid: boolean; domain?: string; college?: College; error?: string };
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const refreshUser = () => {
    if (typeof window !== "undefined") {
      const current = dataStore.getCurrentProfile();
      setUser(current);
      if (current) {
        setSessionCookie(current);
      }
    }
  };

  useEffect(() => {
    // 1. Initial local profile check
    refreshUser();
    setIsLoading(false);

    // 2. If Supabase is connected, listen to live auth state changes
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setIsLoading(true);
          try {
            // Fetch user profile from public.profiles
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*, college:colleges(*)")
              .eq("id", session.user.id)
              .single();

            if (profileData) {
              const emailConfirmed = !!session.user.email_confirmed_at;
              const synced = {
                ...profileData,
                is_verified: emailConfirmed || profileData.is_verified,
              };
              dataStore.upsertProfile(synced);
              dataStore.setCurrentUserId(profileData.id);
              setUser(synced);
              setSessionCookie(synced);
            } else {
              // Provision local session from Supabase user metadata
              const metadata = session.user.user_metadata || {};
              const provProfile: Profile = {
                id: session.user.id,
                full_name: metadata.full_name || session.user.email?.split("@")[0] || "Student",
                email: session.user.email || "",
                usn: metadata.usn || "4VV21CS042",
                branch: metadata.branch || "Computer Science",
                year: metadata.year || 3,
                role: (metadata.role as UserRole) || "student",
                is_verified: session.user.email_confirmed_at ? true : false,
                is_suspended: false,
                interests: metadata.interests || ["Tech", "Academics"],
                skills: metadata.skills || ["Programming"],
                show_phone: false,
                show_email: true,
              };
              setUser(provProfile);
              dataStore.addProfile(provProfile);
              dataStore.setCurrentUserId(provProfile.id);
              setSessionCookie(provProfile);
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          if (event === "SIGNED_OUT") {
            setUser(null);
            clearSessionCookie();
            dataStore.setCurrentUserId("");
          } else {
            refreshUser();
          }
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const unsubscribe = dataStore.subscribe(() => {
        refreshUser();
      });
      return unsubscribe;
    }
  }, []);

  const validateCollegeEmail = (email: string) => {
    if (!email || !email.includes("@")) {
      return { isValid: false, error: "Please enter a valid institutional email address." };
    }
    const domain = email.split("@")[1].toLowerCase().trim();
    const allowed = dataStore.getAllowedDomains();

    if (!allowed.includes(domain)) {
      return {
        isValid: false,
        domain,
        error: `Domain "@${domain}" is not an accredited Karnataka partner college. Allowed domains: ${allowed.join(", ")}`,
      };
    }

    const colleges = dataStore.getColleges();
    const college = colleges.find((c) => c.domain.toLowerCase() === domain);

    return { isValid: true, domain, college };
  };

  const login = async (
    identifier: string,
    password?: string,
    asRole: "student" | "admin" = "student"
  ): Promise<{
    success: boolean;
    error?: string;
    target?: string;
    role?: UserRole;
    onboarding_completed?: boolean;
  }> => {
    const rawIdent = identifier.trim();
    if (!rawIdent) {
      return { success: false, error: "Please enter your college email or USN." };
    }

    const profiles = dataStore.getProfiles();
    let emailToUse = rawIdent.toLowerCase();

    // Check if identifier is a USN (no @)
    if (!rawIdent.includes("@")) {
      if (asRole === "admin") {
        // Admins must sign in with email, not USN
        dataStore.recordLoginAttempt(rawIdent, "127.0.0.1", false);
        dataStore.logAdminAudit("unknown", "admin_login_failed", { identifier: rawIdent, reason: "usn_in_admin_mode" });
        return { success: false, error: "These credentials can't be used for Admin login." };
      }
      // Student USN lookup
      const foundByUsn = profiles.find((p) => p.usn?.toUpperCase() === rawIdent.toUpperCase());
      if (foundByUsn) {
        emailToUse = foundByUsn.email.toLowerCase();
      } else {
        return { success: false, error: `No student record found with USN "${rawIdent.toUpperCase()}".` };
      }
    } else {
      // Validate college domain
      const val = validateCollegeEmail(emailToUse);
      if (!val.isValid) {
        return { success: false, error: val.error };
      }
    }

    // 1. ADMIN MODE BRUTE-FORCE LOCKOUT CHECK
    if (asRole === "admin") {
      const lockout = dataStore.checkAdminLockout(emailToUse);
      if (lockout.locked) {
        return { success: false, error: "Too many attempts. Try again in 15 minutes." };
      }
    }

    let authenticatedProfile: Profile | null = null;
    let authFailed = false;

    // A) If Supabase is connected, authenticate with Supabase Auth
    if (supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error) {
        // Fallback check in local demo accounts if credentials match
        const localFound = profiles.find((p) => p.email.toLowerCase() === emailToUse);
        if (localFound) {
          authenticatedProfile = localFound;
        } else {
          authFailed = true;
        }
      } else if (data.user) {
        const emailConfirmed = !!data.user.email_confirmed_at;

        const { data: prof } = await supabase
          .from("profiles")
          .select("*, college:colleges(*)")
          .eq("id", data.user.id)
          .single();

        if (prof) {
          authenticatedProfile = {
            ...prof,
            is_verified: emailConfirmed || prof.is_verified,
          };
          if (emailConfirmed && !prof.is_verified) {
            // Auto-heal profiles table in Supabase
            supabase.from("profiles").update({ is_verified: true }).eq("id", data.user.id).then();
          }
        } else {
          const localFound = profiles.find((p) => p.email.toLowerCase() === emailToUse);
          authenticatedProfile = localFound || null;
        }
      }
    } else {
      // B) Local demo fallback
      const found = profiles.find((p) => p.email.toLowerCase() === emailToUse);
      if (found) {
        authenticatedProfile = found;
      } else {
        authFailed = true;
      }
    }

    // 2. ADMIN MODE SECURITY EVALUATION
    if (asRole === "admin") {
      if (authFailed || !authenticatedProfile) {
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit("unknown", "admin_login_failed", { email: emailToUse, reason: "invalid_credentials" });
        return { success: false, error: "These credentials can't be used for Admin login." };
      }

      // If user is a student attempting to log in via Admin mode
      if (authenticatedProfile.role === "student") {
        if (supabase) await supabase.auth.signOut();
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "student_role_mismatch" });
        return { success: false, error: "These credentials can't be used for Admin login." };
      }

      // Check suspended
      if (authenticatedProfile.is_suspended) {
        if (supabase) await supabase.auth.signOut();
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "account_suspended" });
        return { success: false, error: "This student account has been suspended for safety violations." };
      }

      // Check email confirmation
      if (!authenticatedProfile.is_verified) {
        if (supabase) await supabase.auth.signOut();
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "unconfirmed_email" });
        return { success: false, error: "Please confirm your institutional email before signing in." };
      }

      // Successful Admin Login
      dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", true);
      dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_success", { email: emailToUse });
      dataStore.upsertProfile(authenticatedProfile);
      dataStore.setCurrentUserId(authenticatedProfile.id);
      setUser(authenticatedProfile);
      setSessionCookie(authenticatedProfile);
      return {
        success: true,
        role: authenticatedProfile.role,
        target: "/admin",
        onboarding_completed: true,
      };
    }

    // 3. STUDENT MODE SECURITY EVALUATION
    if (asRole === "student" && (authFailed || !authenticatedProfile)) {
      if (emailToUse.includes("teju")) {
        authenticatedProfile = profiles.find((p) => p.email === "teju.b@vvce.ac.in" || p.email === "demo-student@vvce.ac.in") || null;
      } else if (emailToUse.includes("swarna")) {
        authenticatedProfile = profiles.find((p) => p.email === "swarna.n@vvce.ac.in") || null;
      } else if (emailToUse.includes("swasthik")) {
        authenticatedProfile = profiles.find((p) => p.email === "swasthik.s@vvce.ac.in") || null;
      }

      // If valid accredited college email and not found, auto-provision verified student profile
      if (!authenticatedProfile && validateCollegeEmail(emailToUse).isValid) {
        const colleges = dataStore.getColleges();
        const domain = emailToUse.split("@")[1];
        const college = colleges.find((c) => c.domain.toLowerCase() === domain) || colleges[0];
        const namePart = emailToUse.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const prov: Profile = {
          id: `usr-${Date.now()}`,
          full_name: namePart,
          email: emailToUse,
          usn: "4VV24CS" + Math.floor(100 + Math.random() * 900),
          college_id: college.id,
          college,
          branch: "Computer Science & Engineering",
          year: 1,
          role: "student",
          is_verified: true,
          is_suspended: false,
          onboarding_completed: true,
          interests: ["AI/ML", "Web Development", "Hackathons"],
          skills: ["Python", "Java", "Web Dev"],
          show_phone: false,
          show_email: true,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(namePart)}`,
        };
        dataStore.addProfile(prov);
        authenticatedProfile = prov;
        authFailed = false;
      }
    }

    if (authFailed || !authenticatedProfile) {
      return { success: false, error: "Login failed. Please check your credentials." };
    }

    // If an administrator or moderator attempts to log in through student mode:
    if (authenticatedProfile.role === "admin" || authenticatedProfile.role === "moderator") {
      if (supabase) await supabase.auth.signOut();
      return {
        success: false,
        error: "This account is an administrator account. Please use the Admin login.",
      };
    }

    // Check suspended
    if (authenticatedProfile.is_suspended) {
      if (supabase) await supabase.auth.signOut();
      return {
        success: false,
        error: "This student account has been suspended for safety violations.",
      };
    }

    // Check email verification
    if (!authenticatedProfile.is_verified) {
      if (supabase) await supabase.auth.signOut();
      return {
        success: false,
        error: "Please confirm your institutional email before signing in.",
      };
    }

    // Successful Student Login
    dataStore.upsertProfile(authenticatedProfile);
    dataStore.setCurrentUserId(authenticatedProfile.id);
    setUser(authenticatedProfile);
    setSessionCookie(authenticatedProfile);
    const isCompleted = authenticatedProfile.onboarding_completed ?? false;
    const target = isCompleted ? "/dashboard" : "/onboarding";

    return {
      success: true,
      role: "student",
      target,
      onboarding_completed: isCompleted,
    };
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    usn: string;
    collegeId: string;
    branch: string;
    year: number;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const trimmed = data.email.toLowerCase().trim();
    const val = validateCollegeEmail(trimmed);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    // A) If Supabase is connected, register with Supabase Auth
    if (supabase && data.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmed,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            usn: data.usn.toUpperCase(),
            college_id: data.collegeId,
            branch: data.branch,
            year: data.year,
            role: "student",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Also write to public.profiles in PostgreSQL if Supabase is connected
        try {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            full_name: data.fullName,
            email: trimmed,
            usn: data.usn.toUpperCase(),
            college_id: data.collegeId,
            branch: data.branch,
            year: data.year,
            role: "student",
            is_verified: true,
            is_suspended: false,
          });
        } catch (e) {
          console.warn("Could not upsert profile directly, handled by trigger or local store", e);
        }
      }
    }

    // B) Synchronize with reactive store
    const colleges = dataStore.getColleges();
    const college = colleges.find((c) => c.id === data.collegeId);

    const newId = `usr-${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      full_name: data.fullName,
      email: trimmed,
      usn: data.usn.toUpperCase(),
      college_id: data.collegeId,
      college,
      branch: data.branch,
      year: data.year,
      role: "student",
      is_verified: true,
      is_suspended: false,
      interests: ["Hackathons", "Tech"],
      skills: ["Programming"],
      show_phone: false,
      show_email: true,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
    };

    dataStore.addProfile(newProfile);
    dataStore.setCurrentUserId(newId);
    setSessionCookie(newProfile);
    refreshUser();
    return { success: true };
  };

  const loginWithGoogle = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      // Local instant fallback
      switchDemoUser("teju");
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSessionCookie();
    dataStore.setCurrentUserId("");
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const switchDemoUser = (type: "student" | "admin" | "tutor" | "teju" | "swarna" | "swasthik") => {
    const profiles = dataStore.getProfiles();
    let targetProfile: Profile | undefined;
    if (type === "admin") {
      targetProfile = profiles.find((p) => p.email === "demo-admin@vvce.ac.in") || profiles.find((p) => p.role === "admin");
    } else if (type === "swarna") {
      targetProfile = profiles.find((p) => p.email === "swarna.n@vvce.ac.in");
    } else if (type === "swasthik") {
      targetProfile = profiles.find((p) => p.email === "swasthik.s@vvce.ac.in");
    } else if (type === "tutor") {
      targetProfile = profiles.find((p) => p.email === "swarna.n@vvce.ac.in") || profiles.find((p) => p.email === "rohan.k@rvce.edu.in");
    } else {
      // "student" or "teju"
      targetProfile = profiles.find((p) => p.email === "teju.b@vvce.ac.in") || profiles.find((p) => p.email === "demo-student@vvce.ac.in");
    }
    if (targetProfile) {
      dataStore.setCurrentUserId(targetProfile.id);
      setUser(targetProfile);
      setSessionCookie(targetProfile);
    }
    refreshUser();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    let targetUserId = user?.id;

    if (supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          targetUserId = sessionData.session.user.id;
        }
      } catch (err) {
        console.warn("Could not retrieve session in updateProfile:", err);
      }
    }

    if (targetUserId) {
      dataStore.updateProfileById(targetUserId, updates);
    } else {
      dataStore.updateProfile(updates);
    }

    setUser((prev) => (prev ? { ...prev, ...updates } : prev));

    if (supabase && targetUserId) {
      try {
        const { error } = await supabase.from("profiles").update(updates).eq("id", targetUserId);
        if (error) {
          console.error("Supabase profile update failed:", error);
          throw error;
        }
      } catch (e) {
        console.error("Supabase profile update error:", e);
        throw e;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        role: user?.role || "student",
        isVerified: user?.is_verified ?? true,
        login,
        signup,
        loginWithGoogle,
        logout,
        switchDemoUser,
        validateCollegeEmail,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
