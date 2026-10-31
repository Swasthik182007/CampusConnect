"use client";

import React from "react";
import { Heart, MapPin, BadgeCheck, Eye } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface LivePreviewProps {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  negotiable: boolean;
  images: string[];
  collegeName: string;
  sellerName: string;
  sellerVerified?: boolean;
}

export function LivePreview({
  title,
  description,
  category,
  condition,
  price,
  negotiable,
  images,
  collegeName,
  sellerName,
  sellerVerified = true,
}: LivePreviewProps) {
  const coverImage = images[0] || null;

  return (
    <div className="space-y-2 sticky top-6">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <Eye className="w-3.5 h-3.5 text-indigo-600" />
        <span>Live Marketplace Grid Preview</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-sm mx-auto">
        {/* Card Cover */}
        <div className="relative aspect-[16/11] bg-slate-100 overflow-hidden">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              Add a photo to see preview
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/80">
              {category || "Category"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/85 text-white">
              {condition || "Condition"}
            </span>
          </div>

          <button
            type="button"
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-slate-400"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-2">
          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
            {title || "Item title will appear here"}
          </h4>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {description || "Item description details will appear here..."}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {formatINR(price || 0)}
              </span>
              {negotiable && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Negotiable
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {collegeName || "Campus"}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0">
              {sellerName.charAt(0) || "U"}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 truncate">
              {sellerName || "You"}
            </span>
            {sellerVerified && (
              <BadgeCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-slate-400">Just now</span>
        </div>
      </div>
    </div>
  );
}

export const LiveListingPreview = LivePreview;

