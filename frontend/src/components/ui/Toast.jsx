import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({
  message,
  type = "info", // 'success' | 'warning' | 'error' | 'info'
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    error: "bg-red-50 border-red-100 text-red-800",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
    info: "bg-primaryTint border-primary/10 text-primary"
  };

  const icons = {
    success: <CheckCircle2 size={16} className="text-accent" />,
    error: <AlertCircle size={16} className="text-danger" />,
    warning: <AlertCircle size={16} className="text-warning" />,
    info: <Info size={16} className="text-primary" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 shadow-xl max-w-sm ${typeStyles[type]}`}
            role="status"
          >
            {icons[type]}
            <p className="text-xs sm:text-sm font-extrabold leading-normal">{message}</p>
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-0.5 hover:bg-slate-900/5 transition-colors"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
