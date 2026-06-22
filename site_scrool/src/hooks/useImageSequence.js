import { useEffect, useRef, useState } from "react";

const PROGRESS_THROTTLE = 5;
const MAX_CONCURRENT = 5;

/**
 * Preloads a numbered image sequence into memory.
 * First `initialCount` frames load with priority; the rest continue in background.
 * All successfully loaded frames stay in framesRef for smooth canvas scrub.
 */
export function useImageSequence({
  folder,
  count,
  prefix = "frame_",
  ext = "jpg",
  pad = 3,
  startIndex = 1,
  initialCount = 40,
  onFrameLoaded,
}) {
  const framesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [initialLoadedCount, setInitialLoadedCount] = useState(0);

  const onFrameLoadedRef = useRef(onFrameLoaded);
  onFrameLoadedRef.current = onFrameLoaded;

  const initialTarget = Math.min(initialCount, count);

  useEffect(() => {
    let cancelled = false;
    const processedIndices = new Set();
    let activeLoads = 0;

    const pending = new Map();

    framesRef.current = new Array(count).fill(null);
    setLoadedCount(0);
    setInitialLoadedCount(0);

    const buildSrc = (index) => {
      const n = String(index + startIndex).padStart(pad, "0");
      return `${folder}/${prefix}${n}.${ext}`;
    };

    const bumpProgress = () => {
      const totalProcessed = processedIndices.size;

      let initialProcessed = 0;
      for (let i = 0; i < initialTarget; i += 1) {
        if (processedIndices.has(i)) initialProcessed += 1;
      }

      if (
        initialProcessed === 1 ||
        initialProcessed === initialTarget - 1 ||
        initialProcessed === initialTarget ||
        initialProcessed % PROGRESS_THROTTLE === 0
      ) {
        setInitialLoadedCount(initialProcessed);
      }

      if (
        totalProcessed === 1 ||
        totalProcessed === count ||
        totalProcessed % PROGRESS_THROTTLE === 0
      ) {
        setLoadedCount(totalProcessed);
      }
    };

    const markProcessed = (index, loaded) => {
      if (processedIndices.has(index)) return;

      processedIndices.add(index);

      if (loaded) {
        framesRef.current[index] = loaded;
      } else {
        framesRef.current[index] = null;
      }

      bumpProgress();
    };

    const seedQueue = () => {
      for (let i = 0; i < initialTarget; i += 1) {
        pending.set(i, i);
      }
      for (let i = initialTarget; i < count; i += 1) {
        pending.set(i, 1000 + i);
      }
    };

    const dequeue = () => {
      let bestIndex = null;
      let bestPriority = Infinity;

      for (const [index, priority] of pending) {
        if (priority < bestPriority) {
          bestPriority = priority;
          bestIndex = index;
        }
      }

      if (bestIndex !== null) pending.delete(bestIndex);
      return bestIndex;
    };

    const pump = () => {
      while (activeLoads < MAX_CONCURRENT) {
        const index = dequeue();
        if (index === null) break;
        if (processedIndices.has(index) || framesRef.current[index]) continue;
        loadIndex(index);
      }
    };

    const loadIndex = (index) => {
      activeLoads += 1;

      const img = new Image();
      img.decoding = "async";
      img.src = buildSrc(index);

      const finish = (loaded) => {
        if (cancelled) return;

        activeLoads -= 1;
        markProcessed(index, loaded);

        if (loaded) {
          onFrameLoadedRef.current?.(index);
        }

        pump();
      };

      img.onload = () => finish(img);
      img.onerror = () => finish(null);
    };

    seedQueue();
    pump();

    return () => {
      cancelled = true;
      for (let i = 0; i < count; i += 1) {
        const img = framesRef.current[i];
        if (img) {
          img.src = "";
        }
      }
      framesRef.current = new Array(count).fill(null);
    };
  }, [folder, count, prefix, ext, pad, startIndex, initialTarget]);

  return {
    framesRef,
    ready: count > 0 && loadedCount === count,
    initialReady: initialTarget === 0 || initialLoadedCount >= initialTarget,
    progress: count === 0 ? 1 : loadedCount / count,
    loadedCount,
    total: count,
    initialLoadedCount,
    initialTarget,
  };
}
