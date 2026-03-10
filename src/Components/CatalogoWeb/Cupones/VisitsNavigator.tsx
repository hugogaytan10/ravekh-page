import React from "react";
import { Route, Routes } from "react-router-dom";
import { VisitsHomeScreen } from "./screens/VisitsHomeScreen";
import { VisitsTopClientsScreen } from "./screens/VisitsTopClientsScreen";
import { ViewVisitsScreen } from "./screens/ViewVisitsScreen";
import { VisitsGenerateScreen } from "./screens/VisitsGenerateScreen";
import { VisitsDynamicQrScreen } from "./screens/VisitsDynamicQrScreen";
import { VisitsQrActivesScreen } from "./screens/VisitsQrActivesScreen";

export const VisitsNavigator: React.FC = () => {
  return (
    <Routes>
      <Route index element={<VisitsHomeScreen />} />
      <Route path="top-clientes" element={<VisitsTopClientsScreen />} />
      <Route path="totales" element={<ViewVisitsScreen />} />
      <Route path="generar/:mode" element={<VisitsGenerateScreen />} />
      <Route path="qr-dinamico" element={<VisitsDynamicQrScreen />} />
      <Route path="qrs-activos/:mode" element={<VisitsQrActivesScreen />} />
    </Routes>
  );
};
