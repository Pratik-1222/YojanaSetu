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

  const getUniqueRelatedSchemes = (schemes = []) => {
    const seen = new Set();

    return schemes.filter((scheme) => {
      if (!scheme?.id || seen.has(scheme.id)) return false;
      seen.add(scheme.id);

      if (
        scheme.status &&
        !["active", "verified"].includes(String(scheme.status).toLowerCase())
      ) {
