import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronDown, AlertCircle, User, Briefcase, Home, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { useSchemeContext } from "../context/SchemeContext";
import { matchSchemes } from "../api";

const STEPS = [
  {
    key: "basics",
    title: "Personal Details",
    desc: "Age, gender, and disability status help filter targeted programs.",
    fields: ["age", "gender", "disability"],
    icon: User,
    color: "text-secondary",
    bg: "bg-secondary/8 border-secondary/15",
  },
  {
    key: "work",
    title: "Education & Career",
    desc: "Select details to search for student scholarships and farmer supports.",
    fields: ["occupation", "education"],
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-primary/8 border-primary/15",
  },
  {
    key: "household",
    title: "Income & Category",
    desc: "Financial stats determine eligibility for central economic aids.",
    fields: ["income", "category"],
    icon: Home,
    color: "text-accent",
    bg: "bg-accent/8 border-accent/15",
  },
  {
    key: "location",
    title: "Your Location",
    desc: "State, district, and communications help map local benefits.",
    fields: ["state", "district", "language"],
    icon: MapPin,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200/60",
  },
];

const FIELD_MAP = {
  age: { label: "Age", type: "number", placeholder: "Enter your age (e.g. 34)", min: 1, max: 120, help: "Used to determine school-age scholarships and senior pension programs." },
  gender: { label: "Gender", type: "select", options: ["Female", "Male", "Other / prefer not to say"], help: "Required for women-focused welfare schemes." },
  disability: { label: "Person with Disability (PwD)", type: "select", options: ["Yes", "No"], help: "Required for disability welfare and support schemes." },
  occupation: {
    label: "Occupation",
    type: "select",
    options: ["Student", "Farmer", "Salaried employee", "Self-employed / business owner", "Homemaker", "Unemployed / job seeker", "Retired"],
    help: "Filters job-seeker aids, farming subsidies, or business capital loans."
  },
  education: {
    label: "Highest Education Level",
    type: "select",
    options: ["Below 10th", "10th / 12th pass", "Undergraduate", "Postgraduate", "Doctorate", "Vocational / diploma"],
    help: "Required for pre-matric, post-matric, or higher study fellowship programs."
  },
  income: {
    label: "Annual Family Income",
    type: "select",
    options: ["Below ₹1,00,000", "₹1,00,000 – ₹2,50,000", "₹2,50,000 – ₹5,00,000", "₹5,00,000 – ₹8,00,000", "Above ₹8,00,000"],
    help: "Total gross family income before tax deductions."
  },
  category: { label: "Social Category", type: "select", options: ["General", "OBC", "SC", "ST", "EWS", "Prefer not to say"], help: "Determines eligibility for reserved social category benefits." },
  state: {
    label: "State / UT",
    type: "select",
    options: ["Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Tamil Nadu", "Karnataka", "Rajasthan", "Other"],
    help: "Matches state-level welfare programs."
  },
  district: { label: "District", type: "text", placeholder: "Enter your district (e.g. Varanasi)", help: "Used for municipal or local block-level grants." },
  language: {
    label: "Preferred Notification Language",
    type: "select",
    options: ["English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati"],
    help: "Language choice for notification reminders and checklists."
  }
};

