import { useRef, useState } from "react";
import FlatTooltip from "./FlatTooltip.jsx";

const VIEWBOX = "0 0 4000 2000";

export default function InteractiveFloorPlan({ flats, floorPlanImage, loading, polygons }) {
  const containerRef = useRef(null);
  const [hoveredFlat, setHoveredFlat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const updateTooltip = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  if (loading) {
    return (
      <div className="plan-view__loading">
        <span>Загрузка плана…</span>
      </div>
    );
  }

  if (!floorPlanImage) {
    return (
      <div className="plan-view__empty">
        <span>План этажа недоступен</span>
      </div>
    );
  }

  return (
    <div className="plan-view" ref={containerRef}>
      <div className="plan-view__image-wrap">
        <img
          src={floorPlanImage}
          alt="План этажа"
          className="plan-view__image"
          draggable={false}
        />

        <svg
          viewBox={VIEWBOX}
          className="plan-view__svg-overlay"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={updateTooltip}
        >
          {flats.map((flat) => {
            const d = polygons?.[flat.id] || polygons?.[flat.number];
            if (!d) return null;
            return (
              <path
                key={flat.id}
                d={d}
                className={`plan-polygon${hoveredFlat?.id === flat.id ? " plan-polygon--active" : ""}`}
                onMouseEnter={(e) => { updateTooltip(e); setHoveredFlat(flat); }}
                onMouseLeave={() => setHoveredFlat(null)}
              />
            );
          })}
        </svg>
      </div>

      {hoveredFlat && (
        <FlatTooltip
          flat={hoveredFlat}
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 20 }}
        />
      )}
    </div>
  );
}
