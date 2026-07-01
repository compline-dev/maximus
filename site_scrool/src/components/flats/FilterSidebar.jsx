import RangeSlider from "./RangeSlider.jsx";

const ROOM_OPTIONS = [
  { value: "1", label: "С" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "Пентхаус" },
];

const FEATURES = [
  { key: "kitchen_living", label: "Кухня-гостиная" },
  { key: "panoramic", label: "Панорамное остекление" },
];

function fmtPrice(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(".0", "") + " млн";
  return v.toLocaleString("ru-RU");
}

function fmtArea(v) {
  return v.toFixed(0) + " м²";
}

export default function FilterSidebar({ filtersData, filters, setFilters, setFiltersImmediate }) {
  if (!filtersData) return null;

  const { price, area, floor, sections } = filtersData;

  const rooms = filters.rooms || [];
  const selectedSections = filters.section || [];
  const features = filters.features || [];

  const toggleRoom = (val) => {
    const next = rooms.includes(val) ? rooms.filter((r) => r !== val) : [...rooms, val];
    setFiltersImmediate((f) => ({ ...f, rooms: next }));
  };

  const toggleSection = (val) => {
    const next = selectedSections.includes(val)
      ? selectedSections.filter((s) => s !== val)
      : [...selectedSections, val];
    setFiltersImmediate((f) => ({ ...f, section: next }));
  };

  const toggleFeature = (key) => {
    const next = features.includes(key) ? features.filter((f) => f !== key) : [...features, key];
    setFiltersImmediate((f) => ({ ...f, features: next }));
  };

  const resetAll = () => {
    setFiltersImmediate({
      sort_by: filters.sort_by || "price",
      sort_dir: filters.sort_dir || "asc",
    });
  };

  const hasFilters =
    rooms.length > 0 ||
    selectedSections.length > 0 ||
    features.length > 0 ||
    filters.price_min ||
    filters.price_max ||
    filters.area_min ||
    filters.area_max ||
    filters.floor_min ||
    filters.floor_max;

  return (
    <aside className="flats-sidebar">
      <div className="flats-sidebar__group">
        <span className="flats-sidebar__title">Спальни</span>
        <div className="flats-sidebar__pills">
          {ROOM_OPTIONS.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`flats-pill${rooms.includes(opt.value) ? " flats-pill--active" : ""}`}
              onClick={() => toggleRoom(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flats-sidebar__group">
        <RangeSlider
          label="Площадь"
          min={Math.floor(area.min)}
          max={Math.ceil(area.max)}
          step={1}
          value={[
            Number(filters.area_min || Math.floor(area.min)),
            Number(filters.area_max || Math.ceil(area.max)),
          ]}
          onChange={([lo, hi]) =>
            setFilters((f) => ({ ...f, area_min: String(lo), area_max: String(hi) }))
          }
          format={fmtArea}
        />
      </div>

      <div className="flats-sidebar__group">
        <RangeSlider
          label="Этаж"
          min={Math.floor(floor.min)}
          max={Math.ceil(floor.max)}
          step={1}
          value={[
            Number(filters.floor_min || Math.floor(floor.min)),
            Number(filters.floor_max || Math.ceil(floor.max)),
          ]}
          onChange={([lo, hi]) =>
            setFilters((f) => ({ ...f, floor_min: String(lo), floor_max: String(hi) }))
          }
        />
      </div>

      <div className="flats-sidebar__group">
        <RangeSlider
          label="Стоимость"
          min={Math.floor(price.min)}
          max={Math.ceil(price.max)}
          step={100000}
          value={[
            Number(filters.price_min || Math.floor(price.min)),
            Number(filters.price_max || Math.ceil(price.max)),
          ]}
          onChange={([lo, hi]) =>
            setFilters((f) => ({ ...f, price_min: String(lo), price_max: String(hi) }))
          }
          format={fmtPrice}
        />
      </div>

      <div className="flats-sidebar__group">
        <span className="flats-sidebar__title">Секция</span>
        <div className="flats-sidebar__pills">
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              className={`flats-pill${selectedSections.includes(s) ? " flats-pill--active" : ""}`}
              onClick={() => toggleSection(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flats-sidebar__group">
        <span className="flats-sidebar__title">Особенности</span>
        <div className="flats-sidebar__tags">
          {FEATURES.map((f) => (
            <label key={f.key} className="flats-tag">
              <input
                type="checkbox"
                checked={features.includes(f.key)}
                onChange={() => toggleFeature(f.key)}
              />
              <span className="flats-tag__box" />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button type="button" className="flats-sidebar__reset" onClick={resetAll}>
          Сбросить фильтры
        </button>
      )}
    </aside>
  );
}
