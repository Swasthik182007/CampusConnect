"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Send,
  Heart,
  MessageCircle,
  Pin,
  Image as ImageIcon,
  BadgeCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";
import { formatDateTime } from "@/lib/utils";

export default function CommunityFeedPage() {
  const params = useParams();
  const id = params?.id as string;

  const community = dataStore.getCommunityById(id);
  const posts = dataStore.getPostsByCommunity(id);
  const currentUserId = dataStore.getCurrentUserId();

  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [showImageInput, setShowImageInput] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ id: string; title: string }>({
    id: "",
    title: "",
  });

  if (!community) {
    return (
      <AppShell title="Community Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Community Not Found</h2>
          <Link
            href="/communities"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Communities
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    dataStore.createPost(community.id, newPostContent, newPostImage || undefined);
    setNewPostContent("");
    setNewPostImage("");
    setShowImageInput(false);
  };

  const handleToggleLike = (postId: string) => {
    dataStore.toggleLikePost(postId);
  };

  const handlePinPost = (postId: string) => {
    dataStore.togglePinPost(postId);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    dataStore.addPostComment(postId, text.trim());
    setCommentInput({ ...commentInput, [postId]: "" });
  };

  const handleOpenReport = (targetId: string, title: string) => {
    setReportingTarget({ id: targetId, title });
    setReportModalOpen(true);
  };

  return (
    <AppShell title={community.name} subtitle={`${community.category} • ${community.member_count} Members`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Communities</span>
        </Link>

        {/* Community Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/10">
                {community.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {community.name}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
                {community.description}
              </p>
            </div>

            <button
              onClick={() => dataStore.toggleCommunityMembership(community.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all self-start sm:self-center ${
                community.is_member
                  ? "bg-white/10 text-white border border-white/20 hover:bg-rose-600"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              }`}
            >
              {community.is_member ? "Member ✓" : "+ Join Community"}
            </button>
          </div>
        </div>

        {/* Create Post Form */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Share with Community Members
          </h3>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Ask a question, share coding tips, syllabus notes, or hackathon opportunities..."
              required
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400"
            />

            {showImageInput && (
              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="Optional photo URL (e.g. https://images.unsplash.com/...)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              />
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Add Image</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Update</span>
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No posts in this community yet. Be the first to start a conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4"
              >
                {/* Author & Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center overflow-hidden border border-indigo-200">
                      {post.author?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        post.author?.full_name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          {post.author?.full_name}
                        </span>
                        {post.author?.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.author?.college?.short_name || "VVCE"} • {formatDateTime(post.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.is_pinned && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-indigo-600" />
                        Pinned
                      </span>
                    )}
                    {community.is_admin && (
                      <button
                        onClick={() => handlePinPost(post.id)}
                        title="Toggle Pin"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenReport(post.id, post.content.slice(0, 30))}
                      title="Report Post"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt="Attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Like & Comment Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${
                      post.is_liked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? "fill-rose-600" : ""}`} />
                    <span>{post.likes_count} Likes</span>
                  </button>

                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count} Comments</span>
                  </span>
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {comment.author?.full_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={commentInput[post.id] || ""}
                    onChange={(e) =>
                      setCommentInput({ ...commentInput, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="post"
        targetId={reportingTarget.id}
        targetTitle={reportingTarget.title}
      />
    </AppShell>
  );
}
