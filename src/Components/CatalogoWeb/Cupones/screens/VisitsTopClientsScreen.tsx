import React from "react";
import { VisitsSharedScreen } from "./VisitsSharedScreen";

export const VisitsTopClientsScreen: React.FC = () => {
  return (
    <VisitsSharedScreen
      title="Mejores clientes"
      subtitle="Visualiza los clientes con más visitas y premia su fidelidad."
    >
      <p className="text-sm text-[#565656]">Este panel mostrará el ranking de visitas por cliente.</p>
    </VisitsSharedScreen>
  );
};
