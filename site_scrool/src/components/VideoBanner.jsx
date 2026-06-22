import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView.js";

/**
 * VideoBanner — full-width видео-баннер, lazy-load при скролле.
 */
export default function VideoBanner({ videoSources, poster, eyebrow, title }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(containerRef);
  const [videoMounted, setVideoMounted] = useState(false);

  useEffect(() => {
    if (inView) setVideoMounted(true);
  }, [inView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoMounted) return;

    if (inView) {
      const playWhenReady = () => {
        video.play().catch(() => {});
      };

      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        playWhenReady();
      } else {
        video.addEventListener("canplay", playWhenReady, { once: true });
        return () => video.removeEventListener("canplay", playWhenReady);
      }
    } else {
      video.pause();
    }
  }, [inView, videoMounted]);

  return (
    <section ref={containerRef} className="hero banner" id="residences">
      {videoSources && videoMounted ? (
        <video
          ref={videoRef}
          className="ph media"
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={videoSources.webm} type="video/webm" />
          <source src={videoSources.mp4} type="video/mp4" />
        </video>
      ) : videoSources ? (
        <div className="ph banner-loading" aria-hidden="true" />
      ) : (
        <div className="ph">
          <span>video — tour.mp4</span>
        </div>
      )}
      <div className="veil" aria-hidden="true"></div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="banner-title display">{title}</h2>
    </section>
  );
}
