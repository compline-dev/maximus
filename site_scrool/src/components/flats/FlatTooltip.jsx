function formatPrice(v) {
  if (!v) return "—";
  const n = Number(v);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " млн ₽";
  return n.toLocaleString("ru-RU") + " ₽";
}

function roomLabel(rooms) {
  const n = Number(rooms);
  if (n === 1) return "1 СПАЛЬНЯ";
  if (n >= 2 && n <= 4) return `${n} СПАЛЬНИ`;
  return `${n} СПАЛЕН`;
}

export default function FlatTooltip({ flat, style }) {
  if (!flat) return null;

  const custom = flat.custom_fields || {};
  const tags = [];
  if (custom["Кухня-гостиная"]) tags.push("Кухня-гостиная");
  if (custom["Панорамное остекление"]) tags.push("Панорама");

  return (
    <div className="plan-tooltip" style={style}>
      <span className="plan-tooltip__type">{roomLabel(flat.rooms)}</span>

      <div className="plan-tooltip__grid">
        <div className="plan-tooltip__row">
          <span className="plan-tooltip__key">Площадь</span>
          <span className="plan-tooltip__val">{flat.area} м²</span>
        </div>
        <div className="plan-tooltip__row">
          <span className="plan-tooltip__key">Кв.</span>
          <span className="plan-tooltip__val">№{flat.number}</span>
        </div>
        <div className="plan-tooltip__row">
          <span className="plan-tooltip__key">Этаж</span>
          <span className="plan-tooltip__val">
            {flat.floor} из {flat.floors_total}
          </span>
        </div>
        <div className="plan-tooltip__row">
          <span className="plan-tooltip__key">Секция</span>
          <span className="plan-tooltip__val">{flat.building_section}</span>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="plan-tooltip__tags">
          {tags.map((t) => (
            <span key={t} className="plan-tooltip__tag">{t}</span>
          ))}
        </div>
      )}

      <span className="plan-tooltip__price">{formatPrice(flat.price)}</span>
    </div>
  );
}
