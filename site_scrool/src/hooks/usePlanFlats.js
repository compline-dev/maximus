import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function usePolygons(section, floor) {
  const [polygons, setPolygons] = useState({});

  useEffect(() => {
    if (!section || !floor) return;
    api
      .polygons(section, floor)
      .then(setPolygons)
      .catch(() => setPolygons({}));
  }, [section, floor]);

  return polygons;
}

export function useSections() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api
      .sections()
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
  const [error, setError] = useState(null);
  const [floorPlanImage, setFloorPlanImage] = useState(null);

  const fetchFloor = useCallback(() => {
    if (!sectionNumber || !floor) return;
    setLoading(true);
    setError(null);

    const query = `section=${sectionNumber}&floor_min=${floor}&floor_max=${floor}&limit=50`;
    api
      .properties(query)
      .then((data) => {
        const results = data.results || [];
        setFlats(results);
        const img = results.find((f) => f.images?.plan_floor?.[0]);
        setFloorPlanImage(img?.images?.plan_floor?.[0] || null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Ошибка загрузки плана");
        setLoading(false);
      });
  }, [sectionNumber, floor]);

  useEffect(() => {
    fetchFloor();
  }, [fetchFloor]);

  return { flats, floorPlanImage, loading, error };
}
