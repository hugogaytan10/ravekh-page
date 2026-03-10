import React from "react";
import { VisitsSharedScreen } from "./VisitsSharedScreen";

export const ViewVisitsScreen: React.FC = () => {
  return (
    <VisitsSharedScreen
      title="Visitas totales"
      subtitle="Consulta el total acumulado y el comportamiento por periodos."
    >
      <p className="text-sm text-[#565656]">Aquí podrás revisar el resumen general de visitas de tu negocio.</p>
    </VisitsSharedScreen>
  );
};
