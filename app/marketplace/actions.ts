"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validations/listing";
import { dataStore } from "@/lib/data-store";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safely no-op outside Next.js request lifecycle (e.g. unit testing)
  }
}

export interface CreateListingInput {
  id?: string;
  title: string;
  description: string;
  category: "Books" | "Notes" | "Lab Equipment" | "Electronics" | "Furniture" | "Others";
  condition: "New" | "Like New" | "Good" | "Used";
  price: number;
  negotiable: boolean;
  images: string[];
}

/**
 * Server Action to create a new marketplace listing.
 * Validates inputs with Zod, checks session & user status, and inserts with RLS.
 */
export async function createListingAction(input: CreateListingInput): Promise<{
  success: boolean;
  listingId?: string;
  error?: string;
}> {
  // 1. Zod validation
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid listing data.",
    };
  }

  const supabase = createServerSupabaseClient();

  // A) Supabase Live Backend
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to post an item." };
    }

    // Check profile verification & suspended status
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, college_id, is_verified, is_suspended")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Profile not found." };
    }

    if (profile.is_suspended) {
      return { success: false, error: "Your account is suspended for safety violations." };
    }

    if (!profile.is_verified) {
      return { success: false, error: "Please verify your institutional email before posting items." };
    }

    const listingId = input.id || crypto.randomUUID();

    // Database triggers will enforce:
    // 1. college_id forced to seller's profiles.college_id
    // 2. status forced to 'active'
    // 3. daily limit (max 10 in 24 hours)
    // 4. blocked words rejection
    // 5. image array count between 1 and 5
    // 6. price <= 1,00,000
    const { data: inserted, error: insertError } = await supabase
      .from("listings")
      .insert({
        id: listingId,
        seller_id: user.id,
        college_id: profile.college_id,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        condition: input.condition,
        price: input.price,
        negotiable: input.negotiable,
        images: input.images,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    safeRevalidatePath("/marketplace");
    safeRevalidatePath("/dashboard");
    if (inserted?.id) {
      safeRevalidatePath(`/marketplace/${inserted.id}`);
    }

    return { success: true, listingId: inserted.id };
  }

  // B) Fallback to local DataStore when offline/demo
  const currentProfile = dataStore.getCurrentProfile();
  if (currentProfile.is_suspended) {
    return { success: false, error: "Your account is suspended for safety violations." };
  }
  if (!currentProfile.is_verified) {
    return { success: false, error: "Please verify your institutional email before posting items." };
  }

  const newListing = dataStore.createListing({
    id: input.id || `list-${Date.now()}`,
    title: input.title,
    description: input.description,
    category: input.category,
    condition: input.condition,
    price: input.price,
    negotiable: input.negotiable,
    images: input.images,
    status: "active",
    college_id: currentProfile.college_id,
  });

  safeRevalidatePath("/marketplace");
  safeRevalidatePath("/dashboard");

  return { success: true, listingId: newListing.id };
}

/**
 * Server Action to update an existing listing
 */
export async function updateListingAction(
  listingId: string,
  input: CreateListingInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid listing data.",
    };
  }

  const supabase = createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        condition: input.condition,
        price: input.price,
        negotiable: input.negotiable,
        images: input.images,
      })
      .eq("id", listingId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    safeRevalidatePath("/marketplace");
    safeRevalidatePath(`/marketplace/${listingId}`);
    return { success: true };
  }

  dataStore.updateListing(listingId, {
    title: input.title,
    description: input.description,
    category: input.category,
    condition: input.condition,
    price: input.price,
    negotiable: input.negotiable,
    images: input.images,
  });

  safeRevalidatePath("/marketplace");
  safeRevalidatePath(`/marketplace/${listingId}`);
  return { success: true };
}

/**
 * Server Action to toggle item status (e.g. mark as sold or active)
 */
export async function setListingStatusAction(
  listingId: string,
  status: "active" | "sold" | "removed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    dataStore.updateListing(listingId, { status });
  }

  safeRevalidatePath("/marketplace");
  safeRevalidatePath(`/marketplace/${listingId}`);
  return { success: true };
}

/**
 * Server Action to remove a listing (Soft-delete & purge files)
 */
export async function removeListingAction(
  listingId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.rpc("remove_listing", {
      target_listing_id: listingId,
      removal_reason: reason || "Removed by seller",
    });

    if (error) {
      // Fallback direct update if RPC has not been executed yet
      await supabase.from("listings").update({ status: "removed" }).eq("id", listingId);
    }
  } else {
    dataStore.deleteListing(listingId);
  }

  safeRevalidatePath("/marketplace");
  safeRevalidatePath(`/marketplace/${listingId}`);
  return { success: true };
}

/**
 * Server Action to toggle wishlist status
 */
export async function toggleWishlistAction(
  listingId: string
): Promise<{ success: boolean; isWishlisted: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, isWishlisted: false, error: "Please log in to save items." };
    }

    const { data: existing } = await supabase
      .from("wishlists")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      safeRevalidatePath("/marketplace");
      return { success: true, isWishlisted: false };
    } else {
      await supabase
        .from("wishlists")
        .insert({ user_id: user.id, listing_id: listingId });
      safeRevalidatePath("/marketplace");
      return { success: true, isWishlisted: true };
    }
  }

  const isWishlisted = dataStore.toggleWishlist(listingId);
  safeRevalidatePath("/marketplace");
  return { success: true, isWishlisted };
}

/**
 * Server Action to record a view for a listing (deduplicated by viewer and date)
 */
export async function recordListingViewAction(listingId: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("listing_views")
        .insert({
          listing_id: listingId,
          viewer_id: user.id,
        })
        .select()
        .maybeSingle();
    }
  }
}

/**
 * Server Action to start or get a direct conversation regarding a listing
 */
export async function startDirectConversationAction(
  otherUserId: string,
  listingId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to chat with the seller." };
    }

    if (user.id === otherUserId) {
      return { success: false, error: "You cannot message yourself." };
    }

    const { data: convId, error } = await supabase.rpc("start_direct_conversation", {
      other_user_id: otherUserId,
      ref_type: "listing",
      ref_id: listingId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, conversationId: convId };
  }

  // Fallback to dataStore
  const convId = dataStore.startOrGetDirectConversation(
    otherUserId,
    "Seller Chat",
    "listing",
    listingId
  );
  return { success: true, conversationId: convId };
}

