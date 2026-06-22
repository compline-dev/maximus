import { AnimatePresence, motion } from "framer-motion";

export default function Preloader({
  progress = 0,
  visible,
  detail,
  indeterminate = false,
}) {
  const pct = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--bg)" }}
        >
          <div className="flex w-full max-w-[420px] flex-col items-center px-8">
            <div className="mb-10 flex w-full items-baseline justify-between text-[11px] uppercase tracking-[0.42em] text-[color:var(--fg-faint)]">
              <span>МАКСИМУС</span>
              <span>Загрузка</span>
            </div>

            <div className="relative h-px w-full overflow-hidden bg-[var(--hairline)]">
              {indeterminate ? (
                <motion.div
                  className="absolute inset-y-0 bg-[var(--accent)]"
                  style={{ width: "33%" }}
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{
                    duration: 1.4,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              ) : (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                  style={{ width: `${pct}%` }}
                  transition={{ ease: "linear" }}
                />
              )}
            </div>

            <div className="mt-6 flex w-full items-baseline justify-between tabular-nums">
              <span className="text-xs text-[color:var(--fg-faint)]">
                {detail ?? "Медиа"}
              </span>
              {indeterminate ? (
                <span className="font-display text-xl text-[color:var(--fg-strong)]">
                  Загрузка...
                </span>
              ) : (
                <span className="font-display text-3xl text-[color:var(--fg-strong)]">
                  {String(pct).padStart(3, "0")}
                  <span className="text-[color:var(--fg-faint)]">%</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
