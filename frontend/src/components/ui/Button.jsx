import { motion } from "framer-motion";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "solid", // 'solid' | 'outline' | 'tinted' | 'ghost'
  tone = "primary",  // 'primary' | 'secondary' | 'accent' | 'danger'
  size = "md",       // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  className = "",
  icon: Icon,
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 outline-none select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantStyles = {
    solid: {
      primary: "bg-primary hover:bg-primaryDark text-white shadow-sm hover:shadow-md",
      secondary: "bg-secondary hover:bg-secondary/95 text-white shadow-sm hover:shadow-md",
      accent: "bg-accent hover:bg-accent/95 text-white shadow-sm hover:shadow-md",
      danger: "bg-danger hover:bg-danger/95 text-white shadow-sm hover:shadow-md",
    },
    outline: {
      primary: "border border-primary text-primary hover:bg-primary/5",
      secondary: "border border-secondary text-secondary hover:bg-secondaryTint/45",
      accent: "border border-accent text-accent hover:bg-accentTint/45",
      danger: "border border-danger text-danger hover:bg-red-50",
    },
    tinted: {
      primary: "bg-primaryTint text-primary border border-primary/10 hover:bg-primary/10",
      secondary: "bg-secondaryTint text-secondary border border-secondary/15 hover:bg-secondary/15",
      accent: "bg-accentTint text-accent border border-accent/15 hover:bg-accent/15",
      danger: "bg-red-50 text-danger border border-red-200 hover:bg-red-100/50",
    },
    ghost: {
      primary: "text-primary hover:bg-primary/5",
      secondary: "text-secondary hover:bg-secondary/5",
      accent: "text-accent hover:bg-accent/5",
      danger: "text-danger hover:bg-red-50",
    },
  };

  const selectedVariant = variantStyles[variant]?.[tone] || variantStyles.solid.primary;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  const Component = disabled || loading ? "button" : motion.button;
  const interactiveProps = disabled || loading ? {} : { whileTap: { scale: 0.97 } };

  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${selectedSize} ${selectedVariant} ${className}`}
      {...interactiveProps}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="shrink-0" />
      ) : null}
      {children}
    </Component>
  );
}
