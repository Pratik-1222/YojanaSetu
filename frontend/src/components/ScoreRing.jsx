import { motion } from "framer-motion";

export default function ScoreRing({ value }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  
  const isHigh = value >= 80;
  const isMid = value >= 60;

  const strokeGradientId = isHigh ? "gradSuccess" : isMid ? "gradWarning" : "gradNeutral";
  const textColor = isHigh ? "#059669" : isMid ? "#FF9933" : "#475569";

  return (
    <div 
      className="relative flex h-12 w-12 items-center justify-center select-none"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Eligibility Match: ${value}%`}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <defs>
          <linearGradient id="gradSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gradWarning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#E67E00" />
          </linearGradient>
          <linearGradient id="gradNeutral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle 
          cx="24" 
          cy="24" 
          r={r} 
          fill="none" 
          stroke="#E2E8F0" 
          strokeWidth="4" 
        />
        {/* Progress circle */}
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={`url(#${strokeGradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (value / 100) * c }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Centered text */}
      <span className="absolute text-[11px] font-black" style={{ color: textColor }}>
        {value}%
      </span>
    </div>
  );
}

