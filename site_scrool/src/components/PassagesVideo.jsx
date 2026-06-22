import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView.js";

/**
 * PassagesVideo — два видео во всю ширину сайта, одно под другим.
 * Стыкуются без зазора и читаются как единый блок. Видео проигрываются
 * при попадании в зону видимости (autoplay muted loop).
 *
 * У первого ролика в файл зашит letterbox (~2.4% сверху/снизу) — он
 * скрывается через aspect-ratio контейнера + object-fit: cover.
 */

const VIDEOS = [
  {
    src: "/video_passages_around_gk/____________________________________ac609gq06ygvab6l0d49_1.mp4",
    // intrinsic 1280×720 с чёрными барами ~17/18px → кадрируем по контенту
    ratio: "1280 / 672",
  },
  {
    src: "/video_passages_around_gk/hf_20260611_073952_01795758-4cc6-4826-833c-884d6b0511dc (1).mp4",
    // intrinsic 1920×1080 без баров
    ratio: "1920 / 1080",
  },
];

function FullWidthVideo({ src, ratio }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(wrapRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        lineHeight: 0,
        overflow: "hidden",
        background: "#0E0E0C",
      }}
    >
      <video
        ref={videoRef}
        src={encodeURI(src)}
        muted
        loop
        playsInline
        preload="metadata"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default function PassagesVideo() {
  return (
    <section
      data-screen-label="PassagesVideo"
      style={{ width: "100%", background: "#0E0E0C", overflow: "hidden" }}
    >
      {VIDEOS.map((v) => (
        <FullWidthVideo key={v.src} src={v.src} ratio={v.ratio} />
      ))}
    </section>
  );
}
