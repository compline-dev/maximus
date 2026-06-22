import SiteNav from "./SiteNav.jsx";
import { HERO_IMAGE } from "../hooks/useVideoPreload.js";

export default function Hero() {
  return (
    <section
      className="hero-scroll-video relative w-full"
      style={{ backgroundColor: "#000" }}
    >
      <SiteNav />

      <div className="hero-sticky sticky top-0 h-[100dvh] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Жилой комплекс МАКСИМУС"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 block h-full w-full object-cover"
          style={{ backgroundColor: "var(--bg)" }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 72%, rgba(0,0,0,0.18) 100%)",
          }}
        />
        <div className="hero-home-veil-bottom" aria-hidden />

        <div className="hero-home-copy">
          <p className="hero-home-eyebrow">Жилой комплекс · I очередь</p>
          <h1 className="hero-home-title display">МАКСИМУС</h1>
          <p className="hero-home-lede">
            Архитектура премиум-класса на берегу города
          </p>
        </div>
      </div>
    </section>
  );
}
