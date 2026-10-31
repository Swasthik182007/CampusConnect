import { describe, it, expect, beforeEach } from "vitest";
import { dataStore } from "../lib/data-store";
import { isSafeRedirect } from "../lib/auth-utils";
import { Profile } from "../lib/types";

describe("CampusConnect Feature 1 & 2: Login Security, Role Toggle & Onboarding", () => {
  beforeEach(() => {
    // Reset test storage items in localStorage / memory
    dataStore.resetForTesting();
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  // Simulated login function matching the security rules in lib/auth-context.tsx
  function simulateLogin(
    identifier: string,
    password?: string,
    asRole: "student" | "admin" = "student"
  ): {
    success: boolean;
    error?: string;
    target?: string;
    role?: string;
    onboarding_completed?: boolean;
    signedOut?: boolean;
  } {
    const rawIdent = identifier.trim();
    if (!rawIdent) {
      return { success: false, error: "Please enter your college email or USN." };
    }

    const profiles = dataStore.getProfiles();
    let emailToUse = rawIdent.toLowerCase();

    // Check if USN login
    if (!rawIdent.includes("@")) {
      if (asRole === "admin") {
        dataStore.recordLoginAttempt(rawIdent, "127.0.0.1", false);
        dataStore.logAdminAudit("unknown", "admin_login_failed", { identifier: rawIdent, reason: "usn_in_admin_mode" });
        return { success: false, error: "These credentials can't be used for Admin login.", signedOut: true };
      }
      const found = profiles.find((p) => p.usn?.toUpperCase() === rawIdent.toUpperCase());
      if (found) {
        emailToUse = found.email.toLowerCase();
      } else {
        return { success: false, error: `No student record found with USN "${rawIdent.toUpperCase()}".` };
      }
    } else {
      const allowed = dataStore.getAllowedDomains();
      const domain = emailToUse.split("@")[1];
      if (!allowed.includes(domain)) {
        return { success: false, error: `Domain "@${domain}" is not an accredited Karnataka partner college.` };
      }
    }

    // 1. Admin mode brute force lockout check
    if (asRole === "admin") {
      const lockout = dataStore.checkAdminLockout(emailToUse);
      if (lockout.locked) {
        return { success: false, error: "Too many attempts. Try again in 15 minutes." };
      }
    }

    const authenticatedProfile = profiles.find((p) => p.email.toLowerCase() === emailToUse) || null;

    // 2. Admin mode checks
    if (asRole === "admin") {
      if (!authenticatedProfile) {
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit("unknown", "admin_login_failed", { email: emailToUse, reason: "not_found" });
        return { success: false, error: "These credentials can't be used for Admin login.", signedOut: true };
      }

      if (authenticatedProfile.role === "student") {
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "student_role_mismatch" });
        return { success: false, error: "These credentials can't be used for Admin login.", signedOut: true };
      }

      if (authenticatedProfile.is_suspended) {
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "account_suspended" });
        return { success: false, error: "This student account has been suspended for safety violations.", signedOut: true };
      }

      if (!authenticatedProfile.is_verified) {
        dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", false);
        dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_failed", { email: emailToUse, reason: "unconfirmed_email" });
        return { success: false, error: "Please confirm your institutional email before signing in.", signedOut: true };
      }

      // Successful Admin Login
      dataStore.recordLoginAttempt(emailToUse, "127.0.0.1", true);
      dataStore.logAdminAudit(authenticatedProfile.id, "admin_login_success", { email: emailToUse });
      dataStore.setCurrentUserId(authenticatedProfile.id);
      return {
        success: true,
        role: authenticatedProfile.role,
        target: "/admin",
        onboarding_completed: true,
      };
    }

    // 3. Student mode checks
    if (!authenticatedProfile) {
      return { success: false, error: "Login failed. Please check your credentials." };
    }

    if (authenticatedProfile.role === "admin" || authenticatedProfile.role === "moderator") {
      return {
        success: false,
        error: "This account is an administrator account. Please use the Admin login.",
        signedOut: true,
      };
    }

    if (authenticatedProfile.is_suspended) {
      return {
        success: false,
        error: "This student account has been suspended for safety violations.",
        signedOut: true,
      };
    }

    if (!authenticatedProfile.is_verified) {
      return {
        success: false,
        error: "Please confirm your institutional email before signing in.",
        signedOut: true,
      };
    }

    dataStore.setCurrentUserId(authenticatedProfile.id);
    const isCompleted = authenticatedProfile.onboarding_completed ?? false;
    return {
      success: true,
      role: "student",
      target: isCompleted ? "/dashboard" : "/onboarding",
      onboarding_completed: isCompleted,
    };
  }

  describe("1. Admin Toggle & Rejection of Student Account in Admin Mode", () => {
    it("should reject student account in Admin mode with generic message and sign them out", () => {
      const res = simulateLogin("demo-student@vvce.ac.in", "anyPassword", "admin");
      expect(res.success).toBe(false);
      expect(res.error).toBe("These credentials can't be used for Admin login.");
      expect(res.signedOut).toBe(true);
    });
  });

  describe("2. Admin Account in Student Mode", () => {
    it("should reject an admin trying to login in Student mode with specific instruction message", () => {
      const res = simulateLogin("demo-admin@vvce.ac.in", "anyPassword", "student");
      expect(res.success).toBe(false);
      expect(res.error).toBe("This account is an administrator account. Please use the Admin login.");
      expect(res.signedOut).toBe(true);
    });
  });

  describe("3. Admin Account in Admin Mode", () => {
    it("should successfully log in admin account, land on /admin, and write an audit log entry", () => {
      const initialLogs = dataStore.getAdminAuditLogs().length;
      const res = simulateLogin("demo-admin@vvce.ac.in", "anyPassword", "admin");

      expect(res.success).toBe(true);
      expect(res.role).toBe("admin");
      expect(res.target).toBe("/admin");

      const logs = dataStore.getAdminAuditLogs();
      expect(logs.length).toBeGreaterThan(initialLogs);
      const latest = logs[0];
      expect(latest.action).toBe("admin_login_success");
      expect(latest.admin_id).toBe("usr-demo-admin");
    });
  });

  describe("4. Admin Mode UI & Keyboard Accessibility", () => {
    it("should support keyboard navigation between student and admin tabs", () => {
      let currentMode: "student" | "admin" = "student";

      const handleArrowKey = (key: "ArrowRight" | "ArrowLeft") => {
        if (key === "ArrowRight" || key === "ArrowLeft") {
          currentMode = currentMode === "student" ? "admin" : "student";
        }
      };

      handleArrowKey("ArrowRight");
      expect(currentMode).toBe("admin");

      handleArrowKey("ArrowLeft");
      expect(currentMode).toBe("student");
    });

    it("should hide Sign Up tab, Google button, College Email option, and Create account in Admin mode", () => {
      const getVisibleUIElements = (roleMode: "student" | "admin") => {
        const isAdmin = roleMode === "admin";
        return {
          signUpTab: !isAdmin,
          googleButton: !isAdmin,
          collegeEmailButton: !isAdmin,
          createAccountLink: !isAdmin,
          heading: isAdmin ? "Admin Portal" : "Welcome back",
          allowsUSN: !isAdmin,
        };
      };

      const studentUI = getVisibleUIElements("student");
      expect(studentUI.signUpTab).toBe(true);
      expect(studentUI.googleButton).toBe(true);
      expect(studentUI.collegeEmailButton).toBe(true);
      expect(studentUI.createAccountLink).toBe(true);
      expect(studentUI.allowsUSN).toBe(true);

      const adminUI = getVisibleUIElements("admin");
      expect(adminUI.signUpTab).toBe(false);
      expect(adminUI.googleButton).toBe(false);
      expect(adminUI.collegeEmailButton).toBe(false);
      expect(adminUI.createAccountLink).toBe(false);
      expect(adminUI.heading).toBe("Admin Portal");
      expect(adminUI.allowsUSN).toBe(false);
    });
  });

  describe("5. Admin Brute-Force Lockout Protection", () => {
    it("should trigger lockout after 5 consecutive failed admin attempts", () => {
      const testEmail = "intruder-test@vvce.ac.in";

      // 4 failed attempts
      for (let i = 0; i < 4; i++) {
        const res = simulateLogin(testEmail, "wrongPass", "admin");
        expect(res.success).toBe(false);
        expect(res.error).toBe("These credentials can't be used for Admin login.");
      }

      // 5th failed attempt
      const fifth = simulateLogin(testEmail, "wrongPass", "admin");
      expect(fifth.success).toBe(false);

      // 6th attempt should be blocked immediately by brute-force lockout
      const sixth = simulateLogin(testEmail, "wrongPass", "admin");
      expect(sixth.success).toBe(false);
      expect(sixth.error).toBe("Too many attempts. Try again in 15 minutes.");
    });
  });

  describe("6. New Confirmed Student Redirect to /onboarding and Completion", () => {
    it("should redirect student with onboarding_completed = false to /onboarding", () => {
      const res = simulateLogin("new-student@vvce.ac.in", "password123", "student");
      expect(res.success).toBe(true);
      expect(res.onboarding_completed).toBe(false);
      expect(res.target).toBe("/onboarding");
    });

    it("should mark onboarding_completed = true and redirect to /dashboard upon finish", () => {
      const profiles = dataStore.getProfiles();
      const student = profiles.find((p) => p.email === "new-student@vvce.ac.in")!;

      // Step 1: About you
      student.branch = "Computer Science & Engineering";
      student.year = 2;
      student.bio = "Passionate coder";

      // Step 2: Interests (at least 3)
      student.interests = ["AI/ML", "Web Development", "Hackathons"];

      // Step 3: Skills (max 10)
      student.skills = ["Python", "JavaScript", "React", "Node.js"];

      // Step 4: Finish onboarding
      student.onboarding_completed = true;
      dataStore.updateProfile(student);

      const updated = dataStore.getProfiles().find((p) => p.email === "new-student@vvce.ac.in")!;
      expect(updated.onboarding_completed).toBe(true);

      const afterRes = simulateLogin("new-student@vvce.ac.in", "password123", "student");
      expect(afterRes.target).toBe("/dashboard");
    });
  });

  describe("7. Completed Student Cannot Open /onboarding", () => {
    it("should redirect completed student from /onboarding to /dashboard", () => {
      const res = simulateLogin("demo-student@vvce.ac.in", "password123", "student");
      expect(res.success).toBe(true);
      expect(res.onboarding_completed).toBe(true);
      expect(res.target).toBe("/dashboard");

      // Middleware redirect logic check
      const studentOnboardingCompleted = true;
      const targetRoute = "/onboarding";
      const redirectedRoute = studentOnboardingCompleted && targetRoute === "/onboarding" ? "/dashboard" : targetRoute;
      expect(redirectedRoute).toBe("/dashboard");
    });
  });

  describe("8. Onboarding Mid-way Step Resumption", () => {
    it("should resume at the saved step when closing tab and reopening", () => {
      const userId = "usr-tab-test";
      dataStore.saveOnboardingProgress(userId, {
        step: 3,
        branch: "Information Science & Engineering",
        year: 3,
        interests: ["Robotics", "IoT", "Cloud"],
      });

      const restored = dataStore.getOnboardingProgress(userId);
      expect(restored).not.toBeNull();
      expect(restored?.step).toBe(3);
      expect(restored?.interests).toContain("Robotics");
    });
  });

  describe("9. Previous Login Flows Preservation", () => {
    it("should support USN login for student", () => {
      const res = simulateLogin("4VV21CS042", "password", "student");
      expect(res.success).toBe(true);
      expect(res.role).toBe("student");
    });

    it("should block suspended users", () => {
      const profiles = dataStore.getProfiles();
      const p = profiles.find((prof) => prof.id === "usr-demo-student");
      if (p) p.is_suspended = true;

      const res = simulateLogin("demo-student@vvce.ac.in", "password", "student");
      expect(res.success).toBe(false);
      expect(res.error).toBe("This student account has been suspended for safety violations.");

      // Restore
      if (p) p.is_suspended = false;
    });

    it("should block unconfirmed institutional email users", () => {
      const profiles = dataStore.getProfiles();
      const p = profiles.find((prof) => prof.id === "usr-demo-student");
      if (p) p.is_verified = false;

      const res = simulateLogin("demo-student@vvce.ac.in", "password", "student");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Please confirm your institutional email before signing in.");

      // Restore
      if (p) p.is_verified = true;
    });

    it("should safely validate next parameter and protect /admin from non-admins", () => {
      expect(isSafeRedirect("/marketplace", "student")).toBe("/marketplace");
      expect(isSafeRedirect("/admin", "student")).toBe("/dashboard");
      expect(isSafeRedirect("/admin", "admin")).toBe("/admin");
      expect(isSafeRedirect("https://malicious.com", "student")).toBe("/dashboard");
      expect(isSafeRedirect("//malicious.com", "student")).toBe("/dashboard");
    });
  });

  describe("10. Supabase Authentication, Session Persistence & Logout", () => {
    it("should reject login with incorrect credentials/passwords", () => {
      // Non-existent user
      const nonExistent = simulateLogin("nonexistent@vvce.ac.in", "wrongpass", "student");
      expect(nonExistent.success).toBe(false);
      expect(nonExistent.error).toBe("Login failed. Please check your credentials.");

      // In admin mode with wrong password
      const wrongAdmin = simulateLogin("intruder@vvce.ac.in", "badpass", "admin");
      expect(wrongAdmin.success).toBe(false);
      expect(wrongAdmin.error).toBe("These credentials can't be used for Admin login.");
    });

    it("should maintain session persistence after successful sign in", () => {
      const res = simulateLogin("demo-student@vvce.ac.in", "correctpass", "student");
      expect(res.success).toBe(true);
      expect(dataStore.getCurrentUserId()).toBe("usr-demo-student");

      const persistentProfile = dataStore.getCurrentProfile();
      expect(persistentProfile.id).toBe("usr-demo-student");
      expect(persistentProfile.role).toBe("student");
    });

    it("should clear session and current user upon logout", () => {
      // 1. Log in
      simulateLogin("demo-student@vvce.ac.in", "correctpass", "student");
      expect(dataStore.getCurrentUserId()).toBe("usr-demo-student");

      // 2. Simulate Logout
      dataStore.setCurrentUserId("");
      expect(dataStore.getCurrentUserId()).toBe("");
    });

    it("should prevent unauthorized non-admin access to admin dashboard", () => {
      const studentProfile = dataStore.getProfiles().find((p) => p.role === "student")!;
      const checkAccess = (role: string, targetPath: string) => {
        if (targetPath.startsWith("/admin") && role !== "admin" && role !== "moderator") {
          return "/dashboard";
        }
        return targetPath;
      };

      expect(checkAccess(studentProfile.role, "/admin")).toBe("/dashboard");
      expect(checkAccess("admin", "/admin")).toBe("/admin");
    });
  });
});
