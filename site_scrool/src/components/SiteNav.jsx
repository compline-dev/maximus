import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LeadModalContext } from "./LeadModal.jsx";

export default function SiteNav({ forceTransparent = false, dark = false }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onHome = location.pathname === "/";
  const onConstruction = location.pathname === "/construction";

  const anchors = useMemo(() => {
    const prefix = onHome ? "" : "/";
    return {
      about: `${prefix}#about`,
      contact: `${prefix}#contact`,
      apply: `${prefix}#apply`,
    };
  }, [onHome]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const leadModal = useContext(LeadModalContext);
  const solid = scrolled && !forceTransparent;
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`site-nav pointer-events-auto${solid ? " scrolled" : ""}${
        menuOpen ? " menu-open" : ""
      }${onConstruction ? " site-nav--subpage" : ""}${dark ? " site-nav--dark" : ""}`}
    >
      <div className="site-nav__brand">
        <Link to="/" className="site-nav__logo" onClick={closeMenu}>
          <img
            src="/logo/logo-maximus.png"
            alt="МАКСИМУС"
            className="site-nav__mark"
          />
          <span className="site-nav__word">МАКСИМУС</span>
        </Link>
        {onConstruction && (
          <>
            <span className="site-nav__sep" aria-hidden="true" />
            <span className="site-nav__page">Ход строительства</span>
          </>
        )}
      </div>

      {onConstruction ? (
        <Link to="/" className="site-nav__back text-link" onClick={closeMenu}>
          <span className="site-nav__back-arrow" aria-hidden="true">
            ←
          </span>
          Главная
        </Link>
      ) : (
        <nav className="site-nav__links" aria-label="Основная навигация">
          <a href={anchors.about} className="text-link">
            Архитектура
          </a>
          <Link to="/construction" className="text-link">
            Ход строительства
          </Link>
          <a href={anchors.contact} className="text-link">
            Контакты
          </a>
        </nav>
      )}

      {!onConstruction && (
        <div className="site-nav__actions">
          {leadModal ? (
            <button
              type="button"
              className="site-nav__cta"
              onClick={() => { closeMenu(); leadModal.open({ title: "Записаться на встречу", kicker: "Встреча" }); }}
            >
              Записаться на встречу
            </button>
          ) : (
            <a
              href={anchors.apply}
              className="site-nav__cta"
              onClick={closeMenu}
            >
              Записаться на встречу
            </a>
          )}
          <button
            type="button"
            className="site-nav__burger"
            aria-expanded={menuOpen}
            aria-controls="site-nav-drawer"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-nav__burger-label">
              {menuOpen ? "Закрыть" : "Меню"}
            </span>
            <span className="site-nav__burger-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      )}

      {!onConstruction && (
        <div
          id="site-nav-drawer"
          className="site-nav__drawer"
          aria-hidden={!menuOpen}
        >
          <nav className="site-nav__drawer-links" aria-label="Мобильная навигация">
            <a href={anchors.about} className="site-nav__drawer-link" onClick={closeMenu}>
              Архитектура
            </a>
            <Link to="/construction" className="site-nav__drawer-link" onClick={closeMenu}>
              Ход строительства
            </Link>
            <a
              href={anchors.contact}
              className="site-nav__drawer-link"
              onClick={closeMenu}
            >
              Контакты
            </a>
            <a href={anchors.apply} className="site-nav__drawer-link" onClick={closeMenu}>
              Заявка
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

