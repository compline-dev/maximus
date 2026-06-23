import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";

const SPRING = { type: "spring", damping: 34, stiffness: 400, mass: 0.82 };

export default function MobileBottomSheet({ onClose, children }) {
  const sheetRef = useRef(null);
  const dragControls = useDragControls();
  const y = useMotionValue(typeof window !== "undefined" ? window.innerHeight : 800);

  const getCollapsedY = () => {
    const h = sheetRef.current?.offsetHeight ?? window.innerHeight * 0.72;
    return Math.max(150, Math.min(h * 0.44, window.innerHeight * 0.36));
  };

  const backdropOpacity = useTransform(
    y,
    [0, 280, typeof window !== "undefined" ? window.innerHeight : 800],
    [1, 0.35, 0],
  );

  useEffect(() => {
    y.set(window.innerHeight);
    animate(y, 0, SPRING);
  }, [y]);

  const dismiss = () => {
    animate(y, window.innerHeight, {
      duration: 0.24,
      ease: [0.4, 0, 1, 1],
    }).then(onClose);
  };

  const onDragEnd = (_, info) => {
    const cy = y.get();
    const vy = info.velocity.y;
    const collapsedY = getCollapsedY();

    if (cy > collapsedY * 0.9 || vy > 720) {
      dismiss();
      return;
    }
    if (cy > collapsedY * 0.32 || (vy > 280 && cy > 36)) {
      animate(y, collapsedY, SPRING);
      return;
    }
    animate(y, 0, SPRING);
  };

  const startDrag = (event) => {
    dragControls.start(event);
  };

  return (
    <>
      <motion.button
        type="button"
        className="flat-detail__backdrop flat-detail__backdrop--sheet"
        style={{ opacity: backdropOpacity }}
        onClick={dismiss}
        aria-label="Закрыть"
      />

      <motion.div
        ref={sheetRef}
        className="flat-detail__panel flat-detail__panel--sheet flat-detail__panel--draggable"
        style={{ y }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: window.innerHeight * 0.72 }}
        dragElastic={{ top: 0.08, bottom: 0.3 }}
        onDragEnd={onDragEnd}
      >
        <div
          className="flat-detail__drag-zone"
          onPointerDown={startDrag}
        >
          <span className="flat-detail__handle" aria-hidden="true" />
        </div>

        <div className="flat-detail__scroll">
          {children}
        </div>
      </motion.div>
    </>
  );
}
