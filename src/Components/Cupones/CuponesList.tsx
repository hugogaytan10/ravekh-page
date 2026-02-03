import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c7222c";
const textGray = "#414141";

const coupons = [
  { title: "Próxima recompensa", description: "10% de descuento en hamburguesa clasica" },
  { title: "Próxima recompensa", description: "10% de descuento en papas fritas" },
  { title: "Próxima recompensa", description: "2x1 en salchitacos" },
];

const TicketIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="14" rx="2.5" />
    <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
  </svg>
);

const CuponesList: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-12">
      <div className="absolute top-[-140px] right-[-160px] w-[340px] h-[340px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-160px] left-[-180px] w-[360px] h-[360px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]" style={{ color: textGray }}>
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm text-[#6a6a6a]">Buen día</p>
          </div>
        </header>

        <main className="mt-8 relative space-y-5">
          <div className="pointer-events-none absolute inset-x-[-32px] top-[130px] h-[120px] rounded-[38px] opacity-80 blur-[1px]" style={{ backgroundColor: accentYellow }} />

          {coupons.map((coupon, index) => (
            <section
              key={coupon.description}
              className="relative rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white bg-[#c0202b] flex items-center gap-4"
              style={{ zIndex: 1 + index }}
            >
              <div className="h-16 w-16 rounded-xl border-2 border-white/80 flex items-center justify-center">
                <TicketIcon />
              </div>
              <div>
                <p className="text-base font-extrabold">{coupon.title}</p>
                <p className="text-sm leading-snug">{coupon.description}</p>
              </div>
            </section>
          ))}
        </main>

        <div className="mt-10">
          <CuponesNav active="cupones" />
        </div>
      </div>
    </div>
  );
};

export { CuponesList };
export default CuponesList;
