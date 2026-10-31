"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  ShieldAlert,
  BadgeCheck,
  MapPin,
  Calendar,
  Share2,
  CheckCircle,
  Trash2,
  Edit,
  Tag,
  Eye,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { ListingCard } from "@/components/marketplace/listing-card";
import { dataStore } from "@/lib/data-store";
import {
  setListingStatusAction,
  removeListingAction,
  toggleWishlistAction,
  recordListingViewAction,
  startDirectConversationAction,
} from "@/app/marketplace/actions";
import { formatINR, formatDate } from "@/lib/utils";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const item = dataStore.getListingById(id);
  const currentProfile = dataStore.getCurrentProfile();
  const currentUserId = currentProfile?.id;
  const isStaff = currentProfile?.role === "admin" || currentProfile?.role === "moderator";

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize selected image & wishlist state
  useEffect(() => {
    if (item) {
      if (item.images && item.images.length > 0) {
        setSelectedImage(item.images[0]);
      }
      setIsWishlisted(item.is_wishlisted ?? false);

      // Record view (deduplicated on backend)
      if (item.seller_id !== currentUserId) {
        recordListingViewAction(item.id).catch(() => {});
      }
    }
  }, [item, currentUserId]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen || !item?.images?.length) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : item.images.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < item.images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, item?.images]);

  if (!item) {
    return (
      <AppShell title="Listing Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
          <p className="text-xs text-slate-500">
            This item may have been removed or does not exist.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </AppShell>
    );
  }

  const isSeller = item.seller_id === currentUserId;

  // Soft-delete protection: only seller and staff can see removed items
  if (item.status === "removed" && !isSeller && !isStaff) {
    return (
      <AppShell title="Listing Removed">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto font-bold text-xl">
            ✕
          </div>
          <h2 className="text-xl font-bold text-slate-900">Listing No Longer Available</h2>
          <p className="text-xs text-slate-500">
            This listing was removed by the seller or community moderators.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            Browse Other Listings
          </Link>
        </div>
      </AppShell>
    );
  }

  // Related listings (same college or category, active status)
  const relatedListings = dataStore
    .getListings()
    .filter(
      (l) =>
        l.id !== item.id &&
        l.status === "active" &&
        (l.category === item.category || l.college_id === item.college_id)
    )
    .slice(0, 3)
    .map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      condition: l.condition,
      price: l.price,
      negotiable: l.negotiable,
      images: l.images || [],
      status: l.status,
      created_at: l.created_at,
      college_id: l.college_id,
      college_short_name: l.college?.short_name || "Campus",
      seller_id: l.seller_id,
      seller_name: l.seller?.full_name || "Student Seller",
      seller_verified: l.seller?.is_verified ?? true,
      is_wishlisted: l.is_wishlisted ?? false,
    }));

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist) return;
    const previous = isWishlisted;
    setIsWishlisted(!previous);
    setIsTogglingWishlist(true);

    try {
      const res = await toggleWishlistAction(item.id);
      if (res.success) {
        setIsWishlisted(res.isWishlisted);
      } else {
        setIsWishlisted(previous);
      }
    } catch {
      setIsWishlisted(previous);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleToggleSoldStatus = async () => {
    setIsStatusUpdating(true);
    setStatusMessage(null);
    const newStatus = item.status === "sold" ? "active" : "sold";
    try {
      const res = await setListingStatusAction(item.id, newStatus);
      if (res.success) {
        item.status = newStatus;
        setStatusMessage(
          newStatus === "sold"
            ? "Listing marked as Sold! Other students will see the SOLD badge."
            : "Listing restored to Active! Visible to all students."
        );
      } else {
        setStatusMessage(res.error || "Failed to update listing status.");
      }
    } catch {
      setStatusMessage("Failed to update listing status.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!confirm("Are you sure you want to remove this listing? It will no longer be visible to students.")) {
      return;
    }
    setIsStatusUpdating(true);
    try {
      const res = await removeListingAction(item.id, "Removed by seller");
      if (res.success) {
        router.push("/marketplace");
      } else {
        alert(res.error || "Failed to delete listing.");
      }
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleChatWithSeller = async () => {
    try {
      const res = await startDirectConversationAction(item.seller_id, item.id);
      if (res.success && res.conversationId) {
        router.push(`/messages?conv=${res.conversationId}`);
      } else {
        alert(res.error || "Unable to start conversation.");
      }
    } catch {
      alert("Unable to start conversation. Please try again.");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLightboxAt = (imgUrl: string) => {
    const idx = (item.images || []).indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  return (
    <AppShell title={item.title} subtitle={`${item.category} • ${item.college?.name || "Campus"}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Removed or Sold Banner Notice */}
        {item.status === "removed" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <span>
              ⚠️ This listing has been marked as <strong>Removed</strong>. It is only visible to you
              and staff administrators.
            </span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium">
            {statusMessage}
          </div>
        )}

        {/* Main Grid: Gallery & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Image Frame with Lightbox trigger */}
            <div
              className="relative aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in group"
              onClick={() => openLightboxAt(selectedImage)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              {item.status === "sold" && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-6 py-2 rounded-full bg-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-xl">
                    ITEM SOLD
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? "border-indigo-600 scale-105 shadow-md"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Full Item Description */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                Product Description & Condition
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* View Counter for Seller */}
              {isSeller && (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span>
                    This listing has been viewed by <strong>14 students</strong> across campuses.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Seller Info (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Price Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {item.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {item.condition}
                </span>
              </div>

              <div>
                <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatINR(item.price)}
                </p>
                {item.negotiable ? (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    ✓ Price is negotiable
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Fixed price
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{item.college?.name || "Campus Handoff"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Posted {formatDate(item.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isSeller ? (
                  <>
                    <button
                      onClick={handleChatWithSeller}
                      disabled={item.status === "sold"}
                      className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 ${
                        item.status === "sold"
                          ? "bg-slate-400 cursor-not-allowed shadow-none"
                          : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.status === "sold" ? "Item Already Sold" : "Chat with Seller"}</span>
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      disabled={isTogglingWishlist}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition-all flex items-center justify-center gap-2 ${
                        isWishlisted
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      <span>{isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 text-center">
                      Seller Controls
                    </p>
                    <Link
                      href={`/marketplace/${item.id}/edit`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                      <span>Edit Listing Details</span>
                    </Link>
                    <button
                      onClick={handleToggleSoldStatus}
                      disabled={isStatusUpdating}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center justify-center gap-2 transition-colors ${
                        item.status === "sold"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {item.status === "sold" ? (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Reactivate Listing</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as Sold</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDeleteListing}
                      disabled={isStatusUpdating}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Listing</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Profile Card with Privacy Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                Seller Information
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                  {item.seller?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.seller.avatar_url}
                      alt={item.seller.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    item.seller?.full_name?.charAt(0) || "S"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {item.seller?.full_name}
                    </p>
                    {item.seller?.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {item.seller?.branch || "Engineering Student"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <p>
                  <strong className="text-slate-800">Campus:</strong>{" "}
                  {item.seller?.college?.short_name || "VVCE"}
                </p>
                {/* Privacy: show phone only if seller permits */}
                {item.seller?.show_phone && item.seller.phone && (
                  <p>
                    <strong className="text-slate-800">Phone:</strong> {item.seller.phone}
                  </p>
                )}
                {/* Privacy: show email only if seller permits */}
                {item.seller?.show_email && item.seller.email && (
                  <p>
                    <strong className="text-slate-800">Email:</strong> {item.seller.email}
                  </p>
                )}
              </div>

              <Link
                href={`/profile/${item.seller_id}`}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 block text-center transition-colors"
              >
                View Full Student Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Listings Carousel / Row */}
        {relatedListings.length > 0 && (
          <div className="pt-8 space-y-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Similar Listings You Might Like</h3>
                <p className="text-xs text-slate-500">
                  More active items in {item.category} or nearby Karnataka campuses
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedListings.map((rel) => (
                <ListingCard key={rel.id} item={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {lightboxOpen && item.images && item.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          {/* Top Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          {item.images.length > 1 && (
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : item.images.length - 1))
              }
              className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Previous (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Center Image */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white/70 text-xs font-semibold mt-3">
              Photo {lightboxIndex + 1} of {item.images.length}
            </p>
          </div>

          {/* Right Arrow */}
          {item.images.length > 1 && (
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev < item.images.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Next (Right arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="listing"
        targetId={item.id}
        targetTitle={item.title}
      />
    </AppShell>
  );
}
