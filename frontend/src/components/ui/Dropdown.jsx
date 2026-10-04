import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value || o === value);
  const displayLabel = selectedOption
    ? typeof selectedOption === "object"
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <div className={`flex flex-col relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <span className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between rounded-2xl border bg-white px-4 py-3.5 text-xs sm:text-sm font-bold text-ink outline-none transition-all shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 ${
          error ? "border-danger" : "border-line/90 hover:border-slate-300"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={16}
          className={`text-sub transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && (
        <span className="mt-1.5 text-[10px] sm:text-xs font-semibold text-danger">
          ⚠️ {error}
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-30 left-0 right-0 mt-20 max-h-60 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-xl ring-1 ring-black/5 outline-none"
          >
            {options.map((option, idx) => {
              const val = typeof option === "object" ? option.value : option;
              const text = typeof option === "object" ? option.label : option;
              const isSelected = val === value;

              return (
                <li
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(val);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none ${
                    isSelected
                      ? "bg-primary/5 text-primary"
                      : "text-sub hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  {text}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
