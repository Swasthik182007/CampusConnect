"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  UserCheck,
  PlusCircle,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ListingCard, MarketplaceListingItem } from "@/components/marketplace/listing-card";
import { dataStore } from "@/lib/data-store";

export default function WishlistPage() {
  const currentProfile = dataStore.getCurrentProfile();
  const wishlistedIds = dataStore.getWishlists();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const rawListings = dataStore.getListings();

  const savedItems: MarketplaceListingItem[] = useMemo(() => {
    return rawListings
      .filter((item) => wishlistedIds.includes(item.id) && !removedIds.has(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        price: item.price,
        negotiable: item.negotiable,
        images: item.images || [],
        status: item.status,
        created_at: item.created_at,
        college_id: item.college_id,
        college_short_name: item.college?.short_name || "Campus",
        seller_id: item.seller_id,
        seller_name: item.seller?.full_name || "Student Seller",
        seller_verified: item.seller?.is_verified ?? true,
        is_wishlisted: true,
      }));
  }, [rawListings, wishlistedIds, removedIds]);

  const handleWishlistChange = (id: string, isWishlisted: boolean) => {
    if (!isWishlisted) {
      setRemovedIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <AppShell
      title="Saved Items"
      subtitle="Items you bookmarked to buy or keep an eye on across campuses"
    >
      <div className="space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse</span>
            </Link>
            <Link
              href="/marketplace/wishlist"
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Saved Items ({savedItems.length})</span>
            </Link>
            <Link
              href="/marketplace/my-listings"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>My Listings</span>
            </Link>
          </div>

          <Link
            href="/marketplace/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Item</span>
          </Link>
        </div>

        {/* Content */}
        {savedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse textbooks, lab tools, scientific calculators, and electronics posted by students.
              Click the heart icon on any card to save it for later.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedItems.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

