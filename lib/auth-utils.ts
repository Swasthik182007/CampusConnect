
import { UserRole } from "./types";

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



