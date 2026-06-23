import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PAGE_SIZE = 9;
const DEBOUNCE_MS = 400;

const LIST_PARAMS = ["rooms", "section", "status", "features"];

function paramsToFilters(sp) {
  const f = {};
  for (const [k, v] of sp.entries()) {
    if (LIST_PARAMS.includes(k)) f[k] = v.split(",");
    else f[k] = v;
  }
  return f;
}

function filtersToParams(filters) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  return sp;
}

const FEATURE_TO_REDIS = {
  kitchen_living: "кухня-гостиная",
  panoramic: "панорамное_остекление",
};

function buildQuery(filters, offset) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    if (k === "features") {
      const mapped = v.map((f) => FEATURE_TO_REDIS[f] || f).join(",");
      sp.set("features", mapped);
      continue;
    }
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  sp.set("limit", String(PAGE_SIZE));
  if (offset > 0) sp.set("offset", String(offset));
  return sp.toString();
}

export function useFiltersData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/filters/")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);
  return data;
}

export function useFlats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFiltersRaw] = useState(() => paramsToFilters(searchParams));
  const [flats, setFlats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchFlats = useCallback(
    (f, off, append = false) => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);

      fetch(`/api/properties/?${buildQuery(f, off)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          if (append) setFlats((prev) => [...prev, ...data.results]);
          else setFlats(data.results);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            setLoading(false);
            console.error(e);
          }
        });
    },
    [],
  );

  const applyFilters = useCallback(
    (next, { immediate = false } = {}) => {
      filtersRef.current = next;
      setFiltersRaw(next);
      setSearchParams(filtersToParams(next), { replace: true });
      setOffset(0);
      clearTimeout(debounceRef.current);
      if (immediate) {
        fetchFlats(next, 0);
      } else {
        debounceRef.current = setTimeout(() => fetchFlats(next, 0), DEBOUNCE_MS);
      }
    },
    [fetchFlats, setSearchParams],
  );

  const setFilters = useCallback(
    (updater) => {
      const prev = filtersRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      applyFilters(next, { immediate: false });
    },
    [applyFilters],
  );

  const setFiltersImmediate = useCallback(
    (updater) => {
      const prev = filtersRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      applyFilters(next, { immediate: true });
    },
    [applyFilters],
  );

  const loadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchFlats(filters, nextOffset, true);
  }, [offset, filters, fetchFlats]);

  // Initial load
  useEffect(() => {
    fetchFlats(filters, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = flats.length < total;

  return { filters, setFilters, setFiltersImmediate, flats, total, loading, loadMore, hasMore };
}
