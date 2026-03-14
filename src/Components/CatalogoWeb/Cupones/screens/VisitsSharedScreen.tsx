import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

interface VisitsSharedScreenProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const VisitsSharedScreen: React.FC<VisitsSharedScreenProps> = ({
  title,
  subtitle,
  children,
}) => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate("/cuponespv");
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
          <h1 className="text-[18px] font-semibold text-[#565656]">Visitas</h1>
        </header>

        <section className="mb-5">
          <h2 className="text-[16px] font-semibold text-[#565656]">{title}</h2>
          <p className="text-[13px] text-[#7A7A7A] mt-1">{subtitle}</p>
        </section>

        <section
          className="rounded-xl border border-gray-200 bg-white p-4"
          style={{ boxShadow: `0 6px 14px ${context.store?.Color ?? "#6D01D1"}20` }}
        >
          {children}
        </section>
      </div>
    </div>
  );
};
