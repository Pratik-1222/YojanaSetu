import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Mic,
  Sparkles,
  Star,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  User,
  ArrowRight,
  Database,
  MapPin,
  Timer,
  Lock,
  Globe2,
  FileCheck2,
  Bot,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import SchemeCard from "../components/SchemeCard";
import { CardSkeleton, ErrorState } from "../components/StatusStates";
import { CATEGORY_ICONS } from "../data/categoryIcons";
import { useSchemeContext } from "../context/SchemeContext";
import { getSchemes } from "../api";

const TESTIMONIALS = [
  { name: "Meera J.", role: "Farmer, Nashik", text: "I found out I was owed three PM-KISAN instalments I never knew existed. Took ten minutes.", avatar: "M", color: "bg-emerald-600" },
  { name: "Arjun P.", role: "Engineering student, Lucknow", text: "The assistant matched me to a scholarship my college never mentioned. Life-changing support.", avatar: "A", color: "bg-primary" },
  { name: "Fatima R.", role: "Small business owner, Hyderabad", text: "Stand-Up India felt out of reach until YojanaSetu laid out exactly what the bank would ask for.", avatar: "F", color: "bg-secondary" },
];

const FAQS = [
  { q: "Is YojanaSetu a government website?", a: "YojanaSetu is an independent public-service platform that aggregates official scheme data and links directly to official government portals for submissions. It is NOT affiliated with any government ministry." },
  { q: "Do I need to pay to check eligibility?", a: "No. Checking eligibility, comparing schemes, and receiving conversational guidance is 100% free and always will be." },
  { q: "What happens to my personal data?", a: "Your profile is stored completely locally in your browser's localStorage and used solely to match you to eligible schemes. We never collect, store on servers, or sell your personal data." },
  { q: "Can I use this without reading English well?", a: "Yes! YojanaSetu supports English, Hindi, and many regional Indian languages including Tamil, Telugu, Marathi, and more, with AI guidance in your preferred language." },
];

