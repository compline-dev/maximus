import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Preloader from "./components/Preloader.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const Construction = React.lazy(() => import("./pages/Construction.jsx"));
const Flats = React.lazy(() => import("./pages/Flats.jsx"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <Preloader
            indeterminate
            visible={true}
            detail="Загрузка модуля"
          />
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="/flats" element={<Flats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
