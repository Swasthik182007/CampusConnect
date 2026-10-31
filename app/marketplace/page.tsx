"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Sparkles,
  ShoppingBag,
  Heart,
  UserCheck,
  Building2,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ListingCard, MarketplaceListingItem } from "@/components/marketplace/listing-card";
import { dataStore } from "@/lib/data-store";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { ListingCategory, ItemCondition } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const CATEGORIES: ("All" | ListingCategory)[] = [
  "All",
  "Books",
  "Notes",
  "Lab Equipment",
  "Electronics",
  "Furniture",
  "Others",
];

const CONDITIONS: ("All" | ItemCondition)[] = [
  "All",
  "New",
  "Like New",
  "Good",
  "Used",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "same_college_first", label: "My College First" },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initial states from URL params or sensible defaults
  const paramQ = searchParams?.get("q") || "";
  const paramCategory = (searchParams?.get("category") as any) || "All";
  const paramCondition = (searchParams?.get("condition") as any) || "All";
  const paramCollege = searchParams?.get("college") || "All";
  const paramMaxPrice = searchParams?.get("maxPrice") ? Number(searchParams?.get("maxPrice")) : 100000;
  const paramSort = searchParams?.get("sort") || "newest";

  const [search, setSearch] = useState(paramQ);
  const [debouncedSearch, setDebouncedSearch] = useState(paramQ);
  const [selectedCategory, setSelectedCategory] = useState<"All" | ListingCategory>(paramCategory);
  const [selectedCondition, setSelectedCondition] = useState<"All" | ItemCondition>(paramCondition);
  const [selectedCollege, setSelectedCollege] = useState<string>(paramCollege);
  const [maxPrice, setMaxPrice] = useState<number>(paramMaxPrice);
  const [sortBy, setSortBy] = useState<string>(paramSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [hasNewListings, setHasNewListings] = useState(false);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedCondition !== "All") params.set("condition", selectedCondition);
    if (selectedCollege !== "All") params.set("college", selectedCollege);
    if (maxPrice < 100000) params.set("maxPrice", maxPrice.toString());
    if (sortBy !== "newest") params.set("sort", sortBy);

    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  }, [debouncedSearch, selectedCategory, selectedCondition, selectedCollege, maxPrice, sortBy, pathname, router]);

  // Supabase Realtime channel listener for new listings
  useEffect(() => {
    const supabase = createClientSupabaseClient();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel("realtime_marketplace_feed")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "listings" },
          () => {
            setHasNewListings(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore if realtime is unsupported in offline mode
    }
  }, []);

  // Fetch / compute listings
  const rawListings = dataStore.getListings();
  const colleges = dataStore.getColleges();
  const currentProfile = dataStore.getCurrentProfile();

  // Normalize data to MarketplaceListingItem
  const allListings: MarketplaceListingItem[] = useMemo(() => {
    return rawListings.map((item) => ({
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
      is_wishlisted: item.is_wishlisted ?? false,
      views_count: 0,
    }));
  }, [rawListings]);

  // Filter & Sort
  const filteredListings = useMemo(() => {
    let result = allListings.filter((item) => {
      // Exclude soft-deleted/removed items from regular browse
      if (item.status === "removed") return false;

      // Category
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      // Condition
      if (selectedCondition !== "All" && item.condition !== selectedCondition) return false;

      // College
      if (selectedCollege !== "All" && item.college_id !== selectedCollege) return false;

      // Price
      if (item.price > maxPrice) return false;

      // Text Search
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.college_short_name && item.college_short_name.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });

    // Sorting: Sold items push to the bottom
    result.sort((a, b) => {
      if (a.status === "sold" && b.status !== "sold") return 1;
      if (b.status === "sold" && a.status !== "sold") return -1;

      if (sortBy === "price_low_high") {
        return a.price - b.price;
      }
      if (sortBy === "price_high_low") {
        return b.price - a.price;
      }
      if (sortBy === "same_college_first") {
        const aSame = a.college_id === currentProfile.college_id ? 1 : 0;
        const bSame = b.college_id === currentProfile.college_id ? 1 : 0;
        if (aSame !== bSame) return bSame - aSame;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [allListings, selectedCategory, selectedCondition, selectedCollege, maxPrice, debouncedSearch, sortBy, currentProfile.college_id]);

  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, pageSize);
  }, [filteredListings, pageSize]);

  const hasMore = displayedListings.length < filteredListings.length;

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSelectedCollege("All");
    setMaxPrice(100000);
    setSortBy("newest");
    setPageSize(12);
  };

  const handleRefreshNew = () => {
    setHasNewListings(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Active filter count (excluding defaults)
  const activeFiltersCount =
    (debouncedSearch.trim() ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedCondition !== "All" ? 1 : 0) +
    (selectedCollege !== "All" ? 1 : 0) +
    (maxPrice < 100000 ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <AppShell
      title="Student Marketplace"
      subtitle="Peer-to-peer student trading across Karnataka colleges • 0% commissions • Campus verified"
    >
      <div className="space-y-6">
        {/* Real-time New Listings Alert Banner */}
        {hasNewListings && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>New items were just posted by students at nearby campuses!</span>
            </div>
            <button
              onClick={handleRefreshNew}
              className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Listings</span>
            </button>
          </div>
        )}

        {/* Top Header Actions Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse ({filteredListings.length})</span>
            </Link>
            <Link
              href="/marketplace/wishlist"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved Items</span>
            </Link>
            <Link
              href="/marketplace/my-listings"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>My Listings</span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <Link
              href="/marketplace/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Item</span>
            </Link>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by textbook, subject, VTU semester, or equipment..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings"
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs shrink-0 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Filters:
            </span>

            {debouncedSearch.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                Search: &ldquo;{debouncedSearch}&rdquo;
                <button onClick={() => setSearch("")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCondition !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                Condition: {selectedCondition}
                <button onClick={() => setSelectedCondition("All")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCollege !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                Campus: {colleges.find((c) => c.id === selectedCollege)?.short_name || selectedCollege}
                <button onClick={() => setSelectedCollege("All")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {maxPrice < 100000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                Under {formatINR(maxPrice)}
                <button onClick={() => setMaxPrice(100000)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content Layout with Left Filter Sidebar & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Left Filters Sidebar */}
          <div className="hidden lg:block bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Category
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-indigo-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* College Campus Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                College Campus
              </label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                aria-label="Filter by College Campus"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Karnataka Campuses</option>
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.short_name} ({col.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-xs font-bold text-indigo-600 tabular-nums">
                  {maxPrice >= 100000 ? "Any Price" : formatINR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="100000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Max Price Filter"
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹200</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Item Condition
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedCondition === cond
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Listings Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-[16/11] bg-slate-200 rounded-xl w-full" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">No items matched your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Try adjusting the price range, switching campus locations, or removing specific condition filters.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    href="/marketplace/new"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                  >
                    Post First Item
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedListings.map((item) => (
                    <ListingCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Load More Pagination Button */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setPageSize((prev) => prev + 12)}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition-all hover:scale-[1.01]"
                    >
                      Load More Items ({filteredListings.length - displayedListings.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Slide-in Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Drawer Body */}
            <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          selectedCategory === cat
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile College */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Campus
                  </label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    aria-label="Filter by Campus (Mobile)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
                  >
                    <option value="All">All Karnataka Campuses</option>
                    {colleges.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.short_name} ({col.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Max Price */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Max Price
                    </label>
                    <span className="text-xs font-bold text-indigo-600">
                      {maxPrice >= 100000 ? "Any Price" : formatINR(maxPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="100000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    aria-label="Max Price Filter (Mobile)"
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Mobile Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Condition
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          selectedCondition === cond
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-6 border-t border-slate-100 flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Student Marketplace">
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading student marketplace...
          </div>
        </AppShell>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
