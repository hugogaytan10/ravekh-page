import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const textGray = "#414141";
const buttonGray = "#e3e3e3";
const arrowGray = "#5a5a5a";

const options = ["Cambiar nombre", "Eliminar cuenta"];

const ArrowIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

const CuponesSettings: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-12">
      <div className="absolute top-[-140px] right-[-160px] w-[340px] h-[340px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-180px] left-[-220px] w-[420px] h-[420px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]" style={{ color: textGray }}>
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola Hugo</p>
            <p className="text-sm text-[#6a6a6a]">Buen día</p>
          </div>
        </header>

        <main className="mt-10 space-y-3">
          {options.map((label) => (
            <button
              key={label}
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: buttonGray, color: textGray }}
            >
              <span>{label}</span>
              <span className="text-xl" style={{ color: arrowGray }}>
                <ArrowIcon />
              </span>
            </button>
          ))}
        </main>

        <div className="mt-12">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesSettings };
export default CuponesSettings;
