import { useCallback, useRef, useEffect, useState } from "react";

export default function RangeSlider({ label, min, max, value, onChange, step = 1, format }) {
  const [lo, setLo] = useState(value?.[0] ?? min);
  const [hi, setHi] = useState(value?.[1] ?? max);
  const trackRef = useRef(null);

  useEffect(() => {
    setLo(value?.[0] ?? min);
    setHi(value?.[1] ?? max);
  }, [value, min, max]);

  const pct = useCallback(
    (v) => ((v - min) / (max - min)) * 100,
    [min, max],
  );

  const fmt = format || ((v) => v.toLocaleString("ru-RU"));

  const handleLo = (e) => {
    const v = Math.min(Number(e.target.value), hi - step);
    setLo(v);
    onChange([v, hi]);
  };

  const handleHi = (e) => {
    const v = Math.max(Number(e.target.value), lo + step);
    setHi(v);
    onChange([lo, v]);
  };

  return (
    <div className="range-slider">
      <div className="range-slider__head">
        <span className="range-slider__label">{label}</span>
        <span className="range-slider__values">
          {fmt(lo)} — {fmt(hi)}
        </span>
      </div>
      <div className="range-slider__track" ref={trackRef}>
        <div
          className="range-slider__fill"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
          className="range-slider__input"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
          className="range-slider__input"
        />
      </div>
    </div>
  );
}
