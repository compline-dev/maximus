import { useState } from "react";

/**
 * ApplyForm — секция с формой заявки.
 * После отправки показывает благодарность (без реального бэкенда).
 */
export default function ApplyForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="apply" id="apply">
      <div className="apply-wrap">
        <div className="apply-intro">
          <p className="kicker">Заявка</p>
          <h2 className="display">
            Запишитесь на <span className="it">приватный показ</span>
          </h2>
          <p className="lede">
            Оставьте контакты — менеджер свяжется с вами и подберёт удобное время
            визита в шоурум.
          </p>
        </div>

        {sent ? (
          <div className="apply-done">
            <p className="kicker">Спасибо</p>
            <p className="apply-done-text display">
              Заявка принята. Мы свяжемся с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <form className="apply-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="name">Имя</label>
              <input
                id="name"
                className="field-input"
                type="text"
                placeholder="Как к вам обращаться"
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="phone">Телефон</label>
              <input
                id="phone"
                className="field-input"
                type="tel"
                placeholder="+7"
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="msg">Комментарий</label>
              <textarea
                id="msg"
                className="field-input field-textarea"
                placeholder="Интересующая планировка, удобное время"
              />
            </div>
            <button type="submit" className="btn btn-solid">Отправить заявку</button>
            <p className="apply-note">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
