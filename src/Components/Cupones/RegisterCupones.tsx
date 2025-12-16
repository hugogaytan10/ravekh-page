import React from "react";
import { useNavigate } from "react-router-dom";
import salchitaquito from "../../assets/Cupones/salchitaquito.png";
import papitas from "../../assets/Cupones/papitas.png";
import { setCuponesSession } from "./cuponesSession";

const accentYellow = "#f5b700";
const deepRed = "#d4252c";
const cardRed = "#b81b27";

const RegisterCupones: React.FC = () => {
  const navigate = useNavigate();
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 3px ${accentYellow}33`;
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: deepRed }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-60px] left-[-70px] w-[260px] h-[260px] rounded-full opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
        <div
          className="absolute bottom-[-80px] right-[-50px] w-[280px] h-[220px] rounded-[120px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
      </div>

      <div
        className="relative w-full max-w-[380px] rounded-[32px] shadow-2xl border-4 text-white overflow-hidden"
        style={{ backgroundColor: cardRed, borderColor: accentYellow }}
      >
        <div className="flex flex-col items-center px-6 pt-10 pb-4 space-y-6">
          <img src={salchitaquito} alt="Salchitaquito" className="w-24 h-auto drop-shadow-lg" />
          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">Registrar</p>
            <h1 className="text-3xl font-bold">mi cuenta</h1>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold tracking-wide">Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl bg-white text-[#5b1c00] placeholder-[#a25800] px-4 py-3 border-2 focus:outline-none focus:ring-2"
                style={{ borderColor: accentYellow, boxShadow: `0 0 0 0 ${accentYellow}` }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold tracking-wide">Crea una contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-white text-[#5b1c00] placeholder-[#a25800] px-4 py-3 border-2 focus:outline-none focus:ring-2"
                style={{ borderColor: accentYellow, boxShadow: `0 0 0 0 ${accentYellow}` }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold tracking-wide">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full rounded-xl bg-white text-[#5b1c00] placeholder-[#a25800] px-4 py-3 border-2 focus:outline-none focus:ring-2"
                style={{ borderColor: accentYellow, boxShadow: `0 0 0 0 ${accentYellow}` }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-2 w-full rounded-full text-[#9b0f18] font-bold py-3 text-lg shadow-lg hover:brightness-110 transition"
            style={{ backgroundColor: accentYellow }}
            onClick={() => {
              setCuponesSession(true);
              navigate("/cupones/home");
            }}
          >
            Crear cuenta
          </button>

          <p className="text-sm text-center">
            Si ya tienes cuenta,
            <button
              type="button"
              className="font-bold ml-1 underline"
              style={{ color: accentYellow }}
              onClick={() => navigate("/cupones")}
            >
              inicia sesión
            </button>
          </p>

          <img src={papitas} alt="Papitas" className="w-32 h-auto drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export { RegisterCupones };
export default RegisterCupones;
