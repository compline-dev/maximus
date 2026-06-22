import { useRef, useEffect } from "react";

const FIRST_FLOOR = 3;

export default function FloorSelector({
  section,
  activeFloor,
  onFloorChange,
}) {
  const listRef = useRef(null);
  const floors = [];
  for (let i = section.floorsTotal; i >= FIRST_FLOOR; i--) floors.push(i);

  const canUp = activeFloor < section.floorsTotal;
  const canDown = activeFloor > FIRST_FLOOR;

  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active]");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeFloor]);

  return (
    <aside className="plan-floors">
      <div className="plan-floors__info">
        <span className="plan-floors__section">{section.name}</span>
        <span className="plan-floors__deadline">
          Сдача: {section.readyQuarter} кв. {section.builtYear}
        </span>
      </div>

      <button
        type="button"
        className="plan-floors__arrow"
        disabled={!canUp}
        onClick={() => onFloorChange(activeFloor + 1)}
        aria-label="Этаж выше"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <div className="plan-floors__list" ref={listRef}>
        {floors.map((f) => (
          <button
            key={f}
            type="button"
            className={`plan-floors__item${f === activeFloor ? " plan-floors__item--active" : ""}`}
            onClick={() => onFloorChange(f)}
            {...(f === activeFloor ? { "data-active": true } : {})}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="plan-floors__arrow"
        disabled={!canDown}
        onClick={() => onFloorChange(activeFloor - 1)}
        aria-label="Этаж ниже"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </aside>
  );
}
