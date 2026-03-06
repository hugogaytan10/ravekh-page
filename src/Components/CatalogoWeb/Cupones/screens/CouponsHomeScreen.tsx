import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../assets/POS/ChevronGo";
import { PlusIcon } from "../../../../assets/Cupones/icons/PlusIcon";
import { GridIcon } from "../../../../assets/Cupones/icons/GridIcon";
import { ScannerIcon } from "../../../../assets/Cupones/icons/ScannerIcon";

const CardAction: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, subtitle, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition"
  >
    <div className="flex items-center min-w-0">
      <span className="w-6 h-6 flex items-center justify-center mr-3">{icon}</span>
      <span className="text-left min-w-0">
        <p className="text-[14px] font-semibold text-[#565656] truncate">{title}</p>
        <p className="text-[12px] text-[#8A8A8A] truncate">{subtitle}</p>
      </span>
    </div>
    <ChevronGo width={18} height={18} stroke="#CCCCCC" />
  </button>
);

export const CouponsHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/settings-p");
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="px-5 py-5 max-w-xl mx-auto">
        <header className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full p-1 hover:bg-gray-200 transition"
            aria-label="Regresar"
          >
            <ChevronBack width={24} height={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-[#565656]">Cupones</h1>
        </header>

        <section className="mb-6">
          <h2 className="text-[16px] font-semibold text-[#565656]">Consulta y crea cupones</h2>
          <p className="text-[13px] text-[#7A7A7A] mt-1">
            Explora los apartados para crear cupones, revisar los activos o escanearlos.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-[15px] font-semibold text-[#565656] mb-3">Acciones</h3>
          <div className="space-y-3">
            <CardAction
              title="Nuevo cupón"
              subtitle="Configura un cupón nuevo"
              icon={<PlusIcon stroke={accentColor} />}
              onClick={() => navigate("crear", { state: { hideMainCouponsTabs: true } })}
            />
            <CardAction
              title="Cupones activos"
              subtitle="Consulta tus cupones"
              icon={<GridIcon stroke={accentColor} />}
              onClick={() => navigate("lista")}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
