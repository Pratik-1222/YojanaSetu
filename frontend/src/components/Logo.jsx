import { motion } from "framer-motion";

export default function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Premium SVG Icon representing a 'Setu' (Bridge) with Framer Motion animations */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cursor-pointer drop-shadow-sm"
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <defs>
          <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2545" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#E67E00" />
          </linearGradient>
        </defs>

        {/* Bridge Pillars */}
        <rect x="6" y="20" width="3.5" height="6" rx="1" fill="url(#bridgeGrad)" />
        <rect x="22.5" y="20" width="3.5" height="6" rx="1" fill="url(#bridgeGrad)" />
        
        {/* The Bridge Arch */}
        <path
          d="M4.5 18C4.5 18 10 10.5 16 10.5C22 10.5 27.5 18 27.5 18"
          stroke="url(#bridgeGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        
        {/* Roadway line */}
        <path
          d="M2.5 18H29.5"
          stroke="url(#bridgeGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Saffron digital node with glowing pulse */}
        <motion.circle 
          cx="16" 
          cy="5.5" 
          r="3.5" 
          fill="url(#saffronGrad)" 
          animate={{
            scale: [1, 1.25, 1],
            opacity: [1, 0.85, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
      
      <motion.span 
        className="font-black tracking-tight text-ink flex items-center" 
        style={{ fontSize: size * 0.72 }}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        Yojana<span className="text-secondary font-black ml-0.5">Setu</span>
      </motion.span>
    </div>
  );
}

