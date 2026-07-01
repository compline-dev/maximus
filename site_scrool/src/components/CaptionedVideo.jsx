import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView.js";
import { useLeadModal } from "./LeadModal.jsx";

/**
 * CaptionedVideo — видео во всю ширину сайта с подписью и врезкой (УТП).
 */

export default function CaptionedVideo({
  src,
  ratio = "16 / 9",
  mediaScale,
  eyebrow,
  title,
  items = [],
  cta,
  id,
}) {
  const frameRef = useRef(null);
  const inView = useInView(frameRef, "0px");

  if (!src) return null;
  const { open } = useLeadModal();

  useEffect(() => {
    const video = frameRef.current?.querySelector("video");
    if (!video) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView]);

  return (
    <section id={id} data-screen-label="CaptionedVideo" className="cv">
      <div
        ref={frameRef}
        className="cv-frame"
        style={{ "--cv-ratio": ratio, "--cv-media-scale": mediaScale }}
      >
        <video
          className="cv-media"
          src={encodeURI(src)}
          muted
          loop
          playsInline
          preload="metadata"
        />

        <div className="cv-veil" aria-hidden="true" />

        <div className="cv-cap">
          {eyebrow && <span className="cv-eyebrow">{eyebrow}</span>}
          {title && <h2 className="cv-title">{title}</h2>}
          {items.length > 0 && (
            <ul className="cv-vrezka">
              {items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          )}
          {cta && (
            <button
              type="button"
              className="btn btn-light cv-cta"
              onClick={() => open({ title: cta, kicker: "Заявка" })}
            >
              {cta}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
