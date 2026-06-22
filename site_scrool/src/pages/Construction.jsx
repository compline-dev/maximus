import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import SiteNav from "../components/SiteNav.jsx";
import Preloader from "../components/Preloader.jsx";
import { useImageSequence } from "../hooks/useImageSequence.js";

const FRAME_FOLDER = "/construction-webp";
const FRAME_COUNT = 295;
const INITIAL_FRAMES = 40;

export default function Construction() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const lastDrawnIndexRef = useRef(-1);
  const rafIdRef = useRef(null);
  const [inCanvasScrub, setInCanvasScrub] = useState(true);

  const handleFrameLoaded = useCallback(() => {
    lastDrawnIndexRef.current = -1;
    drawRef.current(getFrameIndexFromScrollRef.current());
  }, []);

  const {
    framesRef,
    loadedCount,
    total,
    initialLoadedCount,
    initialTarget,
    initialReady,
    ready: allReady,
  } = useImageSequence({
    folder: FRAME_FOLDER,
    count: FRAME_COUNT,
    prefix: "frame_",
    ext: "webp",
    pad: 4,
    startIndex: 1,
    initialCount: INITIAL_FRAMES,
    onFrameLoaded: handleFrameLoaded,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const frameCount = FRAME_COUNT;

  const progress = useMemo(() => {
    if (initialTarget <= 0) return 1;
    return Math.min(1, initialLoadedCount / initialTarget);
  }, [initialLoadedCount, initialTarget]);

  const getFrameIndexFromScroll = useCallback(() => {
    if (frameCount === 0) return 0;
    const p = Math.min(1, Math.max(0, scrollYProgress.get()));
    return Math.round(p * (frameCount - 1));
  }, [frameCount, scrollYProgress]);

  const draw = useCallback(
    (rawIndex) => {
      const canvas = canvasRef.current;
      const frames = framesRef.current;
      if (!canvas || frameCount === 0) return;

      const index = Math.min(frameCount - 1, Math.max(0, Math.round(rawIndex)));

      const img = frames[index];
      if (!img) return;

      if (index === lastDrawnIndexRef.current) return;

      const ctx = canvas.getContext("2d");
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      const scale = Math.max(cw / img.width, ch / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);

      lastDrawnIndexRef.current = index;
    },
    [framesRef, frameCount],
  );

  const drawRef = useRef(draw);
  drawRef.current = draw;

  const getFrameIndexFromScrollRef = useRef(getFrameIndexFromScroll);
  getFrameIndexFromScrollRef.current = getFrameIndexFromScroll;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnIndexRef.current = -1;
      drawRef.current(getFrameIndexFromScrollRef.current());
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (loadedCount === 0) return;
    lastDrawnIndexRef.current = -1;
    drawRef.current(getFrameIndexFromScrollRef.current());
  }, [loadedCount]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // scrub идёт пока progress < 1; как только достигли конца — кадры закончились
    setInCanvasScrub(v < 0.9999);

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      drawRef.current(getFrameIndexFromScrollRef.current());
    });
  });

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <>
      <Preloader
        progress={progress}
        visible={!initialReady}
        detail={`Ход строительства · ${initialTarget} кадров`}
      />

      <section
        ref={sectionRef}
        className="relative w-full hero-scroll-canvas"
        style={{ backgroundColor: "#000" }}
      >
        <SiteNav forceTransparent={inCanvasScrub} />

        <div className="hero-sticky sticky top-0 h-[100dvh] w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block h-full w-full"
            style={{ backgroundColor: "#000" }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.34) 100%)",
            }}
          />

          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
            <p className="mb-6 max-w-xs text-balance text-[10px] uppercase tracking-[0.28em] text-white/45 sm:mb-8 sm:max-w-none sm:text-[11px] sm:tracking-[0.5em]">
              Ход строительства
            </p>
            <h1
              className="display font-normal uppercase leading-[0.88] text-white/95"
              style={{
                fontSize: "clamp(3.25rem, 10vw, 9rem)",
                letterSpacing: "0.12em",
              }}
            >
              МАКСИМУС
            </h1>
          </div>

          {!allReady && total > 0 && (
            <div className="canvas-frames-progress" aria-live="polite">
              <span className="canvas-frames-progress-label">
                Кадры {loadedCount}/{total}
              </span>
              <div className="canvas-frames-progress-track">
                <div
                  className="canvas-frames-progress-bar"
                  style={{ width: `${(loadedCount / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">Прогресс</p>
          <h2 className="display">Покадровая визуализация строительства</h2>
          <p className="lede">
            Прокрутите страницу — рендер идёт по кадрам. Остальные кадры догружаются в фоне,
            поэтому первый экран появляется быстро.
          </p>
        </div>
      </section>
    </>
  );
}
