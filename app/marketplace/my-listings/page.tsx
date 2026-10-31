"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  ShoppingBag,
  Heart,
  UserCheck,
  Eye,
  Edit,
  CheckCircle,
  RotateCcw,
  Trash2,
  ExternalLink,
  Tag,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { setListingStatusAction, removeListingAction } from "@/app/marketplace/actions";
import { formatINR, formatDate } from "@/lib/utils";

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "removed">("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentProfile = dataStore.getCurrentProfile();
  const allListings = dataStore.getListings().filter((l) => l.seller_id === currentProfile.id);

  const activeItems = allListings.filter((l) => l.status === "active");
  const soldItems = allListings.filter((l) => l.status === "sold");
  const removedItems = allListings.filter((l) => l.status === "removed");

  const displayedItems =
    activeTab === "active" ? activeItems : activeTab === "sold" ? soldItems : removedItems;

  const handleToggleSold = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    const newStatus = currentStatus === "sold" ? "active" : "sold";
    try {
      await setListingStatusAction(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this listing? It will no longer be visible to buyers.")) {
      return;
    }
    setUpdatingId(id);
    try {
      await removeListingAction(id, "Removed by seller");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppShell
      title="My Listings"
      subtitle="Manage your posted textbooks, electronics, and lab equipment across campuses"
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
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved Items</span>
            </Link>
            <Link
              href="/marketplace/my-listings"
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>My Listings ({allListings.length})</span>
            </Link>
          </div>

          <Link
            href="/marketplace/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
        </div>

        {/* Status Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Active Listings</span>
            <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 text-[10px] flex items-center justify-center font-bold">
              {activeItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "sold"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Sold</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
              {soldItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("removed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "removed"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Removed</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
              {removedItems.length}
            </span>
          </button>
        </div>

        {/* Listings List */}
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {activeTab === "active"
                ? "No active listings right now"
                : activeTab === "sold"
                ? "No sold items yet"
                : "No removed listings"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeTab === "active"
                ? "Have textbooks, drawing tools, calculators, or lab kits you no longer use? List them here for students at your campus."
                : activeTab === "sold"
                ? "When you find a student buyer, mark the item as sold to track your completed campus sales."
                : "Listings you remove will be safely archived here."}
            </p>
            {activeTab === "active" && (
              <Link
                href="/marketplace/new"
                className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                Post an Item Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.images?.[0] ||
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-white">
                        {item.condition}
                      </span>
                    </div>

                    {item.status === "sold" && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatINR(item.price)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      <span>14 student views</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/marketplace/${item.id}`}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/marketplace/${item.id}/edit`}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                    title="Edit Item"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {item.status !== "removed" && (
                    <button
                      onClick={() => handleToggleSold(item.id, item.status)}
                      disabled={updatingId === item.id}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1 ${
                        item.status === "sold"
                          ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {item.status === "sold" ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Sold</span>
                        </>
                      )}
                    </button>
                  )}

                  {item.status !== "removed" && (
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updatingId === item.id}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Remove Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

