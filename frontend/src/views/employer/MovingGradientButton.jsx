import { motion } from "framer-motion";

export default function MovingGradientButton({ onClick, loading, children, loadingText }) {
  return (
    <button
      data-testid="send-payroll-btn"
      onClick={onClick}
      disabled={loading}
      className="group relative inline-flex items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#17B79C_0%,#5AA8F4_100%)] p-[1px] text-white shadow-[0_18px_32px_rgba(23,183,156,0.24)] transition hover:translate-y-[-1px] disabled:cursor-wait disabled:opacity-70"
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),transparent_40%,rgba(255,255,255,0.2)_100%)] opacity-70 transition group-hover:opacity-100" />
      <span className="relative inline-flex items-center gap-3 rounded-full bg-[rgba(18,32,43,0.08)] px-6 py-3.5 font-display text-base font-semibold tracking-[-0.02em] backdrop-blur-md">
        {loading ? (
          <>
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-white"
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            {loadingText}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
