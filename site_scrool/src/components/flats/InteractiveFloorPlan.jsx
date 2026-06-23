import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import FlatDetailModal from "./FlatDetailModal.jsx";
import FlatTooltip from "./FlatTooltip.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

const VIEWBOX = "0 0 4000 2000";
const MOBILE_MQ = "(max-width: 1023px)";

export default function InteractiveFloorPlan({ flats, floorPlanImage, loading, polygons }) {
  const containerRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_MQ);
  const [hoveredFlat, setHoveredFlat] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeFlat = selectedFlat || (isMobile ? null : hoveredFlat);

  useEffect(() => {
    setHoveredFlat(null);
    setSelectedFlat(null);
  }, [floorPlanImage, isMobile]);

  const updateTooltip = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const openFlat = (flat) => {
    setSelectedFlat(flat);
  };

  const renderPolygons = () =>
    flats.map((flat) => {
      const d = polygons?.[flat.id] || polygons?.[flat.number];
      if (!d) return null;

      const isActive = activeFlat?.id === flat.id;

      return (
        <path
          key={flat.id}
          d={d}
          className={`plan-polygon${isActive ? " plan-polygon--active plan-polygon--selected" : ""}`}
          onMouseEnter={
            isMobile
              ? undefined
              : (e) => {
                  updateTooltip(e);
                  setHoveredFlat(flat);
                }
          }
          onMouseLeave={isMobile ? undefined : () => setHoveredFlat(null)}
          onClick={(e) => {
            e.stopPropagation();
            openFlat(flat);
          }}
        />
      );
    });

  const planContent = (
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
        onMouseMove={isMobile ? undefined : updateTooltip}
      >
        {renderPolygons()}
      </svg>
    </div>
  );

  if (!floorPlanImage && loading) {
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
    <div
      className={`plan-view${loading ? " plan-view--refreshing" : ""}${isMobile ? " plan-view--mobile" : ""}`}
      ref={containerRef}
    >
      <div
        className="plan-view__viewport"
        onClick={isMobile && selectedFlat ? () => setSelectedFlat(null) : undefined}
      >
        {isMobile ? (
          <TransformWrapper
            key={floorPlanImage}
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            limitToBounds={false}
            wheel={{ disabled: true }}
            pinch={{ step: 8 }}
            doubleClick={{ disabled: true }}
            panning={{ velocityDisabled: true }}
          >
            <TransformComponent
              wrapperClass="plan-view__transform"
              contentClass="plan-view__transform-content"
            >
              {planContent}
            </TransformComponent>
          </TransformWrapper>
        ) : (
          planContent
        )}
      </div>

      {loading && <div className="plan-view__refresh" aria-hidden="true" />}

      {selectedFlat && !loading && (
        <FlatDetailModal
          flat={selectedFlat}
          onClose={() => setSelectedFlat(null)}
          variant={isMobile ? "sheet" : "modal"}
        />
      )}

      {!isMobile && hoveredFlat && !selectedFlat && !loading && (
        <FlatTooltip
          flat={hoveredFlat}
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 20 }}
        />
      )}
    </div>
  );
}
