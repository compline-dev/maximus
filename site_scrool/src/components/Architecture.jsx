import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Architecture — четыре детали Maximus на ТЁМНОМ фоне.
 *
 * Бесшовный переход (Heart Aerospace-style):
 *   Сама секция — тёмная (--bg). На стыке с hero сверху лежит
 *   полоса градиента dark → sandy → dark на ~40vh. Песочный
 *   цвет здания "проявляется" как закатная вспышка между двумя
 *   тёмными блоками, потом возвращается тьма.
 *
 * Каждое фото:
 *   • whileInView fade-up при появлении (one-shot)
 *   • scroll-linked parallax Y у картинки (depth)
 *   • caption ниже: номер · название · описание
 */

const FOLDER = "/photo";
const PHOTO = {
  facade:
    `${FOLDER}/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_1_min.webp`,
  courtyard:
    `${FOLDER}/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_5_min.webp`,
  arches:
    `${FOLDER}/hf_20260525_082342_6f5ebc77-af74-490e-b259-7ac1a88b318b_cell_8_min.webp`,
  windowPlant:
    `${FOLDER}/hf_20260525_091823_b96533eb-d7cb-40f1-96e2-ea8e0667f895_cell_7_min.webp`,
};

export default function Architecture() {
  return (
    <section
      id="architecture"
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="relative px-6 pb-24 pt-28 md:px-14 md:pb-28 md:pt-40">
        {/* --- Header ---------------------------------------------------- */}
        <header className="mx-auto mb-16 max-w-5xl md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] uppercase tracking-[0.5em] text-[color:var(--fg-faint)]"
          >
            03 · Архитектура
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 1.05,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 max-w-3xl font-display leading-[1.0] tracking-[0.01em] text-[color:var(--fg-strong)]"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
          >
            Город <span className="italic text-[color:var(--accent)]">в деталях.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.95,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 max-w-md text-sm leading-relaxed text-[color:var(--fg-soft)]"
          >
            Четыре фрагмента МАКСИМУС — от вертикали башни до света в арочном
            окне. Камень, тень, зелень.
          </motion.p>
        </header>

        {/* --- Photo grid (compact) ------------------------------------ */}
        <div className="mx-auto max-w-5xl">
          {/* I — фасад, центральный кадр 16:9 */}
          <Detail
            src={PHOTO.facade}
            alt="Фасад башни Maximus снизу вверх"
            number="I"
            title="Вертикаль"
            body="Резиденция тянется вверх, оставаясь соразмерной городу."
            aspect="aspect-[16/9]"
          />

          {/* II + III — асимметричная пара */}
          <div className="mt-14 grid grid-cols-12 gap-5 md:mt-20 md:gap-8">
            <Detail
              src={PHOTO.courtyard}
              alt="Двор с аркадой первого этажа"
              number="II"
              title="Двор"
              body="Аркада первого этажа открывается во внутреннюю площадь."
              aspect="aspect-[4/3]"
              className="col-span-12 md:col-span-7"
            />
            <Detail
              src={PHOTO.arches}
              alt="Арочные окна фасада"
              number="III"
              title="Ритм"
              body="Повторяющиеся арки — основа фасадной геометрии."
              aspect="aspect-[4/3]"
              className="col-span-12 md:col-span-5 md:mt-16"
            />
          </div>

          {/* IV — нижний широкий кадр */}
          <Detail
            src={PHOTO.windowPlant}
            alt="Арочное окно с зеленью"
            number="IV"
            title="Свет"
            body="Зелень балконов и тёплый камень — игра тени и света."
            aspect="aspect-[21/9]"
            className="mt-14 md:mt-20"
          />
        </div>

        {/* Hairline footer */}
        <div className="mx-auto mt-16 flex max-w-5xl items-baseline justify-between border-t border-[color:var(--hairline)] pt-5 text-[10px] uppercase tracking-[0.42em] text-[color:var(--fg-faint)] md:mt-24">
          <span>МАКСИМУС · IV деталей</span>
          <span>2026</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Detail card ------------------------------------------------ */

function Detail({
  src,
  alt,
  number,
  title,
  body,
  aspect = "aspect-[16/9]",
  className = "",
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <figure ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden ${aspect}`}
        style={{ backgroundColor: "var(--bg-warm)" }}
      >
        <motion.img
          src={src}
          alt={alt}
          style={{ y: parallaxY, scale: 1.14 }}
          className="absolute inset-0 block h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </motion.div>

      <motion.figcaption
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{
          duration: 0.85,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-4 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-10"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--fg-faint)] tabular-nums">
            {number}
          </span>
          <h3 className="text-xs uppercase tracking-[0.32em] text-[color:var(--fg-strong)]">
            {title}
          </h3>
        </div>
        {body && (
          <p className="max-w-md text-xs leading-relaxed text-[color:var(--fg-soft)] md:text-right md:text-sm">
            {body}
          </p>
        )}
      </motion.figcaption>
    </figure>
  );
}