// Matching animation overlay
function MatchingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
    >
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute h-12 w-12 rounded-full border-4 border-secondary/20 border-t-secondary"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute flex items-center justify-center">
          <Sparkles size={20} className="text-primary animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-black text-ink mb-2">Finding your schemes…</h3>
      <p className="text-sm font-medium text-sub max-w-xs text-center leading-relaxed">
        Our AI is analysing your profile against thousands of central and state programs.
      </p>
      <div className="mt-6 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, setProfile, setMatched, user } = useSchemeContext();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login?redirect=/onboarding");
  }, [user, navigate]);

  const total = STEPS.length;
  const current = STEPS[step];
  const StepIcon = current.icon;

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (profile.age !== undefined && profile.age !== "") {
      const numAge = parseInt(profile.age, 10);
      if (isNaN(numAge) || numAge < 1 || numAge > 120) {
        errors.age = "Please enter a valid age between 1 and 120.";
      }
    }
    if (profile.district !== undefined && profile.district !== "") {
      if (/[0-9]/.test(profile.district)) {
        errors.district = "District name should not contain numbers.";
      }
    }
    return errors;
  }, [profile]);

  const canContinue = useMemo(() => {
    const fieldsFilled = current.fields.every(
      (f) => profile[f] !== undefined && profile[f].toString().trim().length > 0
    );
    const hasErrors = current.fields.some((f) => !!fieldErrors[f]);
    return fieldsFilled && !hasErrors;
  }, [current, profile, fieldErrors]);

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (canContinue) { setDirection(1); setStep((s) => s + 1); }
  };

  const handleBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const finish = async () => {
    setSubmitting(true);
    try {
      const ranked = await matchSchemes(profile);
      setMatched(ranked);
    } catch {
      setMatched(null);
    } finally {
      setSubmitting(false);
      navigate("/schemes");
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } })
  };

  return (
    <>
      {submitting && <MatchingOverlay />}

      <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primaryTint/35 via-white to-white" />
        <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />

        <div className="w-full max-w-lg">

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black text-sub uppercase tracking-wider" aria-live="polite">
                Step {step + 1} of {total}
              </span>
              <span className="text-[11px] font-black text-primary">{Math.round(((step + 1) / total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-secondary to-orange-400 rounded-full"
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Step indicator tabs */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < step;
              const isActive = i === step;
              return (
                <div
                  key={s.key}
                  className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive ? `flex-1 gap-1.5 py-1.5 px-3 border ${s.bg}` :
                    isDone ? "h-8 w-8 bg-accent/10 border border-accent/20" :
                    "h-8 w-8 bg-slate-100 border border-slate-200"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={15} className="text-accent" />
                  ) : (
                    <Icon size={14} className={isActive ? s.color : "text-slate-400"} />
                  )}
                  {isActive && <span className={`text-[10px] font-black ${s.color} whitespace-nowrap`}>{s.title}</span>}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white/96 backdrop-blur-md border border-line/80 rounded-3xl p-7 shadow-xl overflow-hidden">

            {/* Sliding form view */}
            <div className="overflow-hidden relative min-h-[300px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={current.key}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {/* Step heading */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 mb-3 ${current.bg}`}>
                      <StepIcon size={12} className={current.color} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${current.color}`}>{current.title}</span>
                    </div>
                    <h2 className="text-xl font-black text-ink tracking-tight leading-snug">{current.title}</h2>
                    <p className="mt-1.5 text-xs font-medium text-sub leading-relaxed">{current.desc}</p>
                  </div>

                  {/* Input fields */}
                  <div className="flex flex-col gap-4.5">
                    {current.fields.map((f) => {
                      const cfg = FIELD_MAP[f];
                      const hasErr = !!fieldErrors[f];

                      return (
                        <div key={f} className="flex flex-col">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-ink">{cfg.label}</label>
                            {hasErr && (
                              <span className="text-[10px] font-bold text-danger flex items-center gap-0.5">
                                <AlertCircle size={10} /> {fieldErrors[f]}
                              </span>
                            )}
                          </div>

                          {cfg.type === "select" ? (
                            <div className="relative">
                              <select
                                value={profile[f] || ""}
                                onChange={(e) => update(f, e.target.value)}
                                className={`w-full appearance-none rounded-xl border bg-white pl-4 pr-9 py-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer shadow-sm ${
                                  hasErr ? "border-danger focus:border-danger focus:ring-danger/5" : "border-line/90"
                                } ${!profile[f] ? "text-slate-400" : "text-ink"}`}
                              >
                                <option value="">Select {cfg.label.toLowerCase()}</option>
                                {cfg.options.map((o) => (
                                  <option key={o} value={o}>{o}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-sub pointer-events-none" />
                            </div>
                          ) : (
                            <input
                              type={cfg.type}
                              value={profile[f] || ""}
                              onChange={(e) => update(f, e.target.value)}
                              placeholder={cfg.placeholder}
                              min={cfg.min}
                              max={cfg.max}
                              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-slate-400 ${
                                hasErr ? "border-danger focus:border-danger focus:ring-danger/5" : "border-line/90"
                              }`}
                            />
                          )}

                          {cfg.help && (
                            <p className="mt-1.5 text-[10px] font-medium text-slate-400 leading-relaxed">
                              💡 {cfg.help}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer controls */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line/80 hover:border-slate-300 bg-white px-5 py-3 text-sm font-bold text-sub shadow-sm transition-all active:scale-95 outline-none"
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}
              <button
                disabled={!canContinue || submitting}
                onClick={() => (step === total - 1 ? finish() : handleNext())}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primaryDark text-white py-3 px-5 text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] outline-none"
              >
                {step === total - 1 ? (
                  <>Find My Schemes <Sparkles size={15} /></>
                ) : (
                  <>Continue <ArrowRight size={15} /></>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full text-center text-xs font-medium text-slate-400 hover:text-ink transition-colors outline-none"
          >
            Cancel and return home
          </button>
        </div>
      </div>
    </>
  );
}
