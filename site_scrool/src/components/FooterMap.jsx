import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView.js";

const MAP_LON = 56.024095;
const MAP_LAT = 54.720458;
const MAP_CENTER = [MAP_LAT, MAP_LON];
const MAP_ZOOM = 15;
const PIN_WIDTH = 224;
const PIN_HEIGHT = 78;
const YANDEX_URL =
  "https://yandex.ru/maps/172/ufa/house/ulitsa_mendeleyeva_154/YU8YdgViT0QCQFtufXtzcXhiZw==/?ll=56.024095%2C54.720458&z=15.47";
const WIDGET_SRC = `https://yandex.ru/map-widget/v1/?ll=${MAP_LON}%2C${MAP_LAT}&z=${MAP_ZOOM}`;

let ymapsLoader;

function loadYmaps() {
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps.ready(() => resolve(window.ymaps));
    });
  }

  if (!ymapsLoader) {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    const keyQuery = apiKey ? `apikey=${apiKey}&` : "";

    ymapsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?${keyQuery}lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => resolve(window.ymaps));
      };
      script.onerror = () => {
        ymapsLoader = null;
        reject(new Error("Yandex Maps failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  return ymapsLoader;
}

/**
 * Карта ЖК в footer: интерактивная Яндекс.Карта + метка с логотипом и «МАКСИМУС».
 */
export default function FooterMap() {
  const wrapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const inView = useInView(wrapRef, "160px");
  const [visible, setVisible] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    if (inView) setVisible(true);
  }, [inView]);

  useEffect(() => {
    if (!visible || useIframeFallback || !mapNodeRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !mapNodeRef.current || mapRef.current) return;

        const PlacemarkLayout = ymaps.templateLayoutFactory.createClass(
          `<div class="footer-map-pin footer-map-pin--geo">
            <div class="footer-map-pin-label">
              <img src="/logo/logo-maximus.png" class="footer-map-pin-logo" alt="" />
              <span class="footer-map-pin-word">МАКСИМУС</span>
            </div>
            <span class="footer-map-pin-stem"></span>
          </div>`,
        );

        const map = new ymaps.Map(
          mapNodeRef.current,
          {
            center: MAP_CENTER,
            zoom: MAP_ZOOM,
            controls: [],
          },
          {
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
          },
        );

        map.behaviors.disable("scrollZoom");

        const placemark = new ymaps.Placemark(
          MAP_CENTER,
          {},
          {
            iconLayout: PlacemarkLayout,
            iconOffset: [-PIN_WIDTH / 2, -PIN_HEIGHT],
            zIndex: 1000,
          },
        );

        map.geoObjects.add(placemark);
        mapRef.current = map;
      })
      .catch(() => {
        if (!cancelled) setUseIframeFallback(true);
      });

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [visible, useIframeFallback]);

  return (
    <div ref={wrapRef} className="footer-map-wrap">
      <div className="footer-map">
        {!visible && <div className="footer-map-placeholder" aria-hidden="true" />}

        {visible && !useIframeFallback && (
          <div ref={mapNodeRef} className="footer-map-canvas" />
        )}

        {visible && useIframeFallback && (
          <iframe
            title="МАКСИМУС на карте"
            src={WIDGET_SRC}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="footer-map-frame"
          />
        )}

        <a
          href={YANDEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-map-open"
          aria-label="Открыть МАКСИМУС в Яндекс Картах"
        >
          ↗
        </a>
      </div>
    </div>
  );
}
