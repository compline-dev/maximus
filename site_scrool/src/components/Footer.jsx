import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FooterMap from "./FooterMap";

const EASE = [0.65, 0, 0.35, 1];
const VIEWPORT = { once: true, amount: 0.12 };

/**
 * Footer — зелёная «шторка снизу» (Curtain Reveal) при скролле.
 */
export default function Footer() {
  return (
    <div className="footer-stage">
      <motion.footer
        id="contact"
        className="footer"
        initial={{ y: 56, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <motion.div
          className="footer-inner"
          initial={{ y: 28, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <img className="footer-logo-mark" src="/logo/logo-maximus.png" alt="" />
                МАКСИМУС
              </div>
              <p className="footer-tagline">
                Жилой комплекс премиум-класса. Архитектура, продуманная для жизни.
              </p>
            </div>

            <div className="footer-cols">
              <div className="footer-col">
                <span className="footer-col-title">Проект</span>
                <a href="#about">О проекте</a>
                <a href="#about">Архитектура</a>
                <a href="#residences">Резиденции</a>
                <a href="#apply">Заявка</a>
              </div>
              <div className="footer-col">
                <span className="footer-col-title">Покупателю</span>
                <a href="#">Планировки</a>
                <a href="#">Ипотека</a>
                <Link to="/construction">Ход строительства</Link>
                <a href="#">Документы</a>
              </div>
              <div className="footer-col">
                <span className="footer-col-title">Контакты</span>
                <span className="footer-static">Офис продаж: г. Уфа, ул. Гафури, 77</span>
                <span className="footer-static">Время работы</span>
                <span className="footer-static">ЕЖЕДНЕВНО с 10:00 до 20:00</span>
                <a href="tel:+73472257025">Телефон отдела продаж: +7 (347) 225 70 25</a>
                <a
                  href="https://yandex.ru/maps/172/ufa/house/ulitsa_mendeleyeva_154/YU8YdgViT0QCQFtufXtzcXhiZw==/?ll=56.024095%2C54.720458&z=15.47"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Точка на карте: г. Уфа, ул. Менделеева, 154
                </a>
              </div>
              <div className="footer-col">
                <span className="footer-col-title">Соцсети</span>
                <div className="footer-social">
                  <a
                    href="https://vk.com/gk_stroitek_ufa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label="ВКонтакте"
                  >
                    <svg viewBox="0 0 24 24" className="footer-social-icon" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.79 16.39c-5.47 0-8.59-3.75-8.72-9.99h2.74c.09 4.58 2.11 6.52 3.71 6.92V6.4h2.58v3.95c1.58-.17 3.24-1.97 3.8-3.95h2.58c-.43 2.44-2.23 4.24-3.51 4.98 1.28.6 3.33 2.17 4.11 5.01h-2.84c-.61-1.9-2.13-3.37-4.14-3.57v3.57h-.6Z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://t.me/gk_stroitek_ufa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label="Telegram"
                  >
                    <svg viewBox="0 0 24 24" className="footer-social-icon" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M21.94 4.64 18.9 19.01c-.23 1.01-.83 1.26-1.69.78l-4.66-3.43-2.25 2.16c-.25.25-.46.46-.93.46l.33-4.72L18.6 6.5c.37-.33-.08-.51-.58-.18L6.41 13.6l-4.62-1.45c-1-.31-1.02-1 .21-1.48l18.06-6.96c.83-.31 1.56.2 1.29 1.46l.59-.53Z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <FooterMap />

          <div className="footer-bottom">
            <span className="footer-copy">© 2026 МАКСИМУС. Все права защищены.</span>
            <div className="footer-legal">
              <a href="#">Политика конфиденциальности</a>
              <a href="#">Проектная декларация</a>
            </div>
          </div>
        </motion.div>
      </motion.footer>
    </div>
  );
}
