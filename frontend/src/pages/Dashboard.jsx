import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Calendar,
  Sparkles,
  CheckCircle2,
  User,
  Trophy,
  Bookmark,
  ShieldAlert,
  Trash2,
  RotateCcw,
  X
} from "lucide-react";
import Badge from "../components/Badge";
import { LoadingState, ErrorState } from "../components/StatusStates";
import { useSchemeContext } from "../context/SchemeContext";
import { getSchemes } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, setProfile, saved, toggleSave, matched, setMatched } = useSchemeContext();
  const [schemes, setSchemes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Local state for notifications alerts dismiss logs
  const [alerts, setAlerts] = useState([
    { id: 1, icon: ShieldAlert, text: "Income certificate credentials expire in 20 days.", color: "text-warning bg-warning/5 border-warning/10" },
    { id: 2, icon: Sparkles, text: "2 new educational scholarships added for OBC students.", color: "text-primary bg-primary/5 border-primary/10" },
    { id: 3, icon: CheckCircle2, text: "PM-KISAN bank account verification confirmed.", color: "text-success bg-success/5 border-success/10" },
  ]);

  const load = () => {
    setStatus("loading");
    getSchemes()
      .then((data) => {
        setSchemes(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  useEffect(() => {
    if (schemes.length > 0) {
      try {
        const viewedIds = JSON.parse(localStorage.getItem("yojanasetu_recently_viewed")) || [];
        const viewedDetails = viewedIds
          .map((id) => schemes.find((s) => s.id === id))
          .filter(Boolean);
        setRecentlyViewed(viewedDetails);
      } catch (e) {
        console.warn("Recently viewed loading failed:", e);
      }
    }
  }, [schemes]);

  function getDaysRemaining(deadlineText) {
    const dateMatch = deadlineText.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const monthStr = dateMatch[2].substring(0, 3).toLowerCase();
      const year = parseInt(dateMatch[3], 10);
      
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      
      const month = months[monthStr];
      if (month !== undefined) {
        const deadlineDate = new Date(year, month, day);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          return `${diffDays}d left`;
        } else if (diffDays === 0) {
          return "Today";
        } else {
          return "Passed";
        }
      }
    }
    return "Rolling";
  }

  const source = useMemo(() => {
    return matched || schemes;
  }, [matched, schemes]);

  const eligible = useMemo(() => {
    return source.filter((s) => (s.match ?? s.baseMatch) >= 65);
  }, [source]);

  const savedSchemes = useMemo(() => {
    return schemes.filter((s) => saved.includes(s.id));
  }, [schemes, saved]);

  const hasProfile = Object.keys(profile).length > 0;

  // Compute profile completeness percentage
  const profileKeys = ["age", "gender", "disability", "occupation", "education", "income", "category", "state", "district", "language"];
  const filledKeys = profileKeys.filter((k) => profile[k] && profile[k].toString().trim().length > 0);
  const completeness = Math.round((filledKeys.length / profileKeys.length) * 100);

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to clear your onboarding profile? This will wipe your matching scores.")) {
      setProfile({});
      setMatched(null);
    }
  };

  const handleDismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <LoadingState label="Loading citizen portal dashboard…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <ErrorState onRetry={load} />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 select-none">
      {/* Background decoration */}
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primaryTint/20 to-transparent opacity-60" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-extrabold shadow-md shadow-primary/10">
            {profile.gender === "Female" ? "F" : "Y"}
          </div>
          <div>
            <h2 className="text-2xl font-black text-ink leading-tight">Citizen Dashboard</h2>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-sub">
              {hasProfile 
                ? `${profile.occupation} • ${profile.state}` 
                : "Build your onboarding profile to match eligible schemes."
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasProfile && (
            <button 
              onClick={handleResetProfile}
              className="flex items-center gap-1.5 rounded-2xl border border-line bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-sub transition-colors shadow-sm outline-none"
            >
              <RotateCcw size={13} />
              Reset Profile
            </button>
          )}
          <div className="relative flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2 text-xs font-extrabold text-ink shadow-sm">
            <Bell size={14} className="text-primary animate-pulse" />
            <span>Alerts</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white">
              {alerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Summary metric card widgets */}
      <motion.div 
        className="mt-8 grid gap-5 sm:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
      >
        {[
          { 
            label: "Eligible Schemes", 
            value: `${eligible.length} Found`, 
            desc: "Matching qualifications", 
            icon: Trophy, 
            tint: "bg-success/5 text-success border-success/15" 
          },
          { 
            label: "Saved Schemes", 
            value: `${savedSchemes.length} Saved`, 
            desc: "Direct bookmark tracker", 
            icon: Bookmark, 
            tint: "bg-secondary/5 text-secondary border-secondary/15" 
          },
          { 
            label: "Profile Complete", 
            value: `${completeness}%`, 
            desc: `${filledKeys.length} of ${profileKeys.length} items defined`, 
            icon: User, 
            tint: completeness >= 80 ? "bg-primary/5 text-primary border-primary/15" : "bg-warning/5 text-warning border-warning/15" 
          },
        ].map((s) => (
          <motion.div 
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 }
            }}
            className="flex items-center justify-between rounded-3xl border border-line bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="mt-2 text-xl font-black text-ink">{s.value}</p>
              <p className="mt-0.5 text-xs text-sub font-semibold">{s.desc}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${s.tint} shrink-0`}>
              <s.icon size={18} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Page layout partitions */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        
        {/* Left Double-Column Panel */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recommendations Area */}
          <div>
            <h3 className="text-lg font-black text-ink mb-4 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary" /> Recommended Welfare Schemes
            </h3>
            
            {!hasProfile ? (
              <div className="rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center shadow-sm">
                <p className="text-xs sm:text-sm font-semibold text-sub mb-4">
                  Run the eligibility check to analyze and score matching welfare programs based on your details.
                </p>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primaryDark text-white px-5 py-2.5 text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                >
                  Start Scanning Profile <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {eligible.slice(0, 4).map((s) => (
                  <Link
                    key={s.id}
                    to={`/schemes/${s.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 text-left transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-ink group-hover:text-primary transition-colors leading-snug">{s.name}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-sub">{s.dept}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge tone={(s.match ?? s.baseMatch) >= 85 ? "success" : "accent"} variant="tinted" dot>
                        {s.match ?? s.baseMatch}% Match
                      </Badge>
                      <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarks saved list area */}
          <div>
            <h3 className="text-lg font-black text-ink mb-4">Saved Schemes Tracker</h3>
            {savedSchemes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center text-xs sm:text-sm font-semibold text-sub shadow-sm">
                No saved schemes yet. Bookmark benefits while browsing directory catalogs to review them here.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                <AnimatePresence>
                  {savedSchemes.map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="flex items-center justify-between rounded-2xl border border-line bg-white p-4"
                    >
                      <Link 
                        to={`/schemes/${s.id}`} 
                        className="group flex-1 text-left"
                      >
                        <p className="text-xs sm:text-sm font-extrabold text-ink group-hover:text-primary transition-colors leading-snug">{s.name}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-slate-400">{s.dept}</p>
                      </Link>
                      
                      {/* Direct Unsave button */}
                      <button
                        onClick={() => toggleSave(s.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-danger/5 text-slate-400 hover:text-danger border border-line hover:border-danger/10 transition-colors shadow-sm"
                        aria-label="Remove saved scheme"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Recently Viewed list area */}
          <div>
            <h3 className="text-lg font-black text-ink mb-4">Recently Viewed Schemes</h3>
            {recentlyViewed.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center text-xs sm:text-sm font-semibold text-sub shadow-sm">
                No recently viewed schemes yet. Explore schemes to see them listed here.
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {recentlyViewed.map((s) => (
                  <Link
                    key={s.id}
                    to={`/schemes/${s.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 text-left transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-ink group-hover:text-primary transition-colors leading-snug truncate max-w-[180px]">{s.name}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-400 truncate max-w-[180px]">{s.dept}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Columns */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-line bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/onboarding")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-line hover:border-primary/20 bg-slate-50 hover:bg-white text-center transition-all group"
              >
                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">📋</span>
                <span className="text-[10px] font-extrabold text-ink">Update Profile</span>
              </button>
              <button
                onClick={() => navigate("/assistant")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-line hover:border-primary/20 bg-slate-50 hover:bg-white text-center transition-all group"
              >
                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🤖</span>
                <span className="text-[10px] font-extrabold text-ink">Consult AI</span>
              </button>
            </div>
          </div>

          {/* Deadline log tracker */}
          <div>
            <h3 className="text-lg font-black text-ink mb-4">Timeline Tracker</h3>
            <div className="flex flex-col gap-3">
              {schemes.slice(0, 3).map((s) => (
                <div key={s.id} className="flex gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger/5 text-danger border border-danger/10">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-ink line-clamp-1 leading-snug">{s.name}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-danger leading-tight flex flex-wrap gap-1.5 items-center">
                      <span>{s.deadline.split("—")[0]}</span>
                      <span className="text-slate-400 font-normal">({getDaysRemaining(s.deadline)})</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dismissible Alerts Panel */}
          <div>
            <h3 className="text-lg font-black text-ink mb-4">Verification Alerts</h3>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {alerts.map((n) => {
                  const Icon = n.icon;
                  return (
                    <motion.div 
                      key={n.id}
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${n.color}`}
                    >
                      <Icon size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs font-semibold leading-relaxed text-ink pr-5">{n.text}</p>
                      
                      <button
                        onClick={() => handleDismissAlert(n.id)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-ink transition-colors"
                        aria-label="Dismiss alert"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {alerts.length === 0 && (
                <div className="text-center py-6 text-xs font-bold text-slate-400">
                  No active verification alerts.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
