import { motion } from "framer-motion";

const VARIANTS = {
  tinted: {
    primary: "bg-primary/5 text-primary border border-primary/10",
    secondary: "bg-secondaryTint text-secondary border border-secondary/15",
    success: "bg-accentTint text-accent border border-accent/15",
    warning: "bg-yellow-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    neutral: "bg-slate-100 text-sub border border-slate-200",
  },
  outline: {
    primary: "bg-transparent text-primary border border-primary",
    secondary: "bg-transparent text-secondary border border-secondary",
    success: "bg-transparent text-accent border border-accent",
    warning: "bg-transparent text-amber-600 border border-amber-500",
    danger: "bg-transparent text-red-600 border border-red-500",
    neutral: "bg-transparent text-sub border border-slate-300",
  },
  solid: {
    primary: "bg-primary text-white border border-transparent",
    secondary: "bg-secondary text-white border border-transparent",
    success: "bg-accent text-white border border-transparent",
    warning: "bg-amber-500 text-white border border-transparent",
    danger: "bg-red-600 text-white border border-transparent",
    neutral: "bg-sub text-white border border-transparent",
  }
};

const DOT_COLORS = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-accent",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-slate-400",
};

export default function Badge({ 
  children, 
  tone = "primary", 
  variant = "tinted", 
  dot = false, 
  onClick = null 
}) {
  const isInteractive = typeof onClick === "function";
  const badgeClasses = `inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold leading-normal transition-all ${
    VARIANTS[variant]?.[tone] || VARIANTS.tinted.primary
  } ${isInteractive ? "cursor-pointer select-none" : ""}`;

  const Component = isInteractive ? motion.span : "span";
  const interactiveProps = isInteractive 
    ? {
        whileHover: { scale: 1.04 },
        whileTap: { scale: 0.96 },
        onClick
      }
    : {};

  return (
    <Component className={badgeClasses} {...interactiveProps}>
      {dot && (
        <span 
          className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone] || "bg-primary"}`} 
          aria-hidden="true" 
        />
      )}
      {children}
    </Component>
  );
}
