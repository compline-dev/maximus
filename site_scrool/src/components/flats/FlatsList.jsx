import FlatCard from "./FlatCard.jsx";

export default function FlatsList({ flats, loading, error, hasMore, onLoadMore, onSelect }) {
  return (
    <>
      {error && (
        <div className="flats-error">Не удалось загрузить данные: {error}</div>
      )}

      {!error && flats.length === 0 && !loading && (
        <div className="flats-empty">
          Квартиры не найдены. Попробуйте изменить фильтры.
        </div>
      )}

      <div className="flats-grid">
        {flats.map((flat) => (
          <FlatCard key={flat.id} flat={flat} onSelect={onSelect} />
        ))}
      </div>

      {loading && <div className="flats-loading">Загрузка…</div>}

      {hasMore && !loading && (
        <button type="button" className="flats-more btn" onClick={onLoadMore}>
          Показать ещё
        </button>
      )}
    </>
  );
}
