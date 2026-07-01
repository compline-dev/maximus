import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FooterMap from "./FooterMap";

const EASE = [0.65, 0, 0.35, 1];
const VIEWPORT = { once: true, amount: 0.12 };

export default function Footer({ data }) {
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
              <p className="footer-tagline">{data.tagline}</p>
            </div>

            <div className="footer-cols">
              <div className="footer-col">
                <span className="footer-col-title">Проект</span>
                <a href="#about">О проекте</a>
                <Link to="/flats">Квартиры</Link>
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
                <span className="footer-static">{data.officeAddress}</span>
                <span className="footer-static">Время работы</span>
                <span className="footer-static">{data.workHours}</span>
                <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}>
                  Телефон отдела продаж: {data.phone}
                </a>
                <a href={data.mapUrl} target="_blank" rel="noopener noreferrer">
                  Точка на карте: {data.mapAddress}
                </a>
              </div>
              <div className="footer-col">
                <span className="footer-col-title">Соцсети</span>
                <div className="footer-social">
                  {data.vkUrl && (
                    <a
                      href={data.vkUrl}
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
                  )}
                  {data.telegramUrl && (
                    <a
                      href={data.telegramUrl}
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
                  )}
                </div>
              </div>
            </div>
          </div>

          <FooterMap />

          <div className="footer-bottom">
            <span className="footer-copy">{data.copyright}</span>
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
