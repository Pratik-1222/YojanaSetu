import { ShieldCheck, Bookmark, ArrowRight, Share2, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "./Badge";
import ScoreRing from "./ScoreRing";
import { CATEGORY_ICONS } from "../data/categoryIcons";
import { useSchemeContext } from "../context/SchemeContext";

export default function SchemeCard({ scheme }) {
  const { categories, saved, toggleSave } = useSchemeContext();
  const [copied, setCopied] = useState(false);
  const cat = categories.find((c) => c.key === scheme.category);
  const Icon = CATEGORY_ICONS[scheme.category];
  const isSaved = saved.includes(scheme.id);
  const matchScore = scheme.match ?? scheme.baseMatch;

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/schemes/${scheme.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      className="group relative flex flex-col justify-between rounded-3xl border border-line/80 bg-white p-6 shadow-sm hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Top Subtle Gradient Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-80" />

      <div>
        {/* Category & Score Header */}
        <div className="mb-4 flex items-center justify-between">
          <Badge tone="primary" variant="tinted" dot>
            {Icon && <Icon size={13} className="shrink-0 text-primary" />} 
            <span className="font-extrabold">{cat?.label || scheme.category}</span>
          </Badge>
          <div className="flex items-center gap-2">
            {matchScore >= 80 && (
              <span className="rounded-full bg-accentTint/60 text-accent text-[10px] font-black px-2.5 py-0.5 border border-accent/20">
                Top Match
              </span>
            )}
            <ScoreRing value={matchScore} />
          </div>
        </div>

        {/* Scheme Name & Dept */}
        <h3 className="text-lg font-black text-ink leading-snug group-hover:text-primary transition-colors">
          {scheme.name}
        </h3>
        <p className="mt-1 text-xs font-bold text-slate-400 flex items-center gap-1">
          <span>{scheme.dept}</span>
        </p>

        {/* Tagline */}
        <p className="mt-3.5 text-xs sm:text-sm font-semibold text-sub leading-relaxed line-clamp-2">
          {scheme.tagline}
        </p>

        {/* Primary Benefit Chip */}
        <div className="mt-4.5 inline-flex items-center gap-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 px-3.5 py-2 text-xs font-black text-emerald-800 shadow-2xs">
          <ShieldCheck size={15} className="shrink-0 text-emerald-600" /> 
          <span className="truncate">{scheme.benefit}</span>
        </div>
      </div>
      
      {/* Footer Controls */}
      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/schemes/${scheme.id}`}
          className="flex-1 inline-flex items-center justify-center rounded-2xl border border-line/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-ink py-2.5 text-xs font-extrabold transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-center shadow-2xs"
        >
          Details
        </Link>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const viewed = JSON.parse(localStorage.getItem("yojanasetu_recently_viewed")) || [];
              const filtered = viewed.filter((x) => x !== scheme.id);
              const next = [scheme.id, ...filtered].slice(0, 4);
              localStorage.setItem("yojanasetu_recently_viewed", JSON.stringify(next));
            } catch (err) {}
            window.open(scheme.official_link || "https://www.india.gov.in", "_blank", "noopener,noreferrer");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondaryDark text-white py-2.5 text-xs font-black shadow-md shadow-secondary/20 transition-all duration-200 active:scale-95 text-center"
        >
          Apply Now <ExternalLink size={13} />
        </button>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShare}
            className={`rounded-2xl border p-2.5 transition-all active:scale-95 outline-none ${
              copied 
                ? "border-accent bg-accentTint text-accent" 
                : "border-line bg-white text-sub hover:border-slate-300 hover:text-ink shadow-2xs"
            }`}
            aria-label="Share scheme link"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
          </button>
          <AnimatePresence>
            {copied && (
              <motion.span 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-xl bg-ink px-2.5 py-1 text-[10px] font-black text-white shadow-lg"
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={() => toggleSave(scheme.id)}
          className={`rounded-2xl border p-2.5 transition-all active:scale-95 outline-none ${
            isSaved 
              ? "border-secondary bg-secondaryTint text-secondary shadow-sm" 
              : "border-line bg-white text-sub hover:border-slate-300 hover:text-ink shadow-2xs"
          }`}
          aria-label={isSaved ? "Remove from saved schemes" : "Save scheme"}
        >
          <Bookmark 
            size={16} 
            fill={isSaved ? "#FF9933" : "none"} 
            className="transition-transform duration-200 group-hover:scale-110" 
          />
        </button>
      </div>
    </motion.div>
  );
}

