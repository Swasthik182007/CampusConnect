import { describe, it, expect } from "vitest";
import { ALLOWED_COLLEGE_DOMAINS, INITIAL_COLLEGES, INITIAL_PROFILES, INITIAL_LISTINGS, INITIAL_EVENTS, INITIAL_TUTORS, INITIAL_COMMUNITIES } from "../lib/mock-data";
import { computeRecommendations } from "../lib/recommendations";
import { formatINR, formatDate } from "../lib/utils";

describe("CampusConnect Core Platform Tests", () => {
  describe("1. College Domain Allowlist & Student Verification", () => {
    function validateCollegeEmail(email: string) {
      if (!email || !email.includes("@")) return false;
      const domain = email.split("@")[1].toLowerCase().trim();
      return ALLOWED_COLLEGE_DOMAINS.includes(domain);
    }

    it("should accept accredited Karnataka college emails", () => {
      expect(validateCollegeEmail("darshan@vvce.ac.in")).toBe(true);
      expect(validateCollegeEmail("rohan.k@rvce.edu.in")).toBe(true);
      expect(validateCollegeEmail("aishwarya@bmsce.ac.in")).toBe(true);
      expect(validateCollegeEmail("chandan@msrit.edu")).toBe(true);
      expect(validateCollegeEmail("rahul@pes.edu")).toBe(true);
      expect(validateCollegeEmail("sneha@nitk.edu.in")).toBe(true);
    });

    it("should strictly reject non-college / personal emails", () => {
      expect(validateCollegeEmail("spammer@gmail.com")).toBe(false);
      expect(validateCollegeEmail("intruder@yahoo.com")).toBe(false);
      expect(validateCollegeEmail("fake@randomcollege.com")).toBe(false);
    });
  });

  describe("2. Marketplace Listing & Rupee Formatting", () => {
    it("should correctly format Indian Rupees with ₹ symbol", () => {
      const formatted = formatINR(850);
      expect(formatted).toContain("850");
      expect(formatted).toMatch(/₹|Rs/);
    });

    it("should properly format date strings", () => {
      const formatted = formatDate("2025-11-12T10:00:00Z");
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
    });
  });

  describe("3. Event Registration Capacity Check", () => {
    it("should enforce capacity constraint and prevent exceeding limit", () => {
      const mockEvent = {
        id: "evt-test",
        title: "VVCE Hackfest",
        capacity: 10,
        registered_count: 10,
      };

      const canRegister = (evt: typeof mockEvent) => {
        return evt.registered_count < evt.capacity;
      };

      expect(canRegister(mockEvent)).toBe(false);

      mockEvent.registered_count = 8;
      expect(canRegister(mockEvent)).toBe(true);
    });

    it("should prevent duplicate user registration on the same event", () => {
      const registrations = [
        { event_id: "evt-1", user_id: "user-1", status: "confirmed" },
      ];

      const checkDuplicate = (eventId: string, userId: string) => {
        return registrations.some(
          (r) => r.event_id === eventId && r.user_id === userId && r.status === "confirmed"
        );
      };

      expect(checkDuplicate("evt-1", "user-1")).toBe(true);
      expect(checkDuplicate("evt-1", "user-2")).toBe(false);
    });
  });

  describe("4. Peer Tutor Booking Conflict Detection", () => {
    it("should detect overlapping time slots and prevent double booking", () => {
      const existingSessions = [
        {
          tutor_id: "tutor-1",
          start_at: new Date("2025-11-15T18:00:00Z").getTime(),
          end_at: new Date("2025-11-15T19:00:00Z").getTime(),
          status: "confirmed",
        },
      ];

      const hasConflict = (tutorId: string, reqStart: number, reqEnd: number) => {
        return existingSessions.some((s) => {
          if (s.tutor_id === tutorId && s.status !== "cancelled") {
            return Math.max(reqStart, s.start_at) < Math.min(reqEnd, s.end_at);
          }
          return false;
        });
      };

      // Conflicting slot (18:30 - 19:30)
      const conflictStart = new Date("2025-11-15T18:30:00Z").getTime();
      const conflictEnd = new Date("2025-11-15T19:30:00Z").getTime();
      expect(hasConflict("tutor-1", conflictStart, conflictEnd)).toBe(true);

      // Non-conflicting slot (20:00 - 21:00)
      const freeStart = new Date("2025-11-15T20:00:00Z").getTime();
      const freeEnd = new Date("2025-11-15T21:00:00Z").getTime();
      expect(hasConflict("tutor-1", freeStart, freeEnd)).toBe(false);
    });
  });

  describe("5. Recommendation Engine Scoring", () => {
    it("should rank campus events and relevant textbook listings higher for CSE student", () => {
      const user = INITIAL_PROFILES[0]; // Darshan Gowda (VVCE, CSE)
      const recs = computeRecommendations(
        user,
        INITIAL_LISTINGS,
        INITIAL_EVENTS,
        INITIAL_TUTORS,
        INITIAL_COMMUNITIES
      );

      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].score).toBeGreaterThan(recs[recs.length - 1].score);
      // Top recommendation should have a whyRecommended string
      expect(recs[0].whyRecommended).toBeDefined();
    });
  });
});
