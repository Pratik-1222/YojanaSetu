import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  LayoutGrid, 
  User, 
  ArrowRight, 
  Menu, 
  X, 
  Bell, 
  Globe, 
  LogOut, 
  Settings, 
  Bookmark, 
  ChevronDown, 
  ChevronRight 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { useSchemeContext } from "../context/SchemeContext";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/schemes", label: "Browse Schemes", icon: LayoutGrid },
  { to: "/dashboard", label: "My Dashboard", icon: User },
];

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ks", label: "Kashmiri", native: "كأشُر" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "kok", label: "Konkani", native: "कोंकणी" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
  { code: "doi", label: "Dogri", native: "डोगरी" },
  { code: "sd", label: "Sindhi", native: "सिन्धी" },
  { code: "mni", label: "Manipuri", native: "मणिपुरी" },
  { code: "brx", label: "Bodo", native: "बड़ो" },
  { code: "sat", label: "Santhali", native: "संताली" }
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, notifications, markAllNotificationsRead } = useSchemeContext();
  
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("yojanasetu_lang") || "en");

  const selectLanguage = (code) => {
    try {
      if (code === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;
      }
    } catch (e) {
      console.warn("Cookie write warning:", e);
    }
    localStorage.setItem("yojanasetu_lang", code);
    setLang(code);
    setShowLanguage(false);
    window.location.reload();
  };

  const notifRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLanguage(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowLanguage(false);
        setShowProfile(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Generate breadcrumbs dynamically based on path
  const getBreadcrumbs = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    
    return (
      <div className="bg-slate-50 border-b border-line/40 px-6 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-[11px] font-bold text-sub">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          {parts.map((p, idx) => {
            const path = `/${parts.slice(0, idx + 1).join("/")}`;
            const isLast = idx === parts.length - 1;
            const label = p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ");
            
            return (
              <span key={path} className="flex items-center gap-1.5">
                <ChevronRight size={10} className="text-slate-300" />
                {isLast ? (
                  <span className="text-primary truncate max-w-[150px]">{label}</span>
                ) : (
                  <Link to={path} className="hover:text-primary transition-colors">{label}</Link>
                )}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-white/85 backdrop-blur-md shadow-sm shadow-slate-100/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        
        {/* Logo */}
        <Link to="/" className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" aria-label="YojanaSetu Home">
          <Logo size={30} />
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
          {[
            ...ITEMS,
            ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin Panel", icon: Settings }] : [])
          ].map((it) => {
            const active = isActive(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs lg:text-sm font-extrabold transition-colors duration-200 outline-none ${
                  active ? "text-primary font-black" : "text-sub hover:text-ink"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <it.icon size={15} className={`relative z-10 ${active ? "text-primary" : "text-slate-400"}`} />
                <span className="relative z-10">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Toolbar Controls */}
        <div className="hidden items-center gap-3.5 md:flex">
          
          {/* Language Toggle Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLanguage(!showLanguage)}
              className="flex items-center gap-1.5 rounded-full border border-line/80 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-sub hover:text-ink hover:border-slate-300 transition-all outline-none shadow-2xs"
              aria-label="Select Language"
              aria-expanded={showLanguage}
              aria-haspopup="true"
            >
              <Globe size={14} className="text-primary" />
              <span className="font-extrabold">{LANGUAGES.find((l) => l.code === lang)?.native || "English"}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showLanguage ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {showLanguage && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-3xl border border-line/80 bg-white/95 backdrop-blur-lg p-2 shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      className={`w-full text-left rounded-2xl px-3 py-2 text-xs font-bold transition-colors ${
                        lang === l.code ? "bg-primary/10 text-primary font-black" : "text-sub hover:bg-slate-50 hover:text-ink"
                      }`}
                    >
                      <span className="font-extrabold">{l.native}</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-1.5">({l.label})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Hub */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full border border-line/80 bg-white/90 p-2 text-sub hover:text-ink hover:border-slate-300 transition-all outline-none shadow-2xs"
              aria-label="View notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell size={16} className="text-sub" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-white animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 origin-top-right rounded-3xl border border-line bg-white/95 backdrop-blur-lg p-4 shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                    <span className="text-xs font-black text-ink">Notifications</span>
                    <button onClick={markAllNotificationsRead} className="text-[10px] font-black text-primary hover:underline">Mark all read</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`rounded-2xl p-2.5 transition-colors cursor-pointer hover:bg-slate-50 ${n.unread ? "bg-slate-50/80" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary mt-1.5" />}
                          <div>
                            <p className="text-xs font-bold text-ink leading-normal">{n.text}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown or Sign In */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white pl-1.5 pr-2.5 py-1 hover:border-slate-300 hover:shadow-sm transition-all outline-none"
                aria-label="User profile settings"
                aria-expanded={showProfile}
                aria-haspopup="true"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white uppercase">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <ChevronDown size={12} className={`text-sub transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 origin-top-right rounded-3xl border border-line bg-white/95 backdrop-blur-lg p-2 shadow-2xl z-50"
                  >
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="text-xs font-black text-ink leading-tight truncate">{user.name}</p>
                      <p className="text-[10px] font-semibold text-sub mt-0.5 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      {user?.role === "admin" && (
                        <button
                          onClick={() => { navigate("/admin"); setShowProfile(false); }}
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold text-primary hover:bg-primary/5 transition-colors border-b border-slate-50 pb-2 mb-1"
                        >
                          <Settings size={14} /> Admin Portal
                        </button>
                      )}
                      <button
                        onClick={() => { navigate("/dashboard"); setShowProfile(false); }}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold text-sub hover:bg-slate-50 hover:text-ink transition-colors"
                      >
                        <Bookmark size={14} /> My Saved Schemes
                      </button>
                      <button
                        onClick={() => { navigate("/dashboard"); setShowProfile(false); }}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold text-sub hover:bg-slate-50 hover:text-ink transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </button>
                      <button
                        onClick={() => { setShowProfile(false); logout(); navigate("/"); }}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold text-danger hover:bg-red-50 transition-colors mt-1 border-t border-slate-50 pt-2"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-2xl border border-line/80 bg-white px-4 py-2 text-xs font-extrabold text-ink hover:bg-slate-50 transition-all shadow-2xs outline-none"
            >
              Sign In
            </Link>
          )}

          {/* Primary Eligibility Flow Trigger */}
          <button
            onClick={() => navigate("/onboarding")}
            className="group flex items-center gap-2 rounded-full bg-secondary hover:bg-secondaryDark text-white shadow-md shadow-secondary/20 transition-all duration-200 hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] active:scale-95 px-5 py-2 text-xs font-black outline-none"
          >
            Check Eligibility 
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="rounded-full p-2 text-sub hover:bg-slate-100 hover:text-ink md:hidden transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40" 
          onClick={() => setOpen((o) => !o)} 
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dynamic Breadcrumbs Rail (only visible on nested paths) */}
      {getBreadcrumbs()}

      {/* Mobile Drawer (Animated) */}
      <AnimatePresence>
        {open && (
          <motion.div 
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line/60 bg-white md:hidden shadow-lg"
          >
            <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile Navigation">
              {[
                ...ITEMS,
                ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin Panel", icon: Settings }] : [])
              ].map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive(it.to) 
                      ? "bg-primaryTint text-primary" 
                      : "text-sub hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  <it.icon size={16} />
                  {it.label}
                </Link>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-2 px-4 text-xs font-bold text-sub">
                <span className="flex items-center gap-1.5"><Globe size={14} /> Language</span>
                <select
                  value={lang}
                  onChange={(e) => selectLanguage(e.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-extrabold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all max-w-[150px]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Primary Action Button */}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/onboarding");
                }}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondary/95 text-white px-4 py-3 text-sm font-bold shadow-sm transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
              >
                Check Eligibility <ArrowRight size={15} />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
