const PHOTOS = [
  {
    src: "/photo/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_1_min.webp",
    num: "01",
    title: "Фасад",
    desc: "Спокойная геометрия и благородные пропорции.",
  },
  {
    src: "/photo/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_5_min.webp",
    num: "02",
    title: "Детали",
    desc: "Натуральные материалы и продуманная фактура.",
  },
  {
    src: "/photo/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_8_min.webp",
    num: "03",
    title: "Пространство",
    desc: "Свет, который меняет настроение в течение дня.",
  },
  {
    src: "/photo/hf_20260525_091823_b96533eb-d7cb-40f1-96e2-ea8e0667f895_cell_7_min.webp",
    num: "04",
    title: "Атмосфера",
    desc: "Тишина и комфорт в каждой детали.",
  },
];

function PhotoFrame({ src, alt }) {
  return (
    <div className="editorial-ph">
      <img src={src} alt={alt} className="editorial-img" loading="lazy" decoding="async" />
    </div>
  );
}

function PhotoCaption({ num, title, desc }) {
  return (
    <figcaption className="cap">
      <div className="l">
        <span className="num">{num}</span>
        <span className="ttl">{title}</span>
      </div>
      <p className="desc">{desc}</p>
    </figcaption>
  );
}

import { useLeadModal } from "./LeadModal.jsx";

/** Editorial — 2-up split, сезонный eyebrow, текстовый CTA. */
export default function Editorial() {
  const { open } = useLeadModal();

  const pairs = [
    [PHOTOS[0], PHOTOS[1]],
    [PHOTOS[2], PHOTOS[3]],
  ];

  const features = [
    "Арки как ключевой архитектурный элемент",
    "Неоклассика в современном прочтении",
    "Выразительный силуэт здания",
  ];

  return (
    <section className="section editorial" id="about">
      <div className="wrap">
        <h2 className="display">Архитектура вне времени</h2>
        <ul className="vrezka editorial-vrezka">
          {features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-solid editorial-cta"
          onClick={() => open({ title: "Выбрать квартиру", kicker: "Резиденции" })}
        >
          Выбрать квартиру
        </button>

        {pairs.map((pair) => (
          <div key={pair[0].src} className="editorial-split">
            {pair.map((photo) => (
              <figure key={photo.src} className="editorial-split-item">
                <PhotoFrame src={photo.src} alt={photo.title} />
                <PhotoCaption {...photo} />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
