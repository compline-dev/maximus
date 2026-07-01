import { useState } from "react";
import SiteNav from "../components/SiteNav.jsx";
import FilterSidebar from "../components/flats/FilterSidebar.jsx";
import FlatsList from "../components/flats/FlatsList.jsx";
import FlatDetailModal from "../components/flats/FlatDetailModal.jsx";
import SortBar from "../components/flats/SortBar.jsx";
import PlanTab from "../components/flats/PlanTab.jsx";
import { LeadModalProvider } from "../components/LeadModal.jsx";
import { useFlats, useFiltersData } from "../hooks/useFlats.js";

export default function Flats() {
  const [tab, setTab] = useState("params");
  const [detailFlat, setDetailFlat] = useState(null);
  const filtersData = useFiltersData();
  const { filters, setFilters, setFiltersImmediate, flats, total, loading, error, loadMore, hasMore } =
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
              <FlatsList
                flats={flats}
                loading={loading}
                error={error}
                hasMore={hasMore}
                onLoadMore={loadMore}
                onSelect={setDetailFlat}
              />
            </div>
          </div>
        )}

        {tab === "plan" && <PlanTab />}

        {detailFlat && (
          <FlatDetailModal flat={detailFlat} onClose={() => setDetailFlat(null)} />
        )}
      </main>
    </LeadModalProvider>
  );
}
