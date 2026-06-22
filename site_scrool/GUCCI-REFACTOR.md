# Gucci editorial refactor — чек-лист

## Пофайловый чек-лист

| Файл | Статус | Что сделано |
|------|--------|-------------|
| `src/index.css` | ✅ | Токены `--bg`/`--accent` (#1F3A2C), удалены gold/blue; `.site-nav`, `.text-link`, editorial 2-up; lighter veils; spacing 128px |
| `src/components/Hero.jsx` | ✅ | Fixed nav transparent→scrolled; Bodoni h1 + ScrollPhrase; слабые градиенты |
| `src/components/Editorial.jsx` | ✅ | 2-up split, season eyebrow, text-link CTA, без decor-dot/side |
| `src/App.jsx` | ✅ | Убран `.block-divider` |
| `src/components/ApplyForm.jsx` | ✅ | Кнопка `.btn-solid` (зелёный акцент) |
| `src/components/Footer.jsx` | — | Без изменений логики; зелёный `--accent` сохранён |
| `src/components/VideoBanner.jsx` | — | `.hero .veil` ослаблен через CSS |
| `src/components/DualVideo.jsx` | — | `.dv-veil` ослаблен через CSS |
| `src/hooks/useImageSequence.js` | ⛔ не трогать | |
| `src/components/Preloader.jsx` | ⛔ не трогать | |

## Критерий «готово»

- [ ] Один акцент `#1F3A2C`: зелёный только в footer, `.btn-solid`, курсив `.it`, подчёркивания `.text-link` / mode-toggle
- [ ] Фон `#FFFFFF`, текст `#1A1A1A`, без gold/blue/editorial-blue в CSS
- [ ] Header: прозрачный + белый текст над hero → `.scrolled` бумага + hairline
- [ ] Hero h1 и scroll-фразы — Bodoni Moda, weight 400, caps + tracking
- [ ] Фото full-bleed, прямые углы, `--bg-warm`, без декор-шума (dots, sides, block-divider)
- [ ] Editorial: 2-up split + «I очередь · SS 2026» + text-link CTA
- [ ] ApplyForm: solid green button, focus inputs `--accent`
- [ ] Секции 100–160px padding, без border-radius / box-shadow на блоках
- [ ] Footer curtain-reveal (вариант A) работает

## Не трогать

- **Image sequence** — `useImageSequence.js`, пути кадров, `FRAME_COUNT`
- **Canvas / scroll-scrub** — логика `draw`, `getFrameIndexFromScroll`, сброс scroll при смене режима
- **Переключатель Видео / Сборка** — `HERO_MODES`, `layoutId="hero-mode-underline"`, spring-параметры
- **Framer-тайминги** — footer curtain `[0.65,0,0.35,1]` / 0.8s; scroll spring stiffness 140; phrase crossfade ranges
- **Preloader** — компонент и интеграция (если подключится позже)
