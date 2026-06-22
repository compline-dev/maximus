import { useEffect, useRef, useState } from "react";

/**
 * PinnedGallery — залипающий (sticky / pinned) полноэкранный слайдер.
 *
 * Блок «прилипает» к экрану на время прокрутки своей высоты. Вертикальный
 * скролл управляет горизонтальной лентой full-bleed кадров: каждый кадр
 * задерживается по центру (hold), затем плавно уезжает, уступая следующему.
 * Текст и лёгкий Ken-Burns зум привязаны к прогрессу скролла.
 *
 *   <PinnedGallery slides={[{ label, title, desc, image, tone }]} />
 *
 * Если у кадра не задан `image`, рисуется тёплый placeholder с диагональной
 * штриховкой — замените на реальные фото через поле `image`.
 */

const DEFAULT_SLIDES = [
  {
    label: "Двор",
    title: "Зелёный двор",
    desc: "Приватная территория без машин — только пешеходные маршруты и деревья.",
    image: "/people_walking_park/park-walk-couple.webp",
    tone: "#CBC2B3",
  },
  {
    label: "Жизнь",
    title: "В своём ритме",
    desc: "Пространство, в котором приятно проводить каждый день.",
    image: "/people_walking_park/park-walk-building.webp",
    tone: "#C3B9A9",
  },
];

const DISPLAY = "'Bodoni Moda', 'Times New Roman', serif";
const UI = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const pad = (n) => String(n + 1).padStart(2, "0");
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

export default function PinnedGallery({
  slides = DEFAULT_SLIDES,
  kicker = "Архитектура · Горизонт",
  accent = "#1F3A2C",
}) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1 по высоте секции

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        setProgress(total > 0 ? clamp01(-rect.top / total) : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const n = slides.length;

  // Hold-and-ease: каждый кадр задерживается по центру, затем уезжает.
  const seg = progress * (n - 1);
  const base = Math.min(n - 2, Math.floor(seg));
  const local = n > 1 ? seg - base : 0;
  const move = clamp01((local - 0.18) / 0.64); // 18% hold / move / hold
  const pos = n > 1 ? base + smoothstep(move) : 0; // непрерывный индекс 0..n-1
  const current = Math.min(n - 1, Math.round(pos));

  return (
    <section
      ref={sectionRef}
      data-screen-label="PinnedGallery"
      style={{
        position: "relative",
        height: `${n * 70}vh`,
        background: "#0E0E0C",
        fontFamily: UI,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "#0E0E0C",
        }}
      >
        {/* Лента full-bleed кадров */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            display: "flex",
            width: `${n * 100}vw`,
            willChange: "transform",
            transform: `translateX(-${(pos * 100).toFixed(4)}vw)`,
          }}
        >
          {slides.map((s, i) => {
            const delta = i - pos; // 0 — кадр по центру
            const ad = Math.abs(delta);
            const capOpacity = clamp01(1 - ad * 1.7);
            const scale = 1.12 - Math.min(1, ad) * 0.12; // Ken Burns
            const capShift = Math.max(0, delta) * 40 + (1 - capOpacity) * 18;

            return (
              <figure
                key={i}
                style={{
                  position: "relative",
                  flex: "0 0 100vw",
                  height: "100%",
                  margin: 0,
                  overflow: "hidden",
                  backgroundColor: s.tone || "#BFB5A4",
                }}
              >
                {/* Изображение / placeholder с Ken-Burns зумом */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-6%",
                    backgroundColor: s.tone || "#BFB5A4",
                    backgroundImage: s.image
                      ? `url(${s.image})`
                      : "repeating-linear-gradient(135deg, rgba(26,22,15,0.06) 0 18px, transparent 18px 36px)",
                    backgroundSize: s.image ? "cover" : undefined,
                    backgroundPosition: "center",
                    willChange: "transform",
                    transform: `scale(${scale.toFixed(4)})`,
                  }}
                />
                {!s.image && (
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.34)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(s.label || "").toUpperCase()} — FULL BLEED
                  </span>
                )}

                {/* Затемнение снизу для читаемости текста */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.12) 42%, transparent 68%)",
                  }}
                />

                {/* Подпись */}
                <figcaption
                  style={{
                    position: "absolute",
                    left: "clamp(20px,7vw,120px)",
                    right: "clamp(20px,7vw,120px)",
                    bottom: "clamp(80px,16vh,160px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    opacity: capOpacity.toFixed(3),
                    transform: `translateY(${capShift.toFixed(1)}px)`,
                    transition: "opacity 0.1s linear, transform 0.1s linear",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.42em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      {pad(i)} / {pad(n - 1)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.42em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.82)",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 400,
                      fontSize: "clamp(2.75rem,7vw,6rem)",
                      lineHeight: 0.98,
                      letterSpacing: "0.01em",
                      color: "rgba(255,255,255,0.98)",
                      margin: 0,
                      maxWidth: "18ch",
                    }}
                  >
                    {s.title}
                  </h3>
                  {s.desc && (
                    <p
                      style={{
                        maxWidth: 460,
                        fontSize: 15,
                        lineHeight: 1.7,
                        fontWeight: 300,
                        color: "rgba(255,255,255,0.78)",
                        margin: 0,
                      }}
                    >
                      {s.desc}
                    </p>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Верхний kicker */}
        <div
          style={{
            position: "absolute",
            top: "clamp(28px,5vh,52px)",
            left: "clamp(20px,5vw,72px)",
            right: "clamp(20px,5vw,72px)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.42em",
              color: "rgba(245,243,238,0.5)",
              margin: 0,
            }}
          >
            {kicker}
          </p>
        </div>

        {/* Прогресс-бар снизу */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(28px,5vh,52px)",
            left: "clamp(20px,5vw,72px)",
            right: "clamp(20px,5vw,72px)",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            gap: 24,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "rgba(245,243,238,0.92)",
              whiteSpace: "nowrap",
            }}
          >
            {pad(current)}
          </span>
          <div
            style={{
              position: "relative",
              flex: 1,
              maxWidth: 320,
              height: 1,
              background: "rgba(245,243,238,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                background: accent,
                width: `${(progress * 100).toFixed(2)}%`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "rgba(245,243,238,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {pad(n - 1)}
          </span>
        </div>
      </div>
    </section>
  );
}
