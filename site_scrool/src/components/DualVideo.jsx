import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView.js";

function Vrezka({ items }) {
  return (
    <ul className="dv-vrezka">
      {items.map((item) => (
        <li key={item} className="dv-subline">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Одно full-bleed видео с текстовой врезкой поверх. */
export default function DualVideo({
  sources,
  labels = [],
  caption,
  items = [],
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(sectionRef, "400px 0px 400px 0px");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="dual-video dual-video--single">
      <div className="dv-pane">
        {sources ? (
          <video
            ref={videoRef}
            className="ph media"
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={sources.webm} type="video/webm" />
            <source src={sources.mp4} type="video/mp4" />
          </video>
        ) : (
          <div className="ph">
            <span>video</span>
          </div>
        )}
        <div className="dv-veil" aria-hidden="true" />
        <div className="dv-cap dv-cap--stack">
          {labels.map((line) => (
            <span key={line} className="dv-label display">
              {line}
            </span>
          ))}
          {caption && <span className="dv-subline">{caption}</span>}
          {items.length > 0 && <Vrezka items={items} />}
        </div>
      </div>
    </section>
  );
}
