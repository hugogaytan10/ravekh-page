import React from "react";
import { VisitsSharedScreen } from "./VisitsSharedScreen";

export const VisitsDynamicQrScreen: React.FC = () => {
  return (
    <VisitsSharedScreen
      title="QR dinámico"
      subtitle="Genera un QR que se actualiza automáticamente en cada visita."
    >
      <p className="text-sm text-[#565656]">Administra el QR dinámico y compártelo con tu equipo.</p>
    </VisitsSharedScreen>
  );
};
