import { describe, it, expect, beforeEach } from "vitest";
import { listingSchema } from "@/lib/validations/listing";
import { dataStore } from "@/lib/data-store";
import {
  createListingAction,
  updateListingAction,
  setListingStatusAction,
  removeListingAction,
  toggleWishlistAction,
  startDirectConversationAction,
} from "@/app/marketplace/actions";

describe("Marketplace System & Integrity Tests", () => {
  beforeEach(() => {
    dataStore.resetForTesting();
    // Default to verified student
    dataStore.setCurrentUserId("usr-demo-student");
  });

  // ============================================================================
  // 1. Zod Schema & Validation Rules
  // ============================================================================
  describe("Zod Schema & Integrity Validation", () => {
    const validListing = {
      title: "Introduction to Algorithms (CLRS 3rd Edition)",
      description: "Pristine condition textbook for VTU CSE algorithms coursework and GATE exam preparation.",
      category: "Books" as const,
      condition: "Like New" as const,
      price: 850,
      negotiable: true,
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"],
    };

    it("should accept valid listing data with all required fields", () => {
      const result = listingSchema.safeParse(validListing);
      expect(result.success).toBe(true);
    });

    it("should reject listing title shorter than 5 characters", () => {
      const result = listingSchema.safeParse({ ...validListing, title: "Book" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 5 characters");
      }
    });

    it("should reject listing title longer than 100 characters", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        title: "A".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("100 characters");
      }
    });

    it("should reject description shorter than 10 characters", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        description: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 10 characters");
      }
    });

    it("should reject description longer than 1000 characters", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        description: "D".repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("1000 characters");
      }
    });

    it("should reject empty images array (at least 1 photo required)", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        images: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("1 photo is required");
      }
    });

    it("should reject more than 5 images (maximum 5 photos)", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        images: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
          "https://example.com/4.jpg",
          "https://example.com/5.jpg",
          "https://example.com/6.jpg",
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Maximum 5 photos allowed");
      }
    });

    it("should reject price higher than ₹1,00,000", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        price: 100001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("cannot exceed");
      }
    });

    it("should reject negative price", () => {
      const result = listingSchema.safeParse({
        ...validListing,
        price: -50,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("cannot be negative");
      }
    });
  });

  // ============================================================================
  // 2. Listing Operations & Actions (CRUD)
  // ============================================================================
  describe("Listing CRUD & State Transitions", () => {
    it("should successfully create a new listing via createListingAction", async () => {
      const res = await createListingAction({
        title: "Casio Scientific Calculator FX-991ES",
        description: "Official VTU approved calculator for engineering maths and calculus.",
        category: "Electronics",
        condition: "Like New",
        price: 900,
        negotiable: true,
        images: ["https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=600&q=80"],
      });

      expect(res.success).toBe(true);
      expect(res.listingId).toBeDefined();

      if (res.listingId) {
        const item = dataStore.getListingById(res.listingId);
        expect(item).toBeDefined();
        expect(item?.title).toBe("Casio Scientific Calculator FX-991ES");
        expect(item?.status).toBe("active");
        expect(item?.college_id).toBe("col-vvce");
      }
    });

    it("should prevent unverified users from posting listings", async () => {
      const profiles = dataStore.getProfiles();
      const student = profiles.find((p) => p.id === "usr-demo-student");
      if (student) student.is_verified = false;

      const res = await createListingAction({
        title: "Engineering Physics Lab Record",
        description: "Complete manual with observation tables and calculations.",
        category: "Notes",
        condition: "Good",
        price: 150,
        negotiable: false,
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("verify your institutional email");
    });

    it("should prevent suspended users from posting listings", async () => {
      const profiles = dataStore.getProfiles();
      const student = profiles.find((p) => p.id === "usr-demo-student");
      if (student) student.is_suspended = true;

      const res = await createListingAction({
        title: "Engineering Physics Lab Record",
        description: "Complete manual with observation tables and calculations.",
        category: "Notes",
        condition: "Good",
        price: 150,
        negotiable: false,
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("account is suspended");
    });

    it("should successfully update an existing listing", async () => {
      const updateRes = await updateListingAction("list-1", {
        title: "CLRS 3rd Edition (Algorithms) - Price Dropped",
        description: "Standard textbook with complete index and solved examples.",
        category: "Books",
        condition: "Like New",
        price: 750,
        negotiable: false,
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"],
      });

      expect(updateRes.success).toBe(true);
      const updated = dataStore.getListingById("list-1");
      expect(updated?.title).toBe("CLRS 3rd Edition (Algorithms) - Price Dropped");
      expect(updated?.price).toBe(750);
      expect(updated?.negotiable).toBe(false);
    });

    it("should allow seller to mark listing as sold and reactivate", async () => {
      // 1. Mark as sold
      const soldRes = await setListingStatusAction("list-1", "sold");
      expect(soldRes.success).toBe(true);
      expect(dataStore.getListingById("list-1")?.status).toBe("sold");

      // 2. Reactivate back to active
      const activeRes = await setListingStatusAction("list-1", "active");
      expect(activeRes.success).toBe(true);
      expect(dataStore.getListingById("list-1")?.status).toBe("active");
    });

    it("should soft-delete listing by setting status to removed", async () => {
      const removeRes = await removeListingAction("list-1", "Sold outside platform");
      expect(removeRes.success).toBe(true);
      expect(dataStore.getListingById("list-1")?.status).toBe("removed");
    });
  });

  // ============================================================================
  // 3. Wishlist & Buyer Direct Communication
  // ============================================================================
  describe("Wishlist & Buyer Direct Messaging", () => {
    it("should toggle wishlist state accurately", async () => {
      // Toggle wishlist for list-2 (initially false)
      const res1 = await toggleWishlistAction("list-2");
      expect(res1.success).toBe(true);
      expect(res1.isWishlisted).toBe(true);

      // Toggle again to remove
      const res2 = await toggleWishlistAction("list-2");
      expect(res2.success).toBe(true);
      expect(res2.isWishlisted).toBe(false);
    });

    it("should start direct conversation between buyer and seller", async () => {
      const res = await startDirectConversationAction("usr-rohan", "list-1");
      expect(res.success).toBe(true);
      expect(res.conversationId).toBeDefined();

      const convs = dataStore.getConversations();
      const conv = convs.find((c) => c.id === res.conversationId);
      expect(conv).toBeDefined();
      expect(conv?.participants.some((p) => p.id === "usr-rohan")).toBe(true);
    });
  });

  // ============================================================================
  // 4. Dataset & Multicampus Coverage
  // ============================================================================
  describe("Seed Dataset & Karnataka Colleges Coverage", () => {
    it("should contain 25+ realistic marketplace items", () => {
      const listings = dataStore.getListings();
      expect(listings.length).toBeGreaterThanOrEqual(25);
    });

    it("should cover multiple engineering categories and colleges", () => {
      const listings = dataStore.getListings();
      const categories = new Set(listings.map((l) => l.category));
      expect(categories.has("Books")).toBe(true);
      expect(categories.has("Notes")).toBe(true);
      expect(categories.has("Lab Equipment")).toBe(true);
      expect(categories.has("Electronics")).toBe(true);
      expect(categories.has("Furniture")).toBe(true);

      const colleges = new Set(listings.map((l) => l.college_id));
      expect(colleges.size).toBeGreaterThanOrEqual(5);
    });
  });
});
