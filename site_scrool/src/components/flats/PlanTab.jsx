import { useState } from "react";
import FloorSelector from "./FloorSelector.jsx";
import InteractiveFloorPlan from "./InteractiveFloorPlan.jsx";
import { useSections, usePlanFlats, usePolygons } from "../../hooks/usePlanFlats.js";

const FIRST_FLOOR = 3;

export default function PlanTab() {
  const sections = useSections();
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeFloor, setActiveFloor] = useState(10);

  const section = sections[activeSectionIdx];
  const sectionNumber = section?.buildingSection || "1";

  const { flats, floorPlanImage, loading } = usePlanFlats(sectionNumber, activeFloor);
  const polygons = usePolygons(sectionNumber, activeFloor);

  const handleFloorChange = (f) => {
    if (section && f >= FIRST_FLOOR && f <= section.floorsTotal) {
      setActiveFloor(f);
    }
  };

  const handleSectionChange = (idx) => {
    setActiveSectionIdx(idx);
    const s = sections[idx];
    if (s && activeFloor > s.floorsTotal) {
      setActiveFloor(s.floorsTotal);
    }
  };

  if (!sections.length) {
    return <div className="plan-loading">Загрузка секций…</div>;
  }

  return (
    <div className="plan-tab">
      <div className="plan-tab__sections">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`flats-pill${i === activeSectionIdx ? " flats-pill--active" : ""}`}
            onClick={() => handleSectionChange(i)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="plan-tab__body">
        <InteractiveFloorPlan
          flats={flats}
          floorPlanImage={floorPlanImage}
          loading={loading}
          polygons={polygons}
        />

        {section && (
          <FloorSelector
            section={section}
            activeFloor={activeFloor}
            onFloorChange={handleFloorChange}
          />
        )}
      </div>
    </div>
  );
}
