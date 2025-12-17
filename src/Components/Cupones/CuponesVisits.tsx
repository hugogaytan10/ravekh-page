import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cubito from "../../assets/Cupones/cubito.png";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#ffca1f";
const textGray = "#414141";
const cardGray = "#e6e6e6";
const accentRed = "#c0202b";

const visits = new Array(6).fill("12 de agosto de 2025 6:50pm");

const BackIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CuponesVisits: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-12">
      <div className="absolute top-[-120px] right-[-180px] w-[340px] h-[340px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-180px] left-[-200px] w-[420px] h-[420px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: accentRed }}
            aria-label="Volver"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-extrabold" style={{ color: textGray }}>
            Mis visitas
          </h1>
          <div className="ml-auto">
            <img src={cubito} alt="Mascota Cupones" className="h-12 w-12 object-contain" />
          </div>
        </header>

        <div className="mt-2 rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
          <div className="h-10" style={{ backgroundColor: accentYellow }} />
          <div className="bg-white px-4 pb-6">
            <div className="mt-[-24px] space-y-3">
              {visits.map((visit, index) => (
                <div
                  key={`${visit}-${index}`}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_8px_12px_rgba(0,0,0,0.12)]"
                  style={{ backgroundColor: cardGray, color: textGray }}
                >
                  {visit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CuponesVisits };
export default CuponesVisits;
