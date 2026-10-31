"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Mail,
  Loader2,
  Building,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { listingSchema, ListingFormValues, listingCategories, itemConditions } from "@/lib/validations/listing";
import { ImageUploader } from "@/components/marketplace/image-uploader";
import { LivePreview } from "@/components/marketplace/live-preview";
import { createListingAction } from "@/app/marketplace/actions";
import { formatINR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function PostNewListingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const colleges = dataStore.getColleges();
  const supabase = createClient();

  // Stable client-side UUID for this new listing
  const [listingId] = useState(() => crypto.randomUUID());
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const collegeName =
    user?.college?.name ||
    colleges.find((c) => c.id === user?.college_id)?.name ||
    "Karnataka College Campus";

  const isVerified = user?.is_verified ?? true;
  const isSuspended = user?.is_suspended ?? false;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      category: "Books",
      condition: "Like New",
      price: 350,
      negotiable: true,
      description: "",
      images: [],
    },
  });

  const watchTitle = watch("title") || "";
  const watchDescription = watch("description") || "";
  const watchCategory = watch("category");
  const watchCondition = watch("condition");
  const watchPrice = watch("price");
  const watchNegotiable = watch("negotiable");

  // Sync uploaded images with form validation
  useEffect(() => {
    setValue("images", uploadedImages, { shouldValidate: true });
  }, [uploadedImages, setValue]);

  // Auth & Suspended check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login?next=/marketplace/new");
      }
    }
  }, [user, authLoading, router]);

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    setResendStatus("Sending confirmation link...");
    if (supabase) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      if (error) {
        setResendStatus("Failed to send link. Please check your network.");
      } else {
        setResendStatus("Confirmation link sent to your institutional inbox!");
      }
    } else {
      setTimeout(() => {
        setResendStatus("Demo mode: institutional email simulated as confirmed.");
      }, 800);
    }
  };

  const onSubmit = async (values: ListingFormValues) => {
    if (!isVerified) {
      setServerError("Please confirm your email address before publishing items.");
      return;
    }
    if (isSuspended) {
      setServerError("Your account is suspended. You cannot create new listings.");
      return;
    }

    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createListingAction({
        id: listingId,
        title: values.title,
        description: values.description,
        category: values.category,
        condition: values.condition,
        price: Number(values.price),
        negotiable: values.negotiable,
        images: values.images,
      });

      if (res.success && res.listingId) {
        router.push(`/marketplace/${res.listingId}`);
      } else {
        // If insert failed, clean up any uploaded images from storage bucket
        if (supabase && user?.id) {
          try {
            const filesToRemove = values.images.map((url) => {
              const parts = url.split("listing-images/");
              return parts[1] || "";
            }).filter(Boolean);
            if (filesToRemove.length > 0) {
              await supabase.storage.from("listing-images").remove(filesToRemove);
            }
          } catch (cleanErr) {
            console.warn("Storage cleanup error:", cleanErr);
          }
        }
        setServerError(res.error || "Failed to create listing. Please try again.");
      }
    } catch {
      setServerError("An unexpected error occurred while publishing your listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty || uploadedImages.length > 0) {
      setShowCancelDialog(true);
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <AppShell
      title="Post an Item"
      subtitle="Publish engineering notes, textbooks, and equipment to fellow students"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/marketplace"
          onClick={handleCancelClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Unverified Email Warning Banner */}
        {!isVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Confirm your email to post items
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  To protect campus safety and maintain trust, only verified students can post marketplace listings.
                </p>
                {resendStatus && (
                  <p className="text-[11px] font-semibold text-indigo-700 mt-1">
                    {resendStatus}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResendConfirmation}
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 shrink-0 transition-colors"
            >
              Resend Confirmation Email
            </button>
          </div>
        )}

        {/* Server Validation Error Toast */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Could not publish item:</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Two-Column Form Layout: Form on Left (7 cols), Live Preview on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Item Information
                </h2>
                <p className="text-xs text-slate-500">
                  Accurate details help students on your campus find and buy your item quickly.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              {/* Photo Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Item Photos <span className="text-rose-500">*</span>
                </label>
                <ImageUploader
                  userId={user?.id || "usr-current"}
                  listingId={listingId}
                  images={uploadedImages}
                  onChange={setUploadedImages}
                  disabled={!isVerified || submitting}
                />
                {errors.images && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1.5">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* Title with Character Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Listing Title <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      watchTitle.length < 5 || watchTitle.length > 100
                        ? "text-slate-400"
                        : "text-indigo-600"
                    }`}
                  >
                    {watchTitle.length}/100 chars
                  </span>
                </div>
                <input
                  type="text"
                  {...register("title")}
                  disabled={!isVerified || submitting}
                  placeholder="e.g. Higher Engineering Mathematics (B.S. Grewal 44th Ed.)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
                {errors.title && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("category")}
                    disabled={!isVerified || submitting}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium disabled:bg-slate-50"
                  >
                    {listingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Item Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("condition")}
                    disabled={!isVerified || submitting}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium disabled:bg-slate-50"
                  >
                    {itemConditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      {errors.condition.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Price & Negotiable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Price in ₹ <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">
                      Preview: {formatINR(watchPrice || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="10"
                      {...register("price", { valueAsNumber: true })}
                      disabled={!isVerified || submitting}
                      className="w-full pl-8 pr-3 py-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold tabular-nums disabled:bg-slate-50"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 sm:pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("negotiable")}
                      disabled={!isVerified || submitting}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Price is negotiable
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Shows a "Negotiable" badge on your card
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pickup Location (Read-Only from profile) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Pickup Location (Campus Handoff)
                </label>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                  <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold">{collegeName}</span>
                  <span className="ml-auto text-[10px] text-slate-400">
                    Auto-set from your student profile
                  </span>
                </div>
              </div>

              {/* Description with Character Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      watchDescription.length < 10 || watchDescription.length > 1000
                        ? "text-slate-400"
                        : "text-indigo-600"
                    }`}
                  >
                    {watchDescription.length}/1000 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  {...register("description")}
                  disabled={!isVerified || submitting}
                  placeholder="Mention edition, completeness of notes, condition, preferred pickup spot (e.g. campus cafeteria, library, hostel lobby)..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400 disabled:bg-slate-50"
                />
                {errors.description && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isVerified || submitting}
                  className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Listing...</span>
                    </>
                  ) : (
                    <span>Publish Listing →</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Grid Preview */}
          <div className="lg:col-span-5">
            <LivePreview
              title={watchTitle}
              description={watchDescription}
              category={watchCategory}
              condition={watchCondition}
              price={watchPrice}
              negotiable={watchNegotiable}
              images={uploadedImages}
              collegeName={user?.college?.short_name || "VVCE"}
              sellerName={user?.full_name || "You"}
              sellerVerified={isVerified}
            />
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Discard unsaved listing?
            </h3>
            <p className="text-xs text-slate-500">
              You have unsaved changes and uploaded photos. Leaving now will discard this draft.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
