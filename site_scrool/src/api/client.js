const TIMEOUT = 15_000;

export async function fetchJSON(path, { signal, ...opts } = {}) {
  const timeout = AbortSignal.timeout(TIMEOUT);
  const combined = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  const res = await fetch(path, { signal: combined, ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  filters: (opts) =>
    fetchJSON('/api/filters/', opts),

  properties: (query, opts) =>
    fetchJSON(`/api/properties/?${query}`, opts),

  sections: (opts) =>
    fetchJSON('/api/sections/', opts),

  polygons: (section, floor, opts) =>
    fetchJSON(`/api/polygons/?section=${section}&floor=${floor}`, opts),

  homeContent: (opts) =>
    fetchJSON('/api/content/home/', opts),
};
