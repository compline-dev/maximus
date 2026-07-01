import { useState, useEffect } from "react";
import SiteNav from "./SiteNav.jsx";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function Hero({ data, onReady }) {
  const [imgLoaded, setImgLoaded] = useState(!data.backgroundImage);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (imgLoaded) onReady?.();
  }, [imgLoaded]);

  const imgStyle = reducedMotion
    ? { opacity: imgLoaded ? 1 : 0, transition: `opacity 0.6s ${EASE}` }
    : {
        opacity: imgLoaded ? 1 : 0,
        transform: imgLoaded ? "scale(1)" : "scale(1.04)",
        transition: `opacity 1.4s ${EASE}, transform 1.8s ${EASE}`,
      };

  const copyStyle = reducedMotion
    ? { opacity: imgLoaded ? 1 : 0, transition: `opacity 0.6s ${EASE} 0.2s` }
    : {
        opacity: imgLoaded ? 1 : 0,
        transform: imgLoaded ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 1s ${EASE} 0.3s, transform 1.2s ${EASE} 0.3s`,
      };

  return (
    <section
      className="hero-scroll-video relative w-full"
      style={{ backgroundColor: "var(--accent)" }}
    >
      <SiteNav />

      <div className="hero-sticky sticky top-0 h-[100dvh] w-full overflow-hidden">
        {data.backgroundImage && (
          <img
            src={data.backgroundImage}
            alt={`Жилой комплекс ${data.title}`}
            fetchPriority="high"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className="absolute inset-0 block h-full w-full object-cover"
            style={imgStyle}
          />
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 72%, rgba(0,0,0,0.18) 100%)",
          }}
        />
        <div className="hero-home-veil-bottom" aria-hidden />

        <div className="hero-home-copy" style={copyStyle}>
          <p className="hero-home-eyebrow">{data.eyebrow}</p>
          <h1 className="hero-home-title display">{data.title}</h1>
          <p className="hero-home-lede">{data.subtitle}</p>
        </div>
      </div>
    </section>
  );
}
