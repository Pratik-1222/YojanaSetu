import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SchemeCard from "../components/SchemeCard";
import { LoadingState, ErrorState, EmptySearchState, CardSkeleton } from "../components/StatusStates";
import { useSchemeContext } from "../context/SchemeContext";
import { getSchemes } from "../api";
import {
  Mic, MicOff, Search, ArrowUpDown, SlidersHorizontal,
  Layers, RotateCcw, Sparkles, Filter
} from "lucide-react";

export default function Results() {
  const { categories, matched } = useSchemeContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get("category") || "all";
  const urlSearch = searchParams.get("search") || "";

  const [schemes, setSchemes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("match");
  const [selectedDept, setSelectedDept] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yojanasetu_recent_searches")) || []; }
    catch { return []; }
  });

  const trendingSearches = ["PM-KISAN", "Scholarships", "Ayushman Bharat", "Mudra", "Solar pump"];

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      handleSearchChange(speechToText);
      saveRecentSearch(speechToText);
    };
    recognition.start();
  };

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((x) => x !== term);
      const next = [term, ...filtered].slice(0, 5);
      localStorage.setItem("yojanasetu_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const autocompleteResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];
    return schemes.filter((s) => s.name.toLowerCase().includes(term)).slice(0, 5);
  }, [searchTerm, schemes]);

  const load = () => {
    setStatus("loading");
    getSchemes(activeCat)
      .then((data) => { setSchemes(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [activeCat]);
  useEffect(() => setSearchTerm(urlSearch), [urlSearch]);

  const baseDisplayed = useMemo(() => activeCat === "all" && matched ? matched : schemes, [activeCat, matched, schemes]);
  const filteredBySearch = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return baseDisplayed;
    return baseDisplayed.filter((s) =>
      s.name.toLowerCase().includes(term) ||
      s.dept.toLowerCase().includes(term) ||
      s.tagline.toLowerCase().includes(term) ||
      s.benefit.toLowerCase().includes(term)
    );
  }, [searchTerm, baseDisplayed]);

  const uniqueDepts = useMemo(() => {
    const depts = new Set(baseDisplayed.map((s) => s.dept));
    return ["all", ...Array.from(depts)];
  }, [baseDisplayed]);

  const filteredByDept = useMemo(() => {
    if (selectedDept === "all") return filteredBySearch;
    return filteredBySearch.filter((s) => s.dept === selectedDept);
  }, [selectedDept, filteredBySearch]);

  const sorted = useMemo(() => {
    return [...filteredByDept].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.match ?? b.baseMatch ?? 0) - (a.match ?? a.baseMatch ?? 0);
    });
  }, [sortBy, filteredByDept]);

  const hasActiveFilters = searchTerm || selectedDept !== "all" || activeCat !== "all";

  const handleClearFilters = () => {
    setSearchTerm(""); setSelectedDept("all"); setSearchParams({});
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) setSearchParams((prev) => { prev.set("search", val); return prev; });
    else setSearchParams((prev) => { prev.delete("search"); return prev; });
  };

  // Filter sidebar content (shared between desktop and mobile)
  const FilterSidebar = () => (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-sm space-y-5">
      <h3 className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-primary" /> Filter & Sort
      </h3>

      {/* Search */}
      <div className="space-y-2 relative">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keyword Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
          <input
            type="text"
            placeholder="Scholarships, Loans..."
            value={searchTerm}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-9 py-2.5 text-xs font-medium border border-line/80 rounded-xl bg-white text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors ${isListening ? "bg-red-500 text-white animate-pulse" : "text-primary hover:bg-slate-100"}`}
            aria-label="Voice search"
          >
            {isListening ? <MicOff size={13} /> : <Mic size={13} />}
          </button>
        </div>
        {isListening && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-2.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-bold text-red-600">Listening...</span>
          </motion.div>
        )}
        {showAutocomplete && autocompleteResults.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-xl p-1.5 space-y-0.5">
            {autocompleteResults.map((item) => (
              <li key={item.id}>
                <button type="button" onMouseDown={() => { handleSearchChange(item.name); saveRecentSearch(item.name); }}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 transition-colors truncate">
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent & Trending searches */}
      <div className="space-y-3 pt-1 border-t border-slate-100/60">
        {recentSearches.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent</span>
              <button onClick={() => { setRecentSearches([]); localStorage.removeItem("yojanasetu_recent_searches"); }}
                className="text-[9px] font-bold text-slate-400 hover:text-danger transition-colors">Clear</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((s, idx) => (
                <button key={idx} onClick={() => handleSearchChange(s)}
                  className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-line/60 px-2 py-1 text-[10px] font-bold text-sub transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trending</span>
          <div className="flex flex-wrap gap-1.5">
            {trendingSearches.map((s) => (
              <button key={s} onClick={() => { handleSearchChange(s); saveRecentSearch(s); }}
                className="rounded-lg bg-primaryTint/60 hover:bg-primaryTint border border-primary/8 px-2 py-1 text-[10px] font-bold text-primary transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100/60">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order By</label>
        <div className="relative">
          <ArrowUpDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub pointer-events-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-8 pr-2 py-2.5 text-xs font-medium border border-line/80 bg-white text-ink rounded-xl outline-none focus:border-primary transition-all cursor-pointer">
            <option value="match">Match Percentage</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ministry / Department</label>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full px-3 py-2.5 text-xs font-medium border border-line/80 bg-white text-ink rounded-xl outline-none focus:border-primary transition-all cursor-pointer">
          <option value="all">All Departments</option>
          {uniqueDepts.filter((d) => d !== "all").map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button onClick={handleClearFilters}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 py-2.5 text-xs font-bold text-sub transition-colors">
          <RotateCcw size={11} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {matched && <Sparkles size={15} className="text-secondary animate-pulse" />}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              {matched ? "Your Personalised Matches" : "Explore Welfare Schemes"}
            </h1>
          </div>
          <p className="text-sm font-medium text-sub max-w-xl leading-relaxed">
            {matched
              ? "Ranked and matched against your eligibility profile. Best matches appear first."
              : "Discover welfare benefits. Run the eligibility check to get personalised match scores."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-sm hover:bg-slate-50 transition-all"
          >
            <Filter size={13} /> Filters
          </button>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 border border-line rounded-full px-4 py-2 whitespace-nowrap">
            {sorted.length} {sorted.length === 1 ? "scheme" : "schemes"}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setShowMobileFilters(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-5 shadow-2xl lg:hidden">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-ink">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="rounded-xl border border-line p-2 hover:bg-slate-50 transition-all">
                  <RotateCcw size={14} className="text-sub" />
                </button>
              </div>
              <FilterSidebar />
              <button onClick={() => setShowMobileFilters(false)}
                className="mt-4 w-full rounded-xl bg-primary text-white py-3 text-sm font-bold transition-all hover:bg-primaryDark">
                Apply & Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Two-column layout */}
      <div className="mt-7 grid gap-7 lg:grid-cols-4">

        {/* Sidebar filters (desktop) */}
        <aside className="lg:col-span-1 hidden lg:block">
          <FilterSidebar />
        </aside>

        {/* Results area */}
        <main className="lg:col-span-3 space-y-5">

          {/* Category tabs */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers size={11} /> Categories
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none sm:flex-wrap">
              <button
                onClick={() => setSearchParams((prev) => { prev.delete("category"); return prev; })}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${activeCat === "all" ? "border-primary bg-primary text-white" : "border-line bg-white text-sub hover:border-slate-300"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSearchParams((prev) => { prev.set("category", c.key); return prev; })}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${activeCat === c.key ? "border-primary bg-primary text-white" : "border-line bg-white text-sub hover:border-slate-300"}`}
                >
                  {c.label} {c.count ? `(${c.count})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="pt-1">
            {status === "loading" && !matched && <CardSkeleton />}
            {status === "error" && !matched && (
              <div className="py-10">
                <ErrorState onRetry={load} />
              </div>
            )}
            {(status === "ready" || matched) && (
              <>
                {sorted.length > 0 ? (
                  <motion.div layout className="grid gap-4 sm:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {sorted.map((s) => (
                        <motion.div
                          layout
                          key={s.id}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        >
                          <SchemeCard scheme={s} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-3xl border border-line p-10 shadow-sm">
                    <EmptySearchState
                      query={searchTerm || selectedDept !== "all" ? "active filters" : ""}
                      onClear={handleClearFilters}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
