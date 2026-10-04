import { forwardRef } from "react";

const Input = forwardRef(({
  label,
  type = "text",
  error,
  helpText,
  icon: Icon,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sub pointer-events-none"
          />
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-xs sm:text-sm font-bold text-ink outline-none transition-all shadow-sm placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/5"
              : "border-line/90 hover:border-slate-300"
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="mt-1.5 text-[10px] sm:text-xs font-semibold text-danger flex items-center gap-1">
          ⚠️ {error}
        </span>
      ) : helpText ? (
        <span className="mt-1.5 text-[10px] sm:text-xs font-semibold text-sub tracking-wide">
          💡 {helpText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