// In-view counter animation
function AnimatedCounter({ target, suffix = "", duration = 1.2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;
    let totalMs = duration * 1000;
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMs / 30));
      if (start >= end) { clearInterval(timer); setCount(end); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

// Interactive eligibility preview widget
function InteractiveShowcase() {
  const [profileStep, setProfileStep] = useState(0);
  const steps = [
    { key: "basics", icon: "🎓", label: "PROFILE", val: "22-year-old Student", sub: "Uttar Pradesh • OBC" },
    { key: "income", icon: "💰", label: "INCOME & CATEGORY", val: "Family income < ₹2.5L", sub: "OBC Category" },
    { key: "match", icon: "✨", label: "TOP AI MATCH", val: "NSP Scholarship", sub: "95% Match • Why you qualify" }
  ];
  const matchReasons = ["Student status verified", "Income criteria met", "Location eligible"];

  useEffect(() => {
    const interval = setInterval(() => setProfileStep((s) => (s + 1) % steps.length), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Decorative blur orbs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative rounded-3xl border border-line/80 bg-white shadow-2xl shadow-slate-200/80 overflow-hidden select-none">
        {/* Card top accent stripe */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-line/60 bg-slate-50/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-ink">YojanaSetu Matcher</span>
            </div>
          </div>
          <span className="rounded-full bg-primary/8 border border-primary/15 text-[10px] font-black text-primary px-2.5 py-0.5 flex items-center gap-1">
            <Zap size={9} className="animate-pulse" />
            AI Engine Active
          </span>
        </div>

        {/* Steps */}
        <div className="p-5 space-y-3">
          {steps.map((st, i) => {
            const isActive = profileStep === i;
            const isDone = profileStep > i;
            return (
              <motion.div
                key={st.key}
                animate={{ scale: isActive ? 1.02 : 1, opacity: profileStep >= i ? 1 : 0.35 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-300 ${
                  isActive ? "border-primary/25 bg-primaryTint/25 shadow-sm" :
                  isDone ? "border-emerald-200/60 bg-emerald-50/40" : "border-line/60 bg-slate-50/40"
                }`}
              >
                <span className="text-xl shrink-0">{st.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{st.label}</span>
                  <p className="text-xs font-extrabold text-ink mt-0.5 truncate">{st.val}</p>
                  <p className="text-[10px] font-semibold text-sub mt-0.5">{st.sub}</p>
                </div>
                {isDone && (
                  <span className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={11} className="text-white" />
                  </span>
                )}
                {isActive && (
                  <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                    <Zap size={10} className="text-white" />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Match Result Panel */}
        <AnimatePresence>
          {profileStep === 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-line/60 bg-gradient-to-br from-emerald-50/70 to-white px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Why you may qualify</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-emerald-700">95%</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">Match</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {matchReasons.map((r) => (
                  <div key={r} className="flex items-center gap-2 text-[11px] font-bold text-emerald-800">
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-100/60">
                <p className="text-[10px] font-semibold text-slate-400">NSP Scholarship — Benefit: ₹25,000/year</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Chat preview widget for AI section
function ChatPreview() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot size={15} />
          </div>
          <div>
            <p className="text-[12px] font-black text-white">YojanaSetu AI</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-medium">Online • Ready to help</span>
            </div>
          </div>
        </div>
        <span className="text-[9px] text-slate-500 bg-slate-800/80 rounded-full px-2.5 py-1 border border-slate-700">v2.0</span>
      </div>

      <div className="p-4 space-y-4 font-sans text-xs">
        {/* User message */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-primary/85 px-4 py-2.5 text-white max-w-[82%] shadow-sm">
            <p className="font-medium text-[11px] leading-relaxed">
              I'm a small farmer from Uttar Pradesh. What schemes can help me?
            </p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-2.5 items-end">
          <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Bot size={13} className="text-white" />
          </div>
          <div className="rounded-2xl rounded-tl-sm border border-slate-700/60 bg-slate-800/70 px-4 py-3 max-w-[82%] shadow-sm">
            <p className="text-slate-200 font-medium text-[11px] leading-relaxed">
              Based on your profile, <strong className="text-white font-extrabold">PM-KISAN</strong> offers ₹6,000/year direct transfer. Also checking state-specific UP schemes.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-emerald-900/30 border border-emerald-700/30 px-2.5 py-1.5">
              <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] text-emerald-300 font-bold">94% match accuracy</span>
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="pt-1 border-t border-slate-800">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {["Scholarships for students", "Benefits for women", "Disability schemes"].map((q) => (
              <span key={q} className="text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1 cursor-pointer transition-colors">
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable section heading
function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-secondary mb-3">
          <span className="h-px w-5 bg-secondary/40" />
          {eyebrow}
          <span className="h-px w-5 bg-secondary/40" />
        </span>
      )}
      <h2 className="text-2xl sm:text-[1.85rem] font-black text-ink tracking-tight leading-tight">{title}</h2>
      {subtitle && (
        <p className={`mt-3 text-sm font-medium text-sub leading-relaxed ${center ? "max-w-xl mx-auto" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

export default function Landing() {
  const navigate = useNavigate();
  const { categories } = useSchemeContext();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [schemes, setSchemes] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = () => {
    setStatus("loading");
    getSchemes()
      .then((data) => { setSchemes(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const goSearch = () => {
    if (query.trim()) navigate(`/schemes?search=${encodeURIComponent(query)}`);
    else navigate("/schemes");
  };

  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════════════════════
          HERO SECTION
      ═══════════════════════════════ */}
      <section className="relative px-4 sm:px-6 pb-16 pt-10 md:pb-24 md:pt-16 overflow-hidden">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute -right-32 -top-20 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/6 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-600/8 to-indigo-600/6 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 bottom-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        {/* Dot grid */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[700px] dot-grid opacity-35" style={{ maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)" }} />

        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center text-center lg:text-left relative z-10">

          {/* Left: Copy + CTAs + Search */}
          <div className="lg:col-span-7 space-y-7">

            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto lg:mx-0 flex w-fit items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-50 via-white to-emerald-50/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm"
            >
              <Sparkles size={11} className="text-secondary animate-pulse shrink-0" />
              <span className="bg-gradient-to-r from-amber-700 via-primary to-emerald-700 bg-clip-text text-transparent">
                AI-Powered • Multilingual • Instant Matching
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="text-[2.4rem] font-black leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]"
            >
              Discover the government{" "}
              <br className="hidden sm:inline" />
              benefits you{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  qualify for.
                </span>
                <svg className="absolute -bottom-1.5 left-0 w-full" height="5" viewBox="0 0 200 5" preserveAspectRatio="none">
                  <path d="M0 4 Q100 0 200 4" stroke="#FF9933" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto lg:mx-0 max-w-xl text-base sm:text-[1.05rem] font-medium text-sub leading-relaxed"
            >
              Answer a few simple questions and YojanaSetu finds relevant central and state government schemes with plain-language explanations and clear next steps.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-center lg:justify-start gap-3 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => navigate("/onboarding")}
                className="group flex items-center justify-center gap-2.5 rounded-full bg-secondary hover:bg-secondaryDark text-white shadow-lg shadow-secondary/25 transition-all duration-200 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02] active:scale-95 px-8 py-3.5 text-sm font-black"
              >
                Check Your Eligibility
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <Link
                to="/schemes"
                className="flex items-center justify-center gap-2 rounded-full border border-line/80 bg-white hover:bg-slate-50 text-ink shadow-sm transition-all hover:shadow-md hover:border-slate-300 active:scale-95 px-8 py-3.5 text-sm font-bold"
              >
                Explore Schemes
              </Link>
            </motion.div>

            {/* Trust micro-indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400"
            >
              {[
                { icon: Lock, label: "No signup required" },
                { icon: Shield, label: "Privacy-first" },
                { icon: FileCheck2, label: "Official application links" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon size={12} className="text-accent" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.div
              id="search"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto lg:mx-0 max-w-2xl"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-line/80 bg-white p-2 shadow-md focus-within:border-primary/40 focus-within:shadow-lg focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
                <Search size={17} className="ml-2.5 shrink-0 text-sub" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goSearch()}
                  placeholder="Search schemes for students, farmers, women..."
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 font-medium"
                  aria-label="Search government schemes"
                />
                <button className="rounded-full bg-slate-100 hover:bg-primaryTint p-2 transition-colors" aria-label="Voice search">
                  <Mic size={14} className="text-primary" />
                </button>
                <button
                  onClick={goSearch}
                  className="rounded-xl bg-primary hover:bg-primaryDark text-white px-5 py-2.5 text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
              </div>
              {/* Popular search pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3">
                <span className="text-[11px] font-bold text-slate-400">Popular:</span>
                {["PM-KISAN", "Scholarships", "Ayushman Bharat", "Mudra Loans"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setQuery(t); navigate(`/schemes?search=${encodeURIComponent(t)}`); }}
                    className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold hover:border-primary/30 hover:text-primary hover:bg-primaryTint/30 transition-all shadow-sm"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Interactive Showcase */}
          <motion.div
            className="lg:col-span-5 hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <InteractiveShowcase />
          </motion.div>
        </div>

        {/* Statistics row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mt-16 max-w-4xl grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            { target: 1200, suffix: "+", label: "Schemes Tracked", desc: "Central & state programs", icon: Database, accentColor: "text-primary", bg: "bg-primary/5 border-primary/10" },
            { target: 28, suffix: "", label: "States Covered", desc: "Unified pan-India support", icon: MapPin, accentColor: "text-secondary", bg: "bg-secondary/5 border-secondary/10" },
            { target: 90, suffix: "%", label: "Time Saved", desc: "Fast matching with clear steps", icon: Timer, accentColor: "text-accent", bg: "bg-accent/5 border-accent/10" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl border border-line/60 bg-white/80 backdrop-blur-sm p-6 text-left hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${item.bg} ${item.accentColor} transition-all duration-300 group-hover:scale-110`}>
                  <item.icon size={19} />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-ink">
                    <AnimatedCounter target={item.target} suffix={item.suffix} />
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item.label}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-sub leading-relaxed border-t border-slate-100 pt-3">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════
          TRUST BANNER
      ═══════════════════════════════ */}
      <section className="border-y border-line/60 bg-white py-5 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-16">
          {[
            { icon: Lock, label: "100% Secure & Privacy-First" },
            { icon: Globe2, label: "No Signup Required" },
            { icon: FileCheck2, label: "Verified Document Checklist" },
            { icon: TrendingUp, label: "AI-Powered Matching" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs font-semibold text-sub">
              <Icon size={14} className="text-accent shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════
          AI ASSISTANT PREVIEW
      ═══════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-22"
      >
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primaryTint border border-primary/12 text-primary shadow-sm">
              <Bot size={22} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-secondary mb-3">
                <span className="h-px w-5 bg-secondary/40" />
                AI Assistant
                <span className="h-px w-5 bg-secondary/40" />
              </span>
              <h2 className="text-2xl sm:text-[1.85rem] font-black text-ink tracking-tight leading-tight">
                Your personal guide to{" "}
                <span className="text-gradient-navy">government schemes.</span>
              </h2>
            </div>
            <p className="text-sm font-medium text-sub leading-relaxed max-w-md">
              Don't feel like filling out forms? Just describe your situation in plain text — in your language. Our AI matches your profile to eligible schemes and explains next steps clearly.
            </p>
            <div className="space-y-3">
              {[
                "Explain eligibility in simple language",
                "Support for Hindi and regional languages",
                "Real-time scheme recommendations",
              ].map((point) => (
                <div key={point} className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <CheckCircle2 size={16} className="text-accent shrink-0" />
                  {point}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/assistant")}
              className="group inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primaryDark text-white px-6 py-3 text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              Try the AI Assistant
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
          {/* Right: Chat Preview */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
            <ChatPreview />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════
          CATEGORIES GRID
      ═══════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="bg-slate-50/70 border-y border-line/60 px-4 sm:px-6 py-16 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <SectionHeading
              eyebrow="Browse by Category"
              title="Every scheme, organized simply."
              subtitle="Government welfare programs organized by life situation — find what's relevant to you instantly."
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c, idx) => {
              const Icon = CATEGORY_ICONS[c.key];
              return (
                <motion.button
                  key={c.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => navigate(`/schemes?category=${c.key}`)}
                  className="group flex flex-col items-start gap-3 rounded-3xl border border-line/70 bg-white p-4 sm:p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-primary/20 hover:-translate-y-1 hover:shadow-elevated transition-all duration-250"
                >
                  <div className="rounded-xl bg-primaryTint border border-primary/8 text-primary p-2.5 transition-all duration-250 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-md group-hover:shadow-primary/20">
                    {Icon && <Icon size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors leading-snug">{c.label}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{c.count} scheme{c.count !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20"
      >
        <div className="text-center mb-12">
          <SectionHeading
            eyebrow="How It Works"
            title="From questions to answers in minutes."
            subtitle="Three simple steps to discover and understand every government scheme you're eligible for."
          />
        </div>

        {/* Steps Grid */}
        <div className="relative grid gap-5 md:grid-cols-3">
          {/* Connecting dashed line on desktop */}
          <div className="absolute top-[3.25rem] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px border-t-2 border-dashed border-primary/15 hidden md:block" />

          {[
            {
              num: "01",
              title: "Tell us about yourself",
              desc: "A short 4-step questionnaire about your age, income, occupation, and location. No account or password needed.",
              icon: User,
              numStyle: "bg-secondary/8 text-secondary border-secondary/15",
              iconBg: "bg-secondaryTint border-secondary/10 text-secondary",
            },
            {
              num: "02",
              title: "Find your matches",
              desc: "Every eligible scheme ranked by match fit percentage, with the primary benefits and deadlines spelled out plainly.",
              icon: Sparkles,
              numStyle: "bg-primary/8 text-primary border-primary/15",
              iconBg: "bg-primaryTint border-primary/10 text-primary",
            },
            {
              num: "03",
              title: "Apply with confidence",
              desc: "Plain-language instructions, a document checklist, and a direct link to the official application portal.",
              icon: CheckCircle2,
              numStyle: "bg-accent/8 text-accent border-accent/15",
              iconBg: "bg-accentTint border-accent/10 text-accent",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-3xl border border-line bg-white p-6 shadow-sm hover:border-slate-200 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black ${s.numStyle}`}>
                    {s.num}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${s.iconBg}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-ink leading-snug">{s.title}</h3>
                <p className="mt-2.5 text-sm font-medium text-sub leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/onboarding")}
            className="group inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-secondaryDark text-white px-8 py-3.5 text-sm font-black shadow-md shadow-secondary/20 transition-all hover:shadow-lg hover:shadow-secondary/25 active:scale-95"
          >
            Start Eligibility Check
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.section>

      {/* ═══════════════════════════════
          POPULAR SCHEMES
      ═══════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="bg-slate-50/60 border-y border-line/60 px-4 sm:px-6 py-16 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading
              eyebrow="Popular Schemes"
              title="Top welfare programs this month"
              subtitle="Based on search queries across all states."
              center={false}
            />
            <Link
              to="/schemes"
              className="hidden items-center gap-1.5 text-sm font-bold text-primary hover:text-primaryDark sm:flex transition-colors whitespace-nowrap"
            >
              See all schemes <ChevronRight size={15} />
            </Link>
          </div>

          {status === "loading" && <CardSkeleton />}
          {status === "error" && <ErrorState onRetry={load} />}
          {status === "ready" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {schemes.slice(0, 3).map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SchemeCard scheme={s} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/schemes" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-bold text-ink hover:bg-slate-50 transition-all shadow-sm">
              See All Schemes <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20"
      >
        <div className="text-center mb-10">
          <SectionHeading
            eyebrow="Success Stories"
            title="Real impact across India"
            subtitle="See how YojanaSetu connects citizens to welfare benefits they've always deserved."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-sm hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
            >
              <div>
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={13} fill="#FF9933" color="#FF9933" />
                  ))}
                </div>
                <p className="text-sm font-medium text-ink leading-relaxed">"{t.text}"</p>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.color} text-white text-xs font-black shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">{t.name}</p>
                  <p className="text-[11px] font-medium text-sub mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════
          FAQ
      ═══════════════════════════════ */}
      <section className="bg-slate-50/70 border-t border-line/60 px-4 sm:px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions answered"
              subtitle="Clear answers to help you navigate YojanaSetu and understand what it does and doesn't do."
            />
          </div>

          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded-3xl border border-line bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between text-left px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-expanded={openFaq === i}
                >
                  <span className={`text-sm font-bold transition-colors leading-snug pr-4 ${openFaq === i ? "text-primary" : "text-ink"}`}>
                    {f.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-sub transition-transform duration-300 shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="px-6 pb-5 border-t border-slate-100 pt-3.5">
                        <p className="text-sm font-medium text-sub leading-relaxed">{f.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA after FAQ */}
          <div className="mt-10 text-center rounded-3xl border border-line bg-white p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondaryTint border border-secondary/15 text-secondary">
                <Award size={22} />
              </div>
            </div>
            <h3 className="text-xl font-black text-ink">Ready to find your schemes?</h3>
            <p className="mt-2 text-sm font-medium text-sub">It takes less than 3 minutes. No account required.</p>
            <button
              onClick={() => navigate("/onboarding")}
              className="mt-5 group inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-secondaryDark text-white px-7 py-3 text-sm font-black shadow-md shadow-secondary/20 transition-all hover:shadow-lg active:scale-95"
            >
              Check Your Eligibility <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
