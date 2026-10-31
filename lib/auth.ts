import { createServerSupabaseClient } from "./supabase/server";
import { Profile, UserRole } from "./types";

/**
 * Server-side helper to get the currently authenticated user and profile
 */
export async function getCurrentUser(): Promise<{
  user: any | null;
  profile: Profile | null;
}> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("id", user.id)
    .single();

  return { user, profile: profile || null };
}

/**
 * Validate redirect URLs against open redirect vulnerabilities and role access rules
 */
export function isSafeRedirect(next: string | null | undefined, role?: UserRole): string {
  if (!next) {
    return role === "admin" || role === "moderator" ? "/admin" : "/dashboard";
  }

  // Must start with single slash and not double slash (//evil.com)
  if (!next.startsWith("/") || next.startsWith("//")) {
    return role === "admin" || role === "moderator" ? "/admin" : "/dashboard";
  }

  // Prevent students from redirecting to /admin
  if (next.startsWith("/admin") && role !== "admin" && role !== "moderator") {
    return "/dashboard";
  }

  return next;
}
