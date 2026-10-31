"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatINR } from "@/lib/utils";
import { toggleWishlistAction } from "@/app/marketplace/actions";

export interface MarketplaceListingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  negotiable: boolean;
  images: string[];
  status: string;
  created_at: string;
  college_id?: string;
  college_short_name?: string;
  seller_id?: string;
  seller_name?: string;
  seller_verified?: boolean;
  is_wishlisted?: boolean;
  views_count?: number;
}

interface ListingCardProps {
  item: MarketplaceListingItem;
  onWishlistChange?: (id: string, isWishlisted: boolean) => void;
}

export function ListingCard({ item, onWishlistChange }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(item.is_wishlisted ?? false);
  const [isToggling, setIsToggling] = useState(false);

  const isSold = item.status === "sold";

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    // Optimistic toggle
    const previous = isWishlisted;
    setIsWishlisted(!previous);
    setIsToggling(true);

    try {
      const res = await toggleWishlistAction(item.id);
      if (res.success) {
        setIsWishlisted(res.isWishlisted);
        onWishlistChange?.(item.id, res.isWishlisted);
      } else {
        // Rollback on error
        setIsWishlisted(previous);
      }
    } catch {
      setIsWishlisted(previous);
    } finally {
      setIsToggling(false);
    }
  };

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    } catch {
      return "Recently";
    }
  }, [item.created_at]);

  return (
    <Link
      href={`/marketplace/${item.id}`}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
        isSold ? "opacity-85" : "hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* Cover Image Frame */}
        <div className="relative aspect-[16/11] bg-slate-100 overflow-hidden">
          {item.images && item.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No photo available
            </div>
          )}

          {/* Category & Condition Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-xs">
              {item.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/85 text-white backdrop-blur-xs">
              {item.condition}
            </span>
          </div>

          {/* Sold Ribbon */}
          {isSold && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                SOLD
              </span>
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleHeartClick}
            disabled={isToggling}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center transition-all z-20 ${
              isWishlisted
                ? "text-rose-500 fill-rose-500 scale-110"
                : "text-slate-400 hover:text-rose-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {formatINR(item.price)}
              </span>
              {item.negotiable && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Negotiable
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {item.college_short_name || "Campus"}
            </span>
          </div>
        </div>
      </div>

      {/* Seller & Timestamp Footer */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0">
            {item.seller_name?.charAt(0) || "S"}
          </div>
          <span className="text-[11px] font-semibold text-slate-700 truncate">
            {item.seller_name || "Student"}
          </span>
          {item.seller_verified && (
            <BadgeCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
        </div>
        <span className="text-[10px] text-slate-400 shrink-0">{timeAgo}</span>
      </div>
    </Link>
  );
}

