import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg-strong)" }}
        >
          <p
            className="mb-8 max-w-md text-sm leading-relaxed"
            style={{ color: "var(--fg-soft)" }}
          >
            Ошибка загрузки модуля. Пожалуйста, обновите страницу.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[11px] uppercase tracking-[0.42em]"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              padding: "14px 28px",
              cursor: "pointer",
            }}
          >
            Обновить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
