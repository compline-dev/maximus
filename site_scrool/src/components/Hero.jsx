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

  const barStyle = reducedMotion
    ? { opacity: imgLoaded ? 1 : 0, transition: `opacity 0.6s ${EASE} 0.4s` }
    : {
        opacity: imgLoaded ? 1 : 0,
        transform: imgLoaded ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 1s ${EASE} 0.5s, transform 1.2s ${EASE} 0.5s`,
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

        <div className="hero-info-bar" style={barStyle}>
          <div className="hero-info-bar__tags">
            <span className="hero-info-bar__tag hero-info-bar__tag--accent">Бизнес-класс</span>
            <span className="hero-info-bar__tag">ул. Менделеева, 154</span>
            <span className="hero-info-bar__tag">Сдача IV кв. 2027</span>
          </div>
          <div className="hero-info-bar__stats">
            <div className="hero-info-bar__stat">
              <span className="hero-info-bar__stat-label">площадь</span>
              <span className="hero-info-bar__stat-value">45–128 м²</span>
            </div>
            <div className="hero-info-bar__stat">
              <span className="hero-info-bar__stat-label">цена</span>
              <span className="hero-info-bar__stat-value">от 8,5 млн ₽</span>
            </div>
          </div>
          <div className="hero-info-bar__actions">
            <a href="/flats" className="hero-info-bar__btn hero-info-bar__btn--primary">Выбрать квартиру</a>
            <button type="button" className="hero-info-bar__btn hero-info-bar__btn--glass">Записаться на показ</button>
          </div>
          <p className="hero-info-bar__legal">Застройщик: СЗ «Строитек»&ensp;·&ensp;Финансирование: Сбербанк</p>
        </div>
      </div>
    </section>
  );
}
