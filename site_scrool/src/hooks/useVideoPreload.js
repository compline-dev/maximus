import { useEffect, useState } from "react";

const HERO_FETCH_TIMEOUT_MS = 10_000;

function preloadImage(src, signal) {
  return fetch(src, { cache: "force-cache", signal });
}

export function useHeroImagePreload(src) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), HERO_FETCH_TIMEOUT_MS);

    preloadImage(src, ctrl.signal)
      .then(() => { if (!cancelled) setReady(true); })
      .catch(() => { if (!cancelled) setReady(true); })
      .finally(() => clearTimeout(timer));

    return () => { cancelled = true; ctrl.abort(); clearTimeout(timer); };
  }, [src]);

  return { ready, progress: ready ? 1 : 0 };
}
