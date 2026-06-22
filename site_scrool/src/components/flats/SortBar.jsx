export default function SortBar({ total, filters, setFiltersImmediate }) {
  const dir = filters.sort_dir || "asc";

  const toggleDir = () => {
    setFiltersImmediate((f) => ({
      ...f,
      sort_dir: dir === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="flats-sort">
      <span className="flats-sort__count">
        {total} {total === 1 ? "квартира" : total < 5 ? "квартиры" : "квартир"}
      </span>
      <button type="button" className="flats-sort__btn" onClick={toggleDir}>
        Сортировать по {dir === "asc" ? "увеличению" : "уменьшению"} ₽
        <span className="flats-sort__arrow">{dir === "asc" ? "↑" : "↓"}</span>
      </button>
    </div>
  );
}
