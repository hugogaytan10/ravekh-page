import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import papitas from "../../assets/Cupones/papitas.png";
import hamburguesita from "../../assets/Cupones/hamburguesita.png";
import salchitaquito from "../../assets/Cupones/salchitaquito.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#f5b700";
const deepRed = "#d4252c";
const cardRed = "#b81b27";

const coupons = [
  {
    title: "Hamburguesa clásica",
    description: "10% de descuento en tu siguiente compra",
    icon: hamburguesita,
    code: "HAMB10",
    remaining: "Válido por 5 días",
  },
  {
    title: "Papas a la francesa",
    description: "Llévate unas papitas gratis",
    icon: papitas,
    code: "PAPITASFREE",
    remaining: "Válido hoy",
  },
  {
    title: "Salchitaquitos",
    description: "2x1 en salchitaquitos",
    icon: salchitaquito,
    code: "SALCHI2X1",
    remaining: "Válido por 3 días",
  },
];

const CuponesList: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10 relative"
      style={{ backgroundColor: deepRed }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-80px] right-[-120px] w-[320px] h-[260px] rounded-[160px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
        <div
          className="absolute bottom-[-140px] left-[-120px] w-[380px] h-[260px] rounded-[140px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
      </div>

      <div className="relative w-full max-w-[380px] rounded-[32px]">
        <header className="flex items-center justify-between px-1 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <img src={cuponsito} alt="Cupones" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold">Mis cupones</p>
              <p className="text-sm opacity-90">Revisa tus recompensas</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: accentYellow, color: cardRed }}
          >
            + Añadir
          </button>
        </header>

        <div className="mt-6 space-y-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="rounded-2xl px-4 py-4 shadow-lg text-white flex gap-3"
              style={{ backgroundColor: cardRed }}
            >
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: accentYellow }}
              >
                <img src={coupon.icon} alt={coupon.title} className="h-10 w-10 object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold leading-tight">{coupon.title}</p>
                    <p className="text-sm leading-tight opacity-95">{coupon.description}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#ffedd3", color: cardRed }}
                  >
                    {coupon.remaining}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: accentYellow }}>
                    Código: {coupon.code}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ backgroundColor: "#ffedd3", color: cardRed }}
                  >
                    Usar cupón
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <CuponesNav active="cupones" />
        </div>
      </div>
    </div>
  );
};

export { CuponesList };
export default CuponesList;
