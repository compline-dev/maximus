function formatPrice(v) {
  if (!v) return "—";
  return Number(v).toLocaleString("ru-RU") + " ₽";
}

function getRoomLabel(rooms, studio, euro) {
  if (studio === "1") return "СТУДИЯ";
  if (euro === "1") return `ЕВРО ${rooms}-КОМН.`;
  return `${rooms}-КОМН.`;
}

export default function FlatCard({ flat, onSelect }) {
  const planImg = flat.images?.plan?.[0] || flat.images?.plan_floor?.[0];
  const customFields = flat.custom_fields ?? {};

  const tags = [];
  if (customFields["Кухня-гостиная"]) tags.push("Кухня-гостиная");
  if (customFields["Панорамное остекление"]) tags.push("Панорамное остекление");

  const handleOpen = () => onSelect?.(flat);

  return (
    <article
      className="flat-card"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      <div className="flat-card__image">
        {planImg ? (
          <img src={planImg} alt={`План ${flat.number}`} loading="lazy" />
        ) : (
          <div className="flat-card__noimg">Нет плана</div>
        )}
        {tags.length > 0 && (
          <div className="flat-card__tags">
            {tags.map((t) => (
              <span key={t} className="flat-card__tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flat-card__body">
        <span className="flat-card__type">
          {getRoomLabel(flat.rooms, flat.studio, flat.euro_layout)}
        </span>

        <div className="flat-card__meta">
          <div className="flat-card__row">
            <span className="flat-card__key">Площадь</span>
            <span className="flat-card__val">{flat.area} м²</span>
          </div>
          <div className="flat-card__row">
            <span className="flat-card__key">Кв.</span>
            <span className="flat-card__val">№{flat.number}</span>
          </div>
          <div className="flat-card__row">
            <span className="flat-card__key">Этаж</span>
            <span className="flat-card__val">{flat.floor} из {flat.floors_total}</span>
          </div>
          <div className="flat-card__row">
            <span className="flat-card__key">Секция</span>
            <span className="flat-card__val">{flat.building_section}</span>
          </div>
        </div>

        <div className="flat-card__price">{formatPrice(flat.price)}</div>
      </div>
    </article>
  );
}
