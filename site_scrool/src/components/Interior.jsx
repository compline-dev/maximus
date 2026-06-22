import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Interior — full-bleed видео фон + текстовый оверлей.
 *
 * Переход с Hero вынесен в отдельный <MaximusBridge> — этот компонент
 * теперь чистый: только sticky видео и оверлей с текстом.
 *
 * Видео:
 *   Чёрные полосы по бокам были вшиты в исходник (1920×1080 экспорт
 *   контента 16:7). Перекодировано в /video/maximus-interior.mp4
 *   как 1648×1072, без аудио, faststart.
 */

const VIDEO_SRC = "/video/maximus-interior.mp4";

export default function Interior() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Текстовый оверлей появляется когда видео уже видно и уезжает к концу
  const range = [0.1, 0.3, 0.65, 0.85];

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      // Чистый --bg — стыки с Hero сверху и Architecture снизу бесшовны
      // (тот же цвет). Видео всё равно закрывает фон во время пина.
      style={{ height: "160vh", backgroundColor: "var(--bg)" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 block h-full w-full object-cover"
          style={{ backgroundColor: "var(--bg)" }}
        />

        {/* Виньетка + затемнения для читаемости */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 58%, rgba(0,0,0,0.34) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40vh]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
        />

        <Overlay progress={scrollYProgress} range={range} />
      </div>
    </section>
  );
}

/* ---------- Overlay ---------------------------------------------------- */

function Overlay({ progress, range }) {
  const [enter, peak, hold, exit] = range;

  const containerOpacity = useTransform(
    progress,
    [enter, peak, hold, exit],
    [0, 1, 1, 0]
  );

  const eyebrowOpacity = useTransform(
    progress,
    [enter, enter + (peak - enter) * 0.5],
    [0, 1]
  );
  const eyebrowY = useTransform(
    progress,
    [enter, enter + (peak - enter) * 0.5],
    [12, 0]
  );

  const bodyStart = enter + (peak - enter) * 0.75;
  const bodyEnd = peak + (hold - peak) * 0.3;
  const bodyOpacity = useTransform(progress, [bodyStart, bodyEnd], [0, 1]);
  const bodyY = useTransform(progress, [bodyStart, bodyEnd], [20, 0]);

  return (
    <motion.div
      style={{ opacity: containerOpacity }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.p
        style={{ opacity: eyebrowOpacity, y: eyebrowY }}
        className="mb-6 text-[11px] uppercase tracking-[0.5em] text-white/65"
      >
        02 · МАКСИМУС внутри
      </motion.p>

      <RevealTitle
        lines={["Тишина внутри", "шумного города."]}
        progress={progress}
        range={range}
      />

      <motion.p
        style={{ opacity: bodyOpacity, y: bodyY }}
        className="mt-8 max-w-xl text-balance text-sm leading-relaxed text-white/70 md:text-base"
      >
        Высокие потолки, натуральный камень и панорамное остекление.
        МАКСИМУС — место, где архитектура продолжается за порогом квартиры.
      </motion.p>
    </motion.div>
  );
}

/* ---------- Word reveal (mask up-from-bottom) ------------------------- */

function RevealTitle({ lines, progress, range }) {
  const [enter, peak, hold, exit] = range;

  const descriptors = [];
  let counter = 0;
  for (const line of lines) {
    const words = line.split(" ");
    descriptors.push({ words, startIdx: counter });
    counter += words.length;
  }
  const total = Math.max(counter, 1);
  const span = Math.max(peak - enter, 0.001);
  const stagger = (span * 0.4) / total;

  return (
    <h2
      className="font-display leading-[1.04] tracking-[0.01em] text-white/95"
      style={{
        fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)",
        textShadow: "0 2px 50px rgba(0,0,0,0.55)",
      }}
    >
      {descriptors.map(({ words, startIdx }, li) => (
        <div key={li} className="block">
          {words.map((word, wi) => {
            const idx = startIdx + wi;
            return (
              <RevealWord
                key={wi}
                word={word}
                progress={progress}
                range={[
                  enter + idx * stagger,
                  peak + idx * stagger * 0.4,
                  hold,
                  exit,
                ]}
                isLast={wi === words.length - 1}
              />
            );
          })}
        </div>
      ))}
    </h2>
  );
}

function RevealWord({ word, progress, range, isLast }) {
  const y = useTransform(progress, range, ["110%", "0%", "0%", "-110%"]);
  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ marginRight: isLast ? 0 : "0.22em", paddingBottom: "0.08em" }}
    >
      <motion.span className="inline-block will-change-transform" style={{ y }}>
        {word}
      </motion.span>
    </span>
  );
}
