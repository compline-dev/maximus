import { useState } from "react";
import SiteNav from "../components/SiteNav.jsx";
import FilterSidebar from "../components/flats/FilterSidebar.jsx";
import FlatCard from "../components/flats/FlatCard.jsx";
import SortBar from "../components/flats/SortBar.jsx";
import PlanTab from "../components/flats/PlanTab.jsx";
import { LeadModalProvider } from "../components/LeadModal.jsx";
import { useFlats, useFiltersData } from "../hooks/useFlats.js";

export default function Flats() {
  const [tab, setTab] = useState("params");
  const filtersData = useFiltersData();
  const { filters, setFilters, setFiltersImmediate, flats, total, loading, loadMore, hasMore } =
    useFlats();

  return (
    <LeadModalProvider>
      <SiteNav dark />
      <main className="flats-page">
        <div className="flats-header">
          <span className="kicker">Выбор квартиры</span>
          <h1 className="flats-header__title display">ВЫБОР КВАРТИРЫ</h1>
          <div className="flats-header__tabs">
            <button
              type="button"
              className={`flats-tab${tab === "params" ? " flats-tab--active" : ""}`}
              onClick={() => setTab("params")}
            >
              По параметрам
            </button>
            <button
              type="button"
              className={`flats-tab${tab === "plan" ? " flats-tab--active" : ""}`}
              onClick={() => setTab("plan")}
            >
              На плане
            </button>
          </div>
        </div>

        {tab === "params" && (
          <div className="flats-content">
            <FilterSidebar
              filtersData={filtersData}
              filters={filters}
              setFilters={setFilters}
              setFiltersImmediate={setFiltersImmediate}
            />

            <div className="flats-main">
              <SortBar
                total={total}
                filters={filters}
                setFiltersImmediate={setFiltersImmediate}
              />

              {flats.length === 0 && !loading && (
                <div className="flats-empty">
                  Квартиры не найдены. Попробуйте изменить фильтры.
                </div>
              )}

              <div className="flats-grid">
                {flats.map((flat) => (
                  <FlatCard key={flat.id} flat={flat} />
                ))}
              </div>

              {loading && <div className="flats-loading">Загрузка…</div>}

              {hasMore && !loading && (
                <button type="button" className="flats-more btn" onClick={loadMore}>
                  Показать ещё
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "plan" && <PlanTab />}
      </main>
    </LeadModalProvider>
  );
}
