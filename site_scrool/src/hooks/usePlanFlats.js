import { useCallback, useEffect, useState } from "react";

export function usePolygons(section, floor) {
  const [polygons, setPolygons] = useState({});

  useEffect(() => {
    if (!section || !floor) return;
    fetch(`/api/polygons/?section=${section}&floor=${floor}`)
      .then((r) => r.json())
      .then(setPolygons)
      .catch(() => setPolygons({}));
  }, [section, floor]);

  return polygons;
}

export function useSections() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetch("/api/sections/")
      .then((r) => r.json())
      .then((data) => {
        const list = (Array.isArray(data) ? data : []).map((s) => ({
          id: s.id,
          name: s.name,
          floorsTotal: Number(s.floors_total) || 13,
          builtYear: s.built_year,
          readyQuarter: s.ready_quarter,
          buildingSection: s.name?.match(/\d+/)?.[0] || s.id,
        }));
        setSections(list);
      })
      .catch(console.error);
  }, []);

  return sections;
}

export function usePlanFlats(sectionNumber, floor) {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [floorPlanImage, setFloorPlanImage] = useState(null);

  const fetchFloor = useCallback(() => {
    if (!sectionNumber || !floor) return;
    setLoading(true);
    fetch(
      `/api/properties/?section=${sectionNumber}&floor_min=${floor}&floor_max=${floor}&limit=50`,
    )
      .then((r) => r.json())
      .then((data) => {
        const results = data.results || [];
        setFlats(results);
        const img = results.find((f) => f.images?.plan_floor?.[0]);
        setFloorPlanImage(img?.images?.plan_floor?.[0] || null);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [sectionNumber, floor]);

  useEffect(() => {
    fetchFloor();
  }, [fetchFloor]);

  return { flats, floorPlanImage, loading };
}
