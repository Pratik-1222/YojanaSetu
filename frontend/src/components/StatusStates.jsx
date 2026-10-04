import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  SearchX, 
  BookmarkX, 
  WifiOff, 
  FileQuestion, 
  RotateCw,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

// 1. Loading State
export function LoadingState({ label = "Loading schemes…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative flex items-center justify-center">
        <motion.div 
          className="h-10 w-10 rounded-full border-2 border-line border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute h-5 w-5 rounded-full bg-secondaryTint"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p 
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-xs font-bold text-sub"
        aria-live="polite"
      >
        {label}
      </motion.p>
    </div>
  );
}

// 2. Error State
export function ErrorState({ message = "Unable to connect to service.", onRetry }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle size={26} />
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-ink">System Error</h4>
        <p className="mt-1.5 text-xs font-semibold text-sub leading-relaxed">{message}</p>
        <p className="mt-1 text-[11px] font-semibold text-slate-400">
          Make sure your local server is running or check your connection.
        </p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primaryDark text-white px-4.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RotateCw size={12} /> Try Again
        </button>
      )}
    </motion.div>
  );
}

// 3. No Search Results State
export function EmptySearchState({ query, onClear }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-sub">
        <SearchX size={26} />
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-ink">No schemes matched</h4>
        <p className="mt-1 text-xs font-semibold text-sub max-w-xs leading-relaxed">
          We couldn't find matches for <span className="font-extrabold text-primary">"{query}"</span>. Try adjusting your filter parameters or checking your keywords.
        </p>
      </div>
      {onClear && (
        <button 
          onClick={onClear}
          className="rounded-full border border-line bg-white hover:border-slate-300 hover:text-ink px-4.5 py-2 text-xs font-bold text-sub shadow-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Reset Filters
        </button>
      )}
    </motion.div>
  );
}

// 4. No Saved Schemes State
export function EmptySavedState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondaryTint text-secondary">
        <BookmarkX size={26} />
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-ink">No Bookmarked Schemes</h4>
        <p className="mt-1.5 text-xs font-semibold text-sub max-w-xs leading-relaxed">
          Keep track of schemes you want to apply for by clicking the bookmark button on any scheme card.
        </p>
      </div>
      <Link 
        to="/schemes" 
        className="inline-flex items-center gap-1 rounded-full bg-primary hover:bg-primaryDark text-white px-4.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Browse Schemes <ArrowRight size={12} />
      </Link>
    </motion.div>
  );
}

// 5. Offline State
export function OfflineState({ onCheck }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <WifiOff size={26} />
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-ink">Connection Lost</h4>
        <p className="mt-1.5 text-xs font-semibold text-sub max-w-xs leading-relaxed">
          Please check your network status. YojanaSetu is offline and unable to retrieve data.
        </p>
      </div>
      {onCheck && (
        <button 
          onClick={onCheck}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primaryDark text-white px-4.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Check Connectivity
        </button>
      )}
    </motion.div>
  );
}

// 6. 404 Page Not Found State
export function NotFoundState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-sub shadow-sm">
        <FileQuestion size={32} />
      </div>
      <div>
        <h1 className="text-4xl font-black text-primary tracking-tight">404</h1>
        <h2 className="text-lg font-extrabold text-ink mt-2">Page Not Found</h2>
        <p className="mt-2 text-sm font-semibold text-sub max-w-md leading-relaxed">
          The page you are looking for doesn't exist or has been relocated.
        </p>
      </div>
      <Link 
        to="/" 
        className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primaryDark text-white px-5.5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Return to Home Page
      </Link>
    </motion.div>
  );
}

// 7. Card Grid Skeleton Loader
export function CardSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-line bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="h-5 w-24 rounded-full bg-slate-200" />
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-3.5 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-slate-100" />
          <div className="flex items-center justify-between border-t border-slate-100/50 pt-4">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-4 w-12 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 8. Detail View Skeleton Loader
export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-2">
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="h-5 w-20 rounded-full bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-200" />
          </div>
          <div className="h-14 w-14 rounded-full bg-slate-200 shrink-0" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100/50">
          <div className="h-8 w-32 rounded-full bg-slate-200" />
          <div className="h-8 w-28 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="h-12 w-full rounded-2xl bg-slate-200" />
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="h-5 w-1/4 rounded bg-slate-200" />
        <div className="h-4.5 w-5/6 rounded bg-slate-200" />
        <div className="h-4.5 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}
