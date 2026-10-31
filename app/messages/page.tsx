"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  ShieldAlert,
  Ban,
  Check,
  CheckCheck,
  User,
  Users,
  Search,
  BadgeCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";
import { Conversation, Message } from "@/lib/types";
import { formatDateTime, getInitials } from "@/lib/utils";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const convParam = searchParams.get("conv");

  const conversations = dataStore.getConversations();
  const currentUserId = dataStore.getCurrentUserId();

  const [activeConvId, setActiveConvId] = useState<string>(
    convParam || (conversations[0]?.id || "conv-1")
  );
  const [inputText, setInputText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (convParam) {
      setActiveConvId(convParam);
    }
  }, [convParam]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = activeConv ? dataStore.getMessages(activeConv.id) : [];

  const otherParticipant = activeConv?.participants.find((p) => p.id !== currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConvId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentUrl.trim()) return;
    if (!activeConv) return;

    dataStore.sendMessage(activeConv.id, inputText.trim(), attachmentUrl.trim() || undefined);
    setInputText("");
    setAttachmentUrl("");
    setShowAttachInput(false);
  };

  const handleBlockUser = () => {
    if (otherParticipant && confirm(`Are you sure you want to block ${otherParticipant.full_name}?`)) {
      dataStore.blockUser(otherParticipant.id);
      alert(`${otherParticipant.full_name} has been blocked.`);
    }
  };

  return (
    <AppShell title="Direct & Group Messages" subtitle="Real-time campus communications with verified students">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden h-[calc(100vh-12rem)] flex flex-col md:flex-row">
        {/* Left Column: Conversation Roster */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">Conversations</h3>
            <p className="text-[11px] text-slate-500">Peer trade, tutoring, and squad chats</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active conversations yet.
              </div>
            ) : (
              conversations.map((c) => {
                const other = c.participants.find((p) => p.id !== currentUserId);
                const isSelected = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/80 border-r-2 border-indigo-600" : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 overflow-hidden">
                      {other?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={other.avatar_url} alt={other.full_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(c.title || other?.full_name || "User")
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {c.title || other?.full_name}
                        </p>
                        {c.unread_count && c.unread_count > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.last_message?.content || "Started conversation"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Window */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center overflow-hidden border border-indigo-200">
                  {otherParticipant?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={otherParticipant.avatar_url}
                      alt={otherParticipant.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(activeConv.title || "Chat")
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">
                      {activeConv.title || otherParticipant?.full_name}
                    </h4>
                    {otherParticipant?.is_verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {otherParticipant?.college?.short_name || "Karnataka Campus"} • Verified Student
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBlockUser}
                  title="Block User"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl"
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  title="Report User/Chat"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-3.5 text-xs shadow-xs ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                      {msg.attachment_url && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.attachment_url}
                            alt="Attachment"
                            className="max-h-48 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
              {showAttachInput && (
                <div className="mb-2">
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Attach public image URL..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachInput(!showAttachInput)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to peer..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400 text-xs">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="message"
        targetId={activeConvId}
        targetTitle={`Conversation with ${otherParticipant?.full_name || "User"}`}
      />
    </AppShell>
  );
}
