import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "../components/Badge";
import { askAIAssistant } from "../api";
import { useSchemeContext } from "../context/SchemeContext";
import {
  Sparkles, Send, User, Bot, ArrowRight, Info,
  GraduationCap, Tractor, Heart, Plus, Clock
} from "lucide-react";

const SUGGESTIONS = [
  { text: "Scholarships for engineering students in Uttar Pradesh", icon: GraduationCap },
  { text: "Welfare benefits for farmers with agricultural land", icon: Tractor },
  { text: "Startup capital or bank loans for women entrepreneurs", icon: Heart },
];

// Renders AI markdown with proper formatting
function AIMessageContent({ text }) {
  return (
    <div className="prose-ai">
      {text.split("\n").map((line, li) => {
        if (line.startsWith("### ")) {
          return <h3 key={li} className="text-sm font-black text-primary mt-3 mb-1 first:mt-0">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={li} className="text-[15px] font-black text-ink mt-3 mb-1">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("* **") || line.startsWith("- **") || line.startsWith("*   **") || line.startsWith("-   **")) {
          const content = line.replace(/^[*-]\s+/, "");
          const parts = content.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={li} className="ml-2 mb-1 flex gap-1.5 items-start text-sm">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="font-extrabold text-ink">{p}</strong> : p)}</span>
            </p>
          );
        }
        if (line.match(/^\s{4}\d+\./)) {
          return <p key={li} className="ml-6 mb-0.5 text-xs font-medium text-sub">{line.trim()}</p>;
        }
        if (line.match(/^\s{4}-/)) {
          return <p key={li} className="ml-6 mb-0.5 text-xs font-medium text-sub flex gap-1.5"><span>–</span><span>{line.replace(/^\s+-\s*/, "")}</span></p>;
        }
        if (line.trim() === "") return <div key={li} className="h-2" />;
        const boldParts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={li} className="mb-1 text-sm leading-relaxed">
            {boldParts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="font-extrabold text-ink">{p}</strong> : p)}
          </p>
        );
      })}
    </div>
  );
}

// Typing dots indicator
function TypingIndicator() {
  return (
    <div className="flex gap-3.5 justify-start">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
        <Bot size={16} />
      </div>
      <div className="flex items-center gap-1.5 bg-white border border-line/70 rounded-3xl rounded-tl-sm px-5 py-3.5 shadow-sm">
        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
      </div>
    </div>
  );
}

