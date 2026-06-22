import { useEffect, useState } from "react";

/** Элемент в viewport — двусторонний observer (in / out). */
export function useInView(ref, rootMargin = "240px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
