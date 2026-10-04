import { Link } from "react-router-dom";
import Logo from "./Logo";
import { MessageSquare, LayoutGrid, User, Shield, Accessibility, HelpCircle, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/60 bg-white no-print">
      {/* Main Footer Body */}
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand Column */}
        <div className="lg:col-span-1 space-y-4">
          <Logo size={26} />
          <p className="text-xs font-semibold leading-relaxed text-sub max-w-xs">
            YojanaSetu helps Indian citizens discover government welfare schemes they qualify for, with plain-language guidance and official application links.
          </p>
          <div className="inline-flex items-start gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-3.5 py-2.5 text-[11px] font-semibold text-amber-800 leading-snug max-w-xs">
            <Shield size={13} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong className="font-extrabold">Independent platform.</strong> Not an official government website. Always verify on official portals before applying.
            </span>
          </div>
        </div>

        {/* Platform Links */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</span>
          <ul className="space-y-2.5">
            {[
              { to: "/schemes", icon: LayoutGrid, label: "Browse Schemes" },
              { to: "/assistant", icon: MessageSquare, label: "AI Assistant" },
              { to: "/dashboard", icon: User, label: "My Dashboard" },
              { to: "/onboarding", icon: Heart, label: "Check Eligibility" },
            ].map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-2 text-xs font-semibold text-sub hover:text-primary transition-colors group"
                >
                  <Icon size={13} className="text-slate-300 group-hover:text-primary transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support</span>
          <ul className="space-y-2.5">
            {[
              { icon: Shield, label: "Privacy Policy" },
              { icon: Accessibility, label: "Accessibility Statement" },
              { icon: HelpCircle, label: "Help & FAQ" },
            ].map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="flex items-center gap-2 text-xs font-semibold text-sub hover:text-ink transition-colors cursor-pointer group">
                  <Icon size={13} className="text-slate-300 group-hover:text-ink transition-colors" />
                  {label}
                </span>
              </li>
            ))}
            <li>
              <a
                href="https://www.india.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-sub hover:text-primary transition-colors group"
              >
                <ExternalLink size={13} className="text-slate-300 group-hover:text-primary transition-colors" />
                Official India Portal
              </a>
            </li>
          </ul>
        </div>

        {/* Trust & Info Column */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trust & Safety</span>
          <div className="space-y-3">
            {[
              { icon: "🔒", label: "100% Privacy-First", desc: "Profile data stays in your browser" },
              { icon: "✅", label: "No Signup Required", desc: "Use without creating an account" },
              { icon: "📋", label: "Verified Checklists", desc: "Document guides for each scheme" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="text-xs font-extrabold text-ink">{label}</p>
                  <p className="text-[11px] font-semibold text-slate-400 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-line/50 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-semibold text-slate-400">
          <span>© {year} YojanaSetu. Independent public-service platform. Not affiliated with any government ministry.</span>
          <span className="flex items-center gap-1">
            Made with <Heart size={10} className="text-secondary fill-secondary" /> for Indian citizens
          </span>
        </div>
      </div>
    </footer>
  );
}
