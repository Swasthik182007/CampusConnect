"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ImageUploader } from "@/components/marketplace/image-uploader";
import { LiveListingPreview } from "@/components/marketplace/live-preview";
import { updateListingAction } from "@/app/marketplace/actions";
import { listingSchema } from "@/lib/validations/listing";
import { dataStore } from "@/lib/data-store";
import { ListingCategory, ItemCondition } from "@/lib/types";

const CATEGORIES: ListingCategory[] = [
  "Books",
  "Notes",
  "Lab Equipment",
  "Electronics",
  "Furniture",
  "Others",
];

const CONDITIONS: ItemCondition[] = ["New", "Like New", "Good", "Used"];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const currentProfile = dataStore.getCurrentProfile();
  const item = dataStore.getListingById(id);

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [category, setCategory] = useState<ListingCategory>(item?.category || "Books");
  const [condition, setCondition] = useState<ItemCondition>(item?.condition || "Good");
  const [price, setPrice] = useState<number | string>(item?.price ?? 500);
  const [negotiable, setNegotiable] = useState(item?.negotiable ?? true);
  const [images, setImages] = useState<string[]>(item?.images || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setCategory(item.category);
      setCondition(item.condition);
      setPrice(item.price);
      setNegotiable(item.negotiable);
      setImages(item.images || []);
    }
  }, [item]);

  if (!item) {
    return (
      <AppShell title="Listing Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
          <p className="text-xs text-slate-500">The listing you want to edit does not exist.</p>
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

  const isSeller = item.seller_id === currentProfile.id;
  const isStaff = currentProfile.role === "admin" || currentProfile.role === "moderator";

  if (!isSeller && !isStaff) {
    return (
      <AppShell title="Unauthorized">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto font-bold text-lg">
            ✕
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500">Only the seller or campus staff can edit this listing.</p>
          <Link
            href={`/marketplace/${item.id}`}
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            View Listing
          </Link>
        </div>
      </AppShell>
    );
  }

  const numericPrice = typeof price === "number" ? price : parseFloat(price) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      description,
      category,
      condition,
      price: numericPrice,
      negotiable,
      images,
    };

    const parsed = listingSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      setErrorMessage("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateListingAction(item.id, payload);
      if (res.success) {
        router.push(`/marketplace/${item.id}`);
      } else {
        setErrorMessage(res.error || "Failed to update listing.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Edit Listing" subtitle={`Update details for "${item.title}"`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href={`/marketplace/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back to Listing</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Listing Details
            </h2>

            {/* Images Uploader */}
            <div>
              <ImageUploader
                images={images}
                onChange={setImages}
                error={fieldErrors.images}
                listingId={item.id}
                userId={currentProfile.id}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 ${
                  fieldErrors.title ? "border-rose-400" : "border-slate-200"
                }`}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>{fieldErrors.title ? <span className="text-rose-500">{fieldErrors.title}</span> : "Between 5 and 100 characters"}</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ListingCategory)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Condition <span className="text-rose-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Negotiable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Price (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold ${
                      fieldErrors.price ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                </div>
                {fieldErrors.price && (
                  <p className="text-[10px] text-rose-500 mt-1">{fieldErrors.price}</p>
                )}
              </div>

              <div className="pt-5 sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Open to price negotiation
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={1000}
                className={`w-full p-4 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 ${
                  fieldErrors.description ? "border-rose-400" : "border-slate-200"
                }`}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>{fieldErrors.description ? <span className="text-rose-500">{fieldErrors.description}</span> : "Between 10 and 1000 characters"}</span>
                <span>{description.length}/1000</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href={`/marketplace/${item.id}`}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <LiveListingPreview
              title={title}
              description={description}
              category={category}
              condition={condition}
              price={numericPrice}
              negotiable={negotiable}
              images={images}
              collegeName={currentProfile.college?.short_name || "Campus"}
              sellerName={currentProfile.full_name}
            />
          </div>
        </form>
      </div>
    </AppShell>
  );
}

