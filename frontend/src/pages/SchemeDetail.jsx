import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ShieldCheck,
  Clock,
  Bookmark,
  Share2,
  Printer,
  CheckCircle2,
  FileText,
  ExternalLink,
  Check
} from "lucide-react";
import Badge from "../components/Badge";
import ScoreRing from "../components/ScoreRing";
import { LoadingState, ErrorState, DetailSkeleton } from "../components/StatusStates";
import { useSchemeContext } from "../context/SchemeContext";
import { getScheme, getSchemes } from "../api";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "eligibility", label: "Eligibility Criteria" },
  { key: "documents", label: "Required Documents" },
  { key: "process", label: "How to Apply" },
];

export default function SchemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, saved, toggleSave, addNotification } = useSchemeContext();
  const [tab, setTab] = useState("overview");
  const [scheme, setScheme] = useState(null);
  const [status, setStatus] = useState("loading");
  const [shared, setShared] = useState(false);
  const [related, setRelated] = useState([]);

  const load = () => {
    setStatus("loading");
    getScheme(id)
      .then((data) => {
        setScheme(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (scheme) {
      getSchemes(scheme.category)
        .then((data) => {
          setRelated(data.filter((s) => s.id !== scheme.id).slice(0, 2));
        })
        .catch(() => setRelated([]));
    }
  }, [scheme]);

  useEffect(() => {
    if (scheme) {
      try {
        const viewed = JSON.parse(localStorage.getItem("yojanasetu_recently_viewed")) || [];
        const filtered = viewed.filter((x) => x !== scheme.id);
        const next = [scheme.id, ...filtered].slice(0, 4);
        localStorage.setItem("yojanasetu_recently_viewed", JSON.stringify(next));
      } catch (e) {
        console.warn("View history logging failed:", e);
      }
    }
  }, [scheme]);

  const handleDownloadSummary = () => {
    if (!scheme) return;
    const documentLines = scheme.documents.map((d) => `- [ ] ${d}`).join("\n");
    const stepsLines = scheme.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const eligibilityLines = scheme.eligibility.map((e) => `- ${e}`).join("\n");

    const textContent = `=========================================
YOJANASETU VERIFIED SCHEME DOCUMENT CHECKLIST
=========================================
Scheme Name: ${scheme.name}
Ministry/Dept: ${scheme.dept}
Primary Benefit: ${scheme.benefit}
Application Deadline: ${scheme.deadline}
Official Site: ${scheme.official_link || "Central Portal"}
=========================================

ELIGIBILITY REQUIREMENTS:
${eligibilityLines}

REQUIRED DOCUMENTS CHECKLIST:
${documentLines}

APPLICATION STEPS:
${stepsLines}

=========================================
Disclaimers: Always verify application criteria on the official portal before submissions. YojanaSetu is a free public assistance system.
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${scheme.id}-checklist-yojanasetu.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <DetailSkeleton />
      </div>
    );
  }

  if (status === "error" || !scheme) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <ErrorState message="We couldn't load this scheme." onRetry={load} />
      </div>
    );
  }

  const isSaved = saved.includes(scheme.id);
  const matchedCategory = categories.find((c) => c.key === scheme.category);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePortalRedirect = () => {
    const linkUrl = scheme.official_link || "https://www.india.gov.in";
    addNotification(`Redirected to official portal for: ${scheme.name}. Submit application using your checklist!`);
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 select-none printable-container">
      {/* Background radial accent */}
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primaryTint/30 to-transparent opacity-60 no-print" />

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="group mb-6 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sub hover:text-ink transition-colors outline-none focus-visible:underline no-print"
      >
        <ChevronLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> 
        Back to schemes
      </button>

      {/* Main Details Panel */}
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <Badge tone="primary" variant="tinted" dot>
              {matchedCategory?.label || scheme.category}
            </Badge>
            <h1 className="mt-3.5 text-2xl sm:text-3xl font-black text-ink leading-tight">
              {scheme.name}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-extrabold text-slate-400">{scheme.dept}</p>
          </div>
          <div className="shrink-0 self-end sm:self-start no-print">
            <ScoreRing value={scheme.match ?? scheme.baseMatch} />
          </div>
        </div>

        {/* Dynamic Highlight Tags */}
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 border-t border-slate-100 pt-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/5 border border-success/15 px-4.5 py-2 text-xs font-bold text-success">
            <ShieldCheck size={15} className="shrink-0" /> 
            <span>Benefit: {scheme.benefit}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/5 border border-secondary/15 px-4.5 py-2 text-xs font-bold text-secondary">
            <Clock size={15} className="shrink-0" /> 
            <span>Deadline: {scheme.deadline}</span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="mt-8 flex flex-wrap gap-2.5 border-t border-slate-100 pt-6 no-print">
          {/* Saved Toggle Button */}
          <button
            onClick={() => toggleSave(scheme.id)}
            className={`flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isSaved 
                ? "border-secondary bg-secondaryTint text-secondary" 
                : "border-line bg-white text-sub hover:border-slate-300"
            }`}
          >
            <Bookmark size={15} fill={isSaved ? "#F57C00" : "none"} />
            {isSaved ? "Saved" : "Save Scheme"}
          </button>
          
          {/* Share button */}
          <div className="relative">
            <button 
              onClick={handleShare}
              className={`flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                shared 
                  ? "border-accent bg-accentTint/20 text-accent" 
                  : "border-line bg-white text-sub hover:border-slate-300"
              }`}
            >
              {shared ? <Check size={15} /> : <Share2 size={15} />} 
              {shared ? "Copied" : "Share Link"}
            </button>
          </div>

          {/* Download Checklist button */}
          <button 
            onClick={handleDownloadSummary}
            className="flex items-center gap-1.5 rounded-2xl border border-line bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-ink px-4 py-2.5 text-xs font-bold text-sub transition-all active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FileText size={15} /> 
            Download Checklist
          </button>

          {/* Print Checklist button */}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-2xl border border-line bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-ink px-4 py-2.5 text-xs font-bold text-sub transition-all active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Printer size={15} /> 
            Print Guidelines
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation (With layout slide transitions) */}
      <div className="mt-8 flex gap-1 rounded-2xl border border-line bg-white p-1.5 shadow-sm no-print">
        {TABS.map((t) => {
          const isSelected = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-colors outline-none"
            >
              {/* Sliding Pill block */}
              {isSelected && (
                <motion.div
                  layoutId="activeDetailTab"
                  className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${isSelected ? "text-white" : "text-sub hover:text-ink"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body Container */}
      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-xl min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "overview" && (
              <div>
                <h3 className="text-lg font-black text-ink">What this Scheme Offers</h3>
                <p className="mt-3.5 text-xs sm:text-sm sm:text-base leading-relaxed text-sub font-semibold">
                  {scheme.tagline}. Administered officially by the <strong className="text-ink font-extrabold">{scheme.dept}</strong>, this program is structured to streamline critical benefits to citizens nationwide with simplified legal procedures and direct transfers.
                </p>
              </div>
            )}

            {tab === "eligibility" && (
              <div>
                <h3 className="text-lg font-black text-ink mb-4">Qualification Criteria</h3>
                <ul className="flex flex-col gap-3.5">
                  {scheme.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-3 text-xs sm:text-sm sm:text-base font-semibold text-ink leading-relaxed">
                      <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "documents" && (
              <div>
                <h3 className="text-lg font-black text-ink mb-4">Required Documents Checklist</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {scheme.documents.map((d) => (
                    <li key={d} className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50/50 p-3.5 text-xs sm:text-sm font-extrabold text-ink shadow-sm hover:border-primary/25 transition-all">
                      <FileText size={16} className="text-primary shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "process" && (
              <div>
                <h3 className="text-lg font-black text-ink mb-5">Step-by-Step Application Instructions</h3>
                <ol className="flex flex-col gap-5">
                  {scheme.steps.map((s, i) => (
                    <li key={s} className="flex gap-4 items-start">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black shadow-sm border border-primary/25">
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm sm:text-base font-semibold text-ink leading-relaxed pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
                
                <div className="mt-8 border-t border-slate-100 pt-6 flex justify-end no-print">
                  <button 
                    onClick={handlePortalRedirect}
                    className="group flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary/95 text-white shadow-md transition-all hover:scale-[1.01] active:scale-95 px-6 py-3 text-xs sm:text-sm font-extrabold"
                  >
                    Go to Official Portal 
                    <ExternalLink size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Schemes */}
      {related.length > 0 && (
        <div className="mt-12 no-print">
          <h3 className="text-lg font-black text-ink mb-4">Related Welfare Schemes</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/schemes/${rel.id}`}
                className="group flex flex-col justify-between rounded-3xl border border-line bg-white p-5 shadow-sm hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-ink group-hover:text-primary transition-colors leading-snug">
                    {rel.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-400 font-bold">{rel.dept}</p>
                  <p className="mt-2 text-xs text-sub line-clamp-2 leading-relaxed">{rel.tagline}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-[10px] font-extrabold text-success bg-success/5 px-2 py-1 rounded-lg">
                    {rel.benefit}
                  </span>
                  <span className="text-[10px] font-extrabold text-primary flex items-center gap-1">
                    Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
