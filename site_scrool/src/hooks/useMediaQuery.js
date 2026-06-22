import { useEffect, useState } from "react";

/** Реактивный matchMedia: true, когда media-запрос совпадает. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    // Фолбэк: некоторые окружения не шлют change у MediaQueryList — слушаем resize.
    window.addEventListener("resize", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [query]);

  return matches;
}
