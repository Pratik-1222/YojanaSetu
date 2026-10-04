import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSchemeContext } from "../context/SchemeContext";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Shield, Globe2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

const BENEFITS = [
  { icon: CheckCircle2, text: "Save & track schemes across sessions" },
  { icon: Shield, text: "Profile stays private in your browser" },
  { icon: Globe2, text: "Use in English, Hindi, and 20+ languages" },
  { icon: Sparkles, text: "Personalised AI-powered recommendations" },
];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useSchemeContext();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] overflow-hidden">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between relative overflow-hidden bg-gradient-to-b from-primary to-[#0d3170] p-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-10" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-2.5 select-none">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#a5c8ff" />
                </linearGradient>
              </defs>
              <rect x="6" y="20" width="3.5" height="6" rx="1" fill="url(#lg1)" opacity="0.9" />
              <rect x="22.5" y="20" width="3.5" height="6" rx="1" fill="url(#lg1)" opacity="0.9" />
              <path d="M4.5 18C4.5 18 10 10.5 16 10.5C22 10.5 27.5 18 27.5 18" stroke="url(#lg1)" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M2.5 18H29.5" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="5.5" r="3.5" fill="#FF9933" />
            </svg>
            <span className="text-white font-black text-xl tracking-tight">
              Yojana<span className="text-secondary font-black">Setu</span>
            </span>
          </div>
        </div>

        {/* Copy */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Discover schemes you deserve.
            </h2>
            <p className="mt-3 text-sm font-semibold text-blue-200 leading-relaxed">
              Log in to save your eligibility profile, track applications, and receive personalised welfare matches.
            </p>
          </div>

          <div className="space-y-3.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white">
                  <Icon size={14} />
                </div>
                <p className="text-sm font-semibold text-blue-100">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="relative">
          <p className="text-[11px] font-semibold text-blue-300/80 leading-snug">
            Independent public-service platform. Not affiliated with any government ministry.
          </p>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white relative">
        {/* Mobile background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primaryTint/30 via-white to-white lg:hidden" />
        
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Logo size={28} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-ink tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-sm font-semibold text-sub">
              Log in to check scheme matches and track your applications.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-danger/5 border border-danger/10 p-4 text-sm font-bold text-danger">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sub pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-line bg-slate-50/50 pl-10 pr-4 py-3.5 text-sm font-bold text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sub pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-line bg-slate-50/50 pl-10 pr-4 py-3.5 text-sm font-bold text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primaryDark text-white py-3.5 text-sm font-black shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                <>
                  Log In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-line/60" />
            <span className="text-[11px] font-bold text-slate-400">or continue without signing in</span>
            <div className="flex-1 h-px bg-line/60" />
          </div>

          <Link
            to="/schemes"
            className="flex items-center justify-center w-full gap-2 rounded-full border border-line bg-white hover:bg-slate-50 text-ink text-sm font-bold py-3.5 transition-all shadow-sm hover:shadow-md hover:border-slate-300 active:scale-98"
          >
            Browse schemes without account
          </Link>

          <p className="mt-6 text-center text-xs font-bold text-slate-400">
            New to YojanaSetu?{" "}
            <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="text-primary hover:underline font-extrabold">
              Create a free account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