export default function Assistant() {
  const { profile } = useSchemeContext();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! I am your YojanaSetu AI Assistant. Describe your situation in plain text — including your age, location, occupation, or income — and I will find eligible schemes for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await askAIAssistant(text, profile);
      setMessages((m) => [...m, { role: "assistant", text: res.reply, schemes: res.schemes }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I encountered an issue connecting to the database. Please verify your connection and try again." }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-bg overflow-hidden">

      {/* Optional left sidebar on large screens */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-r border-line/60 bg-white p-5 gap-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot size={16} />
          </div>
          <div>
            <p className="text-sm font-black text-ink">AI Assistant</p>
            <p className="text-[10px] font-medium text-sub">Powered by Gemini</p>
          </div>
        </div>

        {/* New chat button */}
        <button
          onClick={() => setMessages([{ role: "assistant", text: "Namaste! I am your YojanaSetu AI Assistant. Describe your situation in plain text — including your age, location, occupation, or income — and I will find eligible schemes for you." }])}
          className="flex items-center gap-2 w-full rounded-xl border border-dashed border-line hover:border-primary/30 hover:bg-primaryTint/20 text-sub hover:text-primary px-4 py-2.5 text-xs font-bold transition-all"
        >
          <Plus size={14} /> New Conversation
        </button>

        {/* Suggested questions section */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1">
            <Info size={11} /> Suggested Topics
          </p>
          <div className="space-y-1.5">
            {[
              "Scholarship schemes for students",
              "Agricultural subsidies for farmers",
              "Women entrepreneurship schemes",
              "Housing loan benefits",
              "Disability support programs",
            ].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="w-full text-left rounded-xl border border-line/60 bg-slate-50/60 hover:bg-primaryTint/30 hover:border-primary/20 px-3 py-2.5 text-xs font-medium text-sub hover:text-primary transition-all leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-auto">
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
              AI responses are informational. Always verify eligibility on official government portals before applying.
            </p>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Chat header */}
        <div className="shrink-0 flex items-center justify-between border-b border-line/60 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm xl:hidden">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-ink flex items-center gap-1.5">
                <Sparkles size={15} className="text-secondary animate-pulse" />
                YojanaSetu AI
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-medium text-sub">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 rounded-full px-3 py-1 border border-line/60">
              AI Engine v2.0
            </span>
            {messages.length > 1 && (
              <button
                onClick={() => setMessages([{ role: "assistant", text: "Namaste! I am your YojanaSetu AI Assistant. Describe your situation in plain text — including your age, location, occupation, or income — and I will find eligible schemes for you." }])}
                className="flex items-center gap-1.5 text-[10px] font-bold text-sub hover:text-ink rounded-lg border border-line/60 px-2.5 py-1.5 transition-all hover:bg-slate-50"
              >
                <Clock size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mt-1">
                    <Bot size={15} />
                  </div>
                )}

                {/* Chat Bubble */}
                <div
                  className={`max-w-[82%] rounded-3xl px-4 py-3.5 shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "border border-line/70 bg-white text-ink rounded-tl-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                  ) : (
                    <AIMessageContent text={m.text} />
                  )}

                  {/* Embedded scheme cards */}
                  {m.schemes && m.schemes.length > 0 && (
                    <motion.div
                      className="mt-4 flex flex-col gap-2.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Related Schemes</p>
                      {m.schemes.map((s) => (
                        <Link
                          key={s.id}
                          to={`/schemes/${s.id}`}
                          className="group flex items-center justify-between rounded-2xl border border-line bg-slate-50/70 hover:bg-white p-3.5 text-left transition-all hover:border-primary/20 hover:shadow-sm outline-none"
                        >
                          <div className="pr-3 flex-1 min-w-0">
                            <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors leading-snug truncate">{s.name}</p>
                            <p className="text-[10px] font-medium text-sub mt-0.5 line-clamp-1">{s.benefit}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            <Badge tone="success" variant="tinted" dot>
                              {s.match ?? s.baseMatch}%
                            </Badge>
                            <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white shadow-sm mt-1">
                    <User size={15} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion chips (shown only on first message) */}
        {messages.length === 1 && (
          <div className="shrink-0 px-4 sm:px-6 pb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={11} /> Quick starters
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => send(s.text)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.07 }}
                  className="flex items-center gap-2 rounded-2xl border border-line/80 bg-white hover:bg-primaryTint/20 hover:border-primary/20 text-left p-3 text-xs font-medium text-ink shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primaryTint border border-primary/10 text-primary">
                    <s.icon size={13} />
                  </div>
                  <span className="line-clamp-1">{s.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="shrink-0 border-t border-line/60 bg-white px-4 sm:px-6 py-3.5">
          <div className="flex gap-2.5 rounded-2xl border border-line/80 bg-slate-50/60 p-2 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-200 shadow-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="e.g., I am a 25yo female entrepreneur from Maharashtra seeking business loans..."
              className="w-full bg-transparent px-2 text-sm text-ink outline-none placeholder:text-slate-400 font-medium"
              disabled={loading}
              aria-label="Ask YojanaSetu AI Assistant"
            />
            <button
              disabled={!input.trim() || loading}
              onClick={() => send(input)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary hover:bg-primaryDark text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-center text-[10px] font-medium text-slate-400 mt-2">
            AI responses are for guidance only. Always verify on official portals.
          </p>
        </div>
      </div>
    </div>
  );
}
