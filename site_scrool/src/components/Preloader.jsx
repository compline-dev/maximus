import { AnimatePresence, motion } from "framer-motion";

export default function Preloader({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}
    </AnimatePresence>
  );
}
