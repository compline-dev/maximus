import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView.js";

const MAP_WIDGET_SRC =
  "https://yandex.ru/map-widget/v1/?ll=56.024095%2C54.720458&z=15";
const MAP_LINK =
  "https://yandex.ru/maps/172/ufa/house/ulitsa_mendeleyeva_154/YU8YdgViT0QCQFtufXtzcXhiZw==/?ll=56.024095%2C54.720458&z=15.47";

const INFRASTRUCTURE = [
  "ТРЦ Башкирия",
  "ТРЦ Иремель",
  "ТРЦ Аркада",
  "школы и гимназии",
  "детские сады",
  "рестораны и кафе",
  "спортивные объекты",
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * LocationSection — полноэкранный блок 50/50: стеклянный текст слева, карта справа.
 */
export default function LocationSection({ mapSrc }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, "120px");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const glassStyle = reducedMotion
    ? { opacity: inView ? 1 : 0, transition: `opacity 0.6s ${EASE}` }
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 1s ${EASE} 0.15s, transform 1.2s ${EASE} 0.15s`,
      };

  return (
    <section
      ref={sectionRef}
      id="location"
      data-screen-label="LocationSection"
      className="loc"
    >
      <div className="loc-split">
        <div className="loc-glass" style={glassStyle}>
          <span className="loc-eyebrow">Локация</span>
          <h2 className="loc-title">
            МАКСИМУС расположен в одном из самых зелёных районов Уфы
          </h2>
          <p className="loc-sub">вся необходимая инфраструктура</p>
          <ul className="loc-list">
            {INFRASTRUCTURE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="loc-visual">
          {mapSrc ? (
            <img
              src={mapSrc}
              alt="Расположение ЖК МАКСИМУС на карте Уфы"
              className="loc-map"
              loading="lazy"
              decoding="async"
            />
          ) : inView ? (
            <iframe
              title="Расположение ЖК МАКСИМУС на карте Уфы"
              src={MAP_WIDGET_SRC}
              className="loc-map-frame"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="loc-map-placeholder" aria-hidden="true" />
          )}

          <a
            href={MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="loc-map-open"
            aria-label="Открыть МАКСИМУС в Яндекс Картах"
          >
            ↗
          </a>
        </div>
      </div>
    </section>
  );
}
