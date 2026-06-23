import { useEffect } from "react";
import { useLeadModal } from "../LeadModal.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import MobileBottomSheet from "../MobileBottomSheet.jsx";

const MOBILE_MQ = "(max-width: 1023px)";

function formatPrice(v) {
  if (!v) return "—";
  const n = Number(v);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " млн ₽";
  return n.toLocaleString("ru-RU") + " ₽";
}

function formatPricePerMeter(v) {
  if (!v) return "—";
  return Number(v).toLocaleString("ru-RU") + " ₽/м²";
}

function getRoomLabel(flat) {
  if (flat.studio === "1") return "Студия";
  if (flat.euro_layout === "1") return `Евро ${flat.rooms}-комн.`;
  const n = Number(flat.rooms);
  if (n === 1) return "1 спальня";
  if (n >= 2 && n <= 4) return `${n} спальни`;
  return `${n} спален`;
}

function statusClass(status) {
  if (status === "AVAILABLE") return "flat-detail__status--free";
  return "flat-detail__status--busy";
}

function FlatDetailContent({ flat, onClose, showClose }) {
  const { open: openLead } = useLeadModal();

  const images = flat.images || {};
  const planImg = images.plan?.[0] || images.plan_floor?.[0];
  const custom = flat.custom_fields || {};
  const featureTags = Object.entries(custom)
    .filter(([, val]) => val)
    .map(([key]) => key);

  const specs = [
    { key: "Квартира", val: `№${flat.number}` },
    { key: "Площадь", val: flat.area ? `${flat.area} м²` : "—" },
    { key: "Жилая", val: flat.living_area ? `${flat.living_area} м²` : "—" },
    { key: "Этаж", val: `${flat.floor} из ${flat.floors_total}` },
    { key: "Секция", val: flat.building_section || "—" },
    { key: "Корпус", val: flat.building_name || "—" },
    { key: "Цена за м²", val: formatPricePerMeter(flat.price_per_meter) },
  ];

  if (flat.preset_code) {
    specs.push({ key: "Тип планировки", val: flat.preset_code });
  }

  const handleLead = () => {
    onClose();
    openLead({
      title: `Квартира №${flat.number}`,
      kicker: "Заявка на просмотр",
    });
  };

  return (
    <>
      {showClose && (
        <button
          type="button"
          className="flat-detail__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      )}

      {planImg && (
        <div className="flat-detail__plan">
          <img src={planImg} alt={`Планировка квартиры №${flat.number}`} />
        </div>
      )}

      <div className="flat-detail__head">
        {flat.status_humanized && (
          <span className={`flat-detail__status ${statusClass(flat.status)}`}>
            {flat.status_humanized}
          </span>
        )}
        <h2 className="flat-detail__title display">{getRoomLabel(flat)}</h2>
        <p className="flat-detail__subtitle">
          Квартира №{flat.number}
          {flat.building_section ? ` · Секция ${flat.building_section}` : ""}
        </p>
      </div>

      <dl className="flat-detail__specs">
        {specs.map(({ key, val }) => (
          <div key={key} className="flat-detail__spec">
            <dt>{key}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>

      {featureTags.length > 0 && (
        <div className="flat-detail__tags">
          {featureTags.map((tag) => (
            <span key={tag} className="flat-detail__tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="flat-detail__footer">
        <span className="flat-detail__price">{formatPrice(flat.price)}</span>
        <button type="button" className="btn btn-solid flat-detail__cta" onClick={handleLead}>
          Записаться на просмотр
        </button>
      </div>
    </>
  );
}

export default function FlatDetailModal({ flat, onClose, variant = "modal" }) {
  const isMobile = useMediaQuery(MOBILE_MQ);
  const isSheet = isMobile || variant === "sheet";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!flat) return null;

  if (isSheet) {
    return (
      <div
        className="flat-detail flat-detail--sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Квартира №${flat.number}`}
      >
        <MobileBottomSheet onClose={onClose}>
          <FlatDetailContent flat={flat} onClose={onClose} showClose={false} />
        </MobileBottomSheet>
      </div>
    );
  }

  return (
    <div
      className="flat-detail flat-detail--modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Квартира №${flat.number}`}
    >
      <div className="flat-detail__backdrop" onClick={onClose} />
      <div
        className="flat-detail__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <FlatDetailContent flat={flat} onClose={onClose} showClose />
      </div>
    </div>
  );
}
