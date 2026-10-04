import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSchemeContext } from "../context/SchemeContext";
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Shield, Sparkles, Building2 } from "lucide-react";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useSchemeContext();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-line/80 shadow-2xl overflow-hidden">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-8">
              <Logo size="md" variant="white" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
              <Sparkles size={13} />
              <span>Instant Scheme Access</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white mb-3">
              Unlock Your Government Welfare Benefits
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              Create a free account to personalize match recommendations, save target schemes, and get automated eligibility notifications.
            </p>

            <div className="space-y-3.5 border-t border-white/10 pt-6">
              {[
                { icon: CheckCircle2, text: "AI eligibility screening in 30 seconds" },
                { icon: Shield, text: "Strict privacy: No Aadhaar data stored" },
                { icon: Building2, text: "Coverage across 500+ Central & State schemes" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/10 text-xs text-slate-400">
            Citizen Assistance Portal • Free & Open Access
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-ink tracking-tight">Create your Account</h3>
            <p className="mt-1 text-xs sm:text-sm font-medium text-sub">
              Fill in your basic details to start discovering citizen welfare programs.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-danger/10 border border-danger/20 p-4 text-xs font-bold text-danger animate-shake">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-extrabold text-ink uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full rounded-2xl border border-line bg-slate-50/50 pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-extrabold text-ink uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-line bg-slate-50/50 pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-extrabold text-ink uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full rounded-2xl border border-line bg-slate-50/50 pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primaryDark text-white py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center">
            <p className="text-xs font-semibold text-sub">
              Already have an account?{" "}
              <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-primary hover:underline font-extrabold">
                Log In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

