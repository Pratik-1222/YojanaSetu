
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askAIAssistant } from "../api";
import { useSchemeContext } from "../context/SchemeContext";
import {
  Sparkles,
  Send,
  User,
  Bot,
  Info,
  GraduationCap,
  Tractor,
  Heart,
  Plus,
  Clock
} from "lucide-react";

const INITIAL_MESSAGE = "Namaste! I am your YojanaSetu AI Assistant. Describe your situation in plain text — including your age, location, occupation, or income — and I will find eligible schemes for you.";

const SUGGESTIONS = [
  {
    text: "Scholarships for engineering students in Uttar Pradesh",
    icon: GraduationCap
  },
  {
    text: "Welfare benefits for farmers with agricultural land",
    icon: Tractor
  },
  {
    text: "Startup capital or bank loans for women entrepreneurs",
    icon: Heart
  }
];

function AIMessageContent({ text }) {
  return (
    <div className="prose-ai">
      {text.split("\n").map((line, li) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={li} className="text-sm font-black text-primary mt-3 mb-1 first:mt-0">
              {line.replace("### ", "")}
            </h3>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2 key={li} className="text-[15px] font-black text-ink mt-3 mb-1">
              {line.replace("## ", "")}
            </h2>
          );
        }

        if (/^[*-]\s+\*\*/.test(line)) {
          const content = line.replace(/^[*-]\s+/, "");
          const parts = content.split(/\*\*(.*?)\*\*/g);

          return (
            <p key={li} className="ml-2 mb-1 flex gap-1.5 items-start text-sm">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>
                {parts.map((part, pi) =>
                  pi % 2 === 1 ? (
                    <strong key={pi} className="font-extrabold text-ink">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </span>
            </p>
          );
        }

        if (/^\s{4}\d+\./.test(line)) {
          return (
            <p key={li} className="ml-6 mb-0.5 text-xs font-medium text-sub">
              {line.trim()}
            </p>
          );
        }

        if (/^\s{4}-/.test(line)) {
          return (
            <p key={li} className="ml-6 mb-0.5 text-xs font-medium text-sub flex gap-1.5">
              <span>–</span>
              <span>{line.replace(/^\s+-\s*/, "")}</span>
            </p>
          );
        }

        if (line.trim() === "") {
          return <div key={li} className="h-2" />;
        }

        const boldParts = line.split(/\*\*(.*?)\*\*/g);

        return (
          <p key={li} className="mb-1 text-sm leading-relaxed">
            {boldParts.map((part, pi) =>
              pi % 2 === 1 ? (
                <strong key={pi} className="font-extrabold text-ink">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

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
      text: INITIAL_MESSAGE
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const resetConversation = () => {
    setMessages([
      {
        role: "assistant",
        text: INITIAL_MESSAGE
      }
    ]);
    setInput("");
  };

  const send = async (text) => {
    const message = text.trim();

    if (!message || loading) return;

    const history = messages
      .filter((item) => item.text !== INITIAL_MESSAGE)
      .map((item) => ({
        role: item.role,
        text: item.text
      }));

    setInput("");
    setMessages((current) => [
      ...current,
      { role: "user", text: message }
    ]);
    setLoading(true);

    try {
      const res = await askAIAssistant(message, profile, history);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: res?.reply || "I couldn't generate a response. Please try again."
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I encountered an issue connecting to the database. Please verify your connection and try again."
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-bg overflow-hidden">
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-r border-line/60 bg-white p-5 gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot size={16} />
          </div>
          <div>
            <p className="text-sm font-black text-ink">AI Assistant</p>
            <p className="text-[10px] font-medium text-sub">Powered by Gemini</p>
          </div>
        </div>

        <button
          onClick={resetConversation}
          className="flex items-center gap-2 w-full rounded-xl border border-dashed border-line hover:border-primary/30 hover:bg-primaryTint/20 text-sub hover:text-primary px-4 py-2.5 text-xs font-bold transition-all"
        >
          <Plus size={14} />
          New Conversation
        </button>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1">
            <Info size={11} />
            Suggested Topics
          </p>

          <div className="space-y-1.5">
            {[
              "Scholarship schemes for students",
              "Agricultural subsidies for farmers",
              "Women entrepreneurship schemes",
              "Housing loan benefits",
              "Disability support programs"
            ].map((question) => (
              <button
                key={question}
                onClick={() => send(question)}
                disabled={loading}
                className="w-full text-left rounded-xl border border-line/60 bg-slate-50/60 hover:bg-primaryTint/30 hover:border-primary/20 px-3 py-2.5 text-xs font-medium text-sub hover:text-primary transition-all leading-snug"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
              AI responses are informational. Always verify eligibility on official government portals before applying.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
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
                <p className="text-[10px] font-medium text-sub">
                  Online • Ready to help
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 rounded-full px-3 py-1 border border-line/60">
              AI Engine v2.0
            </span>

            {messages.length > 1 && (
              <button
                onClick={resetConversation}
                className="flex items-center gap-1.5 text-[10px] font-bold text-sub hover:text-ink rounded-lg border border-line/60 px-2.5 py-1.5 transition-all hover:bg-slate-50"
              >
                <Clock size={11} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mt-1">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-3xl px-4 py-3.5 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "border border-line/70 bg-white text-ink rounded-tl-sm"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm font-medium leading-relaxed">
                      {message.text}
                    </p>
                  ) : (
                    <AIMessageContent text={message.text} />
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white shadow-sm mt-1">
                    <User size={15} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="shrink-0 px-4 sm:px-6 pb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={11} />
              Quick starters
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => send(suggestion.text)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.07 }}
                  className="flex items-center gap-2 rounded-2xl border border-line/80 bg-white hover:bg-primaryTint/20 hover:border-primary/20 text-left p-3 text-xs font-medium text-ink shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primaryTint border border-primary/10 text-primary">
                    <suggestion.icon size={13} />
                  </div>
                  <span className="line-clamp-1">{suggestion.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="shrink-0 border-t border-line/60 bg-white px-4 sm:px-6 py-3.5">
          <div className="flex gap-2.5 rounded-2xl border border-line/80 bg-slate-50/60 p-2 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-200 shadow-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" &&
                !event.shiftKey &&
                send(input)
              }
              placeholder="Ask about government schemes, scholarships, or benefits..."
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
