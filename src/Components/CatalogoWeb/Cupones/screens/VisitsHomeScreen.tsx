import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../assets/POS/ChevronGo";
import PlusIcon from "../../../../assets/POS/PlusIcon";
import { GridIcon } from "../../../../assets/Cupones/icons/GridIcon";
import { TopClientsIcon } from "../../../../assets/Cupones/icons/TopClientsIcon";
import { OfflineIcon } from "../../../../assets/Cupones/icons/OfflineIcon";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";

const Tile: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 transition"
  >
    <div className="flex items-center gap-2 mb-8">
      {icon}
      <p className="text-[14px] font-semibold text-[#565656]">{title}</p>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#8A8A8A]">Ver detalles</span>
      <ChevronGo width={14} height={14} stroke="#CCCCCC" />
    </div>
  </button>
);

const ActionRow: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; onClick: () => void }> = ({ title, subtitle, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition"
  >
    <div className="flex items-center min-w-0">
      <span className="w-8 h-8 mr-3 rounded-full border border-gray-200 flex items-center justify-center">{icon}</span>
      <span className="text-left min-w-0">
        <p className="text-[14px] font-semibold text-[#565656] truncate">{title}</p>
        <p className="text-[12px] text-[#8A8A8A] truncate">{subtitle}</p>
      </span>
    </div>
    <ChevronGo width={18} height={18} stroke="#CCCCCC" />
  </button>
);

export const VisitsHomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/more", { replace: true });
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="px-5 py-5 max-w-xl mx-auto">
        <header className="flex items-center gap-2 mb-5">
          <button type="button" onClick={handleBack} className="rounded-full p-1 hover:bg-gray-200 transition" aria-label="Regresar">
            <ChevronBack width={24} height={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-[#565656]">Visitas</h1>
        </header>

        <section className="mb-5">
          <h2 className="text-[16px] font-semibold text-[#565656]">Consulta y crea visitas</h2>
          <p className="text-[13px] text-[#7A7A7A] mt-1">
            Explora los apartados de visitas y genera experiencias inolvidables para tus clientes.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Tile title="Mejores clientes" icon={<TopClientsIcon />} onClick={() => navigate("top-clientes")} />
          <Tile title="Visitas totales" icon={<GridIcon stroke="#565656" />} onClick={() => navigate("totales")} />
        </section>

        <section className="space-y-3">
          <h3 className="text-[15px] font-semibold text-[#565656]">Acciones</h3>
          <ActionRow
            title="Nueva visita"
            subtitle="Crea un nuevo código QR para una visita"
            icon={<PlusIcon width={18} height={18} color="#565656" stroke="2.5" />}
            onClick={() => navigate("generar/online")}
          />
          <ActionRow
            title="QR dinámico"
            subtitle="Se actualiza automáticamente para cada visita"
            icon={<GridIcon stroke="#565656" />}
            onClick={() => navigate("qr-dinamico")}
          />
        </section>
      </div>
    </div>
  );
};
