import { useEffect, useState } from "react";

const VIDEO_OPT = "/video-optimized";

/** @typedef {{ webm: string, mp4: string }} VideoSources */

/** @type {VideoSources} */
export const HERO_VIDEO = {
  webm: `${VIDEO_OPT}/hero-building.webm`,
  mp4: `${VIDEO_OPT}/hero-building.mp4`,
};

export const HERO_IMAGE = "/high_quality_photos/main_photo_gk_high_quality.webp";

/** @type {VideoSources} */
export const DUAL_VIDEO_LEFT = {
  webm: `${VIDEO_OPT}/day-night-facade.webm`,
  mp4: `${VIDEO_OPT}/day-night-facade.mp4`,
};

/** @type {VideoSources} */
export const DUAL_VIDEO_RIGHT = {
  webm: `${VIDEO_OPT}/approach-sunset.webm`,
  mp4: `${VIDEO_OPT}/approach-sunset.mp4`,
};

/** @type {VideoSources} */
export const BANNER_VIDEO = {
  webm: `${VIDEO_OPT}/banner-tour.webm`,
  mp4: `${VIDEO_OPT}/banner-tour.mp4`,
};

const HERO_FETCH_TIMEOUT_MS = 10_000;

/** Прогрев кэша dual-блока параллельно с hero (без decoder). */
// const DUAL_WARMUP_MP4 = [DUAL_VIDEO_RIGHT.mp4];
const DUAL_WARMUP_MP4 = [];

/** Прогревает HTTP-кэш без запуска media decoder (MP4 fallback). */
function preloadVideo(src, signal) {
  return fetch(src, { cache: "force-cache", signal });
}

function createFetchSignal() {
  const controller = new AbortController();
  let timeoutId = null;

  const clearTimeoutIfNeeded = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function" &&
    typeof AbortSignal.any === "function"
  ) {
    return {
      signal: AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(HERO_FETCH_TIMEOUT_MS),
      ]),
      clearTimeout: clearTimeoutIfNeeded,
      dispose: () => {
        clearTimeoutIfNeeded();
        controller.abort();
      },
    };
  }

  timeoutId = window.setTimeout(() => {
    controller.abort();
  }, HERO_FETCH_TIMEOUT_MS);

  return {
    signal: controller.signal,
    clearTimeout: clearTimeoutIfNeeded,
    dispose: () => {
      clearTimeoutIfNeeded();
      controller.abort();
    },
  };
}

/** Прелоад hero-изображения до показа страницы. */
export function useHeroVideoPreload(src = HERO_IMAGE) {
  const [ready, setReady] = useState(false);
  const url = typeof src === "string" ? src : src.mp4;

  useEffect(() => {
    let cancelled = false;
    const { signal, clearTimeout, dispose } = createFetchSignal();

    DUAL_WARMUP_MP4.forEach((url) => {
      fetch(url, { cache: "force-cache" }).catch(() => {});
    });

    preloadVideo(url, signal)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      })
      .finally(() => {
        clearTimeout();
      });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [url]);

  return { ready, progress: ready ? 1 : 0 };
}
