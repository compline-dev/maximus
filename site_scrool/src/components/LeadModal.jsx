import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import MobileBottomSheet from "./MobileBottomSheet.jsx";
import { useMediaQuery } from "../hooks/useMediaQuery.js";

const MOBILE_MQ = "(max-width: 1023px)";

export const LeadModalContext = createContext(null);

export function useLeadModal() {
  const ctx = useContext(LeadModalContext);
  if (!ctx) {
    throw new Error("useLeadModal must be used within <LeadModalProvider>");
  }
  return ctx;
}

function LeadModalBody({ meta, sent, onSubmit }) {
  if (sent) {
    return (
      <div className="lead-modal__done">
        <p className="kicker">Спасибо</p>
        <p className="apply-done-text display">
          Заявка принята. Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="kicker">{meta.kicker}</p>
      <h3 className="lead-modal__title display">{meta.title}</h3>
      <p className="lead-modal__lede">
        Оставьте контакты — менеджер свяжется с вами и подберёт удобное
        время визита в шоурум.
      </p>
      <form className="lead-modal__form" onSubmit={onSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="lm-name">
            Имя
          </label>
          <input
            id="lm-name"
            className="field-input"
            type="text"
            placeholder="Как к вам обращаться"
            required
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="lm-phone">
            Телефон
          </label>
          <input
            id="lm-phone"
            className="field-input"
            type="tel"
            placeholder="+7"
            required
          />
        </div>
        <button type="submit" className="btn btn-solid">
          Отправить заявку
        </button>
        <p className="apply-note">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных
          данных.
        </p>
      </form>
    </>
  );
}

/**
 * LeadModalProvider — единое модальное окно заявки в стиле сайта.
 * Любой компонент вызывает open({ title, kicker }) через useLeadModal().
 */
export function LeadModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState({ title: "Оставить заявку", kicker: "Заявка" });
  const [sent, setSent] = useState(false);
  const isMobile = useMediaQuery(MOBILE_MQ);

  const openModal = useCallback((opts = {}) => {
    setSent(false);
    setMeta({
      title: opts.title || "Оставить заявку",
      kicker: opts.kicker || "Заявка",
    });
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeModal]);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <LeadModalContext.Provider value={{ open: openModal, close: closeModal }}>
      {children}

      {open && (
        <div
          className={`lead-modal${isMobile ? " lead-modal--sheet" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={meta.title}
        >
          {isMobile ? (
            <MobileBottomSheet onClose={closeModal}>
              <LeadModalBody meta={meta} sent={sent} onSubmit={handleSubmit} />
            </MobileBottomSheet>
          ) : (
            <>
              <div className="lead-modal__backdrop" onClick={closeModal} />
              <div className="lead-modal__dialog">
                <button
                  type="button"
                  className="lead-modal__close"
                  onClick={closeModal}
                  aria-label="Закрыть"
                >
                  ×
                </button>
                <LeadModalBody meta={meta} sent={sent} onSubmit={handleSubmit} />
              </div>
            </>
          )}
        </div>
      )}
    </LeadModalContext.Provider>
  );
}
