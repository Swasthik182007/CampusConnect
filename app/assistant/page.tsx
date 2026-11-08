"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Code2,
  FolderGit2,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  BrainCircuit,
  Wand2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";

interface AssistantMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  projectIdea?: {
    title: string;
    description: string;
    features: string[];
    techStack: string[];
    tags: string[];
  };
  timestamp: string;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial conversation containing blueprint Showcase Idea: KrishiMitra AI
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Namaskara! I am your CampusConnect AI Student Assistant. Ask me anything about engineering mini-projects, hackathons (SIH / Karnataka Innovation Network), VTU exam revision, tech stacks, or placements in Karnataka.",
      timestamp: "Just now",
    },
    {
      id: "msg-krishimitra-prompt",
      sender: "user",
      text: "Generate a project idea for smart farming in Karnataka.",
      timestamp: "Just now",
    },
    {
      id: "msg-krishimitra-resp",
      sender: "assistant",
      text: "Here is an innovation project idea tailored for Karnataka agricultural conditions and hackathons like SIH & Karnataka Student Hackathon 2025:",
      projectIdea: {
        title: "KrishiMitra AI - Smart Farming Assistant for Karnataka",
        description:
          "An integrated edge & mobile AI system enabling smallholder farmers across Mandya, Mysuru, and Hassan to detect crop diseases from leaf photos, optimize drip irrigation schedules, and track local APMC Mandi prices in Kannada.",
        features: [
          "Crop disease detection using MobileNet/CNN (Paddy, Ragi, Sugarcane)",
          "Micro-climate smart irrigation recommendation using ESP32 soil moisture sensors",
          "Real-time Karnataka Mandi price tracker & APMC market insights in Kannada",
          "Government scheme advisor (K-Tech, Raitha Siri, PM-Kisan) with voice search",
        ],
        techStack: ["Python", "TensorFlow", "FastAPI", "React", "MongoDB", "ESP32 IoT"],
        tags: ["AI", "AgriTech", "IoT", "Karnataka Innovation"],
      },
      timestamp: "Just now",
    },
  ]);

  const quickPrompts = [
    "Generate a project idea for smart farming in Karnataka.",
    "Recommend SIH 2026 problem statements for 3rd sem CSE.",
    "Explain Dijkstra's vs Bellman-Ford algorithm simply.",
    "Suggest roadmap for Bosch / Infosys campus placements.",
    "How to build an AI-based Waste Sorting system with Raspberry Pi?",
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let resp: AssistantMessage;
      const lower = promptText.toLowerCase();

      if (lower.includes("waste") || lower.includes("sorting")) {
        resp = {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: "Here is an end-to-end blueprint for your waste segregation squad:",
          projectIdea: {
            title: "AI-based Waste Sorting System",
            description:
              "Computer vision powered robotic waste classifier deployed at cafeteria disposal points to classify dry recyclables, compostable wet waste, and e-waste with student reward points.",
            features: [
              "YOLOv8 custom trained object detection on 10,000+ Karnataka campus cafeteria items",
              "Dual-servo motor flipper mechanism driven by Raspberry Pi 4",
              "QR Code student gamification portal rewarding responsible waste disposal",
              "IoT weight sensors alerting campus maintenance staff when bins are full",
            ],
            techStack: ["Python", "Machine Learning", "PyTorch", "React", "IoT", "FastAPI"],
            tags: ["AI", "Computer Vision", "IoT", "Sustainability"],
          },
          timestamp: "Just now",
        };
      } else if (lower.includes("sih") || lower.includes("hackathon")) {
        resp = {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: "For Smart India Hackathon (SIH 2026) and Karnataka Student Hackathons, evaluators prioritize real-world state impact, clean architecture, and working prototypes. Focus on AgriTech, Smart Healthcare, or Vernacular EdTech.",
          projectIdea: {
            title: "GraminHealth AI - Telemedicine Triage for Rural Karnataka",
            description:
              "Offline-first primary health screening kiosk for Gram Panchayats with Kannada speech recognition, vitals recording, and instant triage alerts to district PHCs.",
            features: [
              "Kannada speech-to-text symptom intake using Whisper fine-tuned for local dialects",
              "Vital sign extraction via low-cost pulse oximeter and digital BP monitors",
              "Automated medical triaging and referral ticket routing to nearest district hospital",
            ],
            techStack: ["Next.js", "Python", "Whisper AI", "PostgreSQL", "WebRTC"],
            tags: ["AI", "HealthTech", "SIH 2026"],
          },
          timestamp: "Just now",
        };
      } else if (lower.includes("placement") || lower.includes("bosch") || lower.includes("infosys")) {
        resp = {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: "🎯 **Karnataka Campus Placement Roadmap (Bosch / Infosys / Tier-1):**\n\n1. **Core DSA**: Practice 150 standard LeetCode problems (Arrays, HashMaps, Two-Pointers, Trees, Graphs, DP). Swarna N. at VVCE offers 1-on-1 peer tutoring on CampusConnect!\n2. **CS Fundamentals**: Prepare VTU OS (Paging, Threading), DBMS (Normalization, Indexing, Transactions), and Computer Networks (TCP/IP 3-way handshake).\n3. **Projects**: Showcase 2 high-quality team projects with deployed URLs and GitHub code (e.g. KrishiMitra AI or AI Waste Sorting).\n4. **ATS Resume**: Use CampusConnect's AI Resume Builder to generate a verified ATS-compliant CV in 1-click!",
          timestamp: "Just now",
        };
      } else {
        resp = {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: `Great query! To tackle "${promptText}", begin by breaking it down into modular architecture layers:\n\n• **Data Layer**: Clean VTU syllabus/state datasets\n• **Core Engine**: Python/Node.js microservice\n• **Student Experience**: Responsive React/Tailwind frontend\n\nYou can also find skilled teammates on CampusConnect's Smart Teammate Matcher to collaborate on this project!`,
          timestamp: "Just now",
        };
      }

      setMessages((prev) => [...prev, resp]);
      setLoading(false);
    }, 600);
  };

  const handleCreateSquadFromIdea = (idea: NonNullable<AssistantMessage["projectIdea"]>) => {
    const newProj = dataStore.createProject({
      title: idea.title,
      description: idea.description,
      skills: idea.techStack,
      tags: idea.tags,
      team_size: 4,
      hackathon_url: "https://karnatakahackathon2025.in",
    });
    alert(`Project Squad created: "${idea.title}". Redirecting to squad workspace...`);
    router.push(`/projects/${newProj.id}`);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell
      title="AI Student Assistant 🤖"
      subtitle="Ask anything about projects, tech, study, or careers in Karnataka"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 shadow-xl border border-indigo-700/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Powered by Gemini & Karnataka Student Knowledge Graph</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                AI Innovation & Academic Mentor
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                Generate hackathon ideas, debug complex VTU assignments, discover trending tech stacks, and auto-convert concepts into active project squads.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <BrainCircuit className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
        </div>

        {/* Quick Prompt Suggestions */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Suggested Karnataka Student Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs text-slate-700 hover:text-indigo-700 font-medium transition-all shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="space-y-4 min-h-[400px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                  msg.sender === "user" ? "bg-indigo-600" : "bg-slate-900 border border-slate-700"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-indigo-400" />
                )}
              </div>

              <div className="max-w-[85%] sm:max-w-[75%] space-y-3">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-sm"
                      : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Structured Project Idea Card (Matching Blueprint Sheet 2 Screen 1) */}
                {msg.projectIdea && (
                  <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                          AI Generated Project Concept
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                          {msg.projectIdea.title}
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            msg.id,
                            `${msg.projectIdea?.title}\n${msg.projectIdea?.description}`
                          )
                        }
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Copy Idea"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {msg.projectIdea.description}
                    </p>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Key Features & Capabilities:
                      </h4>
                      <ul className="space-y-1.5">
                        {msg.projectIdea.features.map((feat, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Recommended Tech Stack:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.projectIdea.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-1.5">
                        {msg.projectIdea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleCreateSquadFromIdea(msg.projectIdea!)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
                      >
                        <FolderGit2 className="w-4 h-4" />
                        <span>Convert into Project Squad →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-xs text-slate-500 font-medium ml-1">
                  AI Assistant thinking...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="sticky bottom-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt(input);
              }
            }}
            placeholder="Ask about project ideas, tech stacks, Karnataka hackathons, or VTU subjects..."
            className="flex-1 text-xs sm:text-sm bg-transparent px-3 py-1 focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={() => handleSendPrompt(input)}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

