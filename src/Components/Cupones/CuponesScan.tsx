import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const couponData = {
  name: "2x1 en salchitacos",
  qr: "QR-AB12C-9F4D",
  valid: "31/12/2024",
  limitUsers: "120",
  status: "Activo",
};

const CuponesScan: React.FC = () => {
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
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]">
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm text-[#6a6a6a]">Escanear cupón</p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Escaneo de QR</p>
                <p className="text-sm text-white/80">Apunta la cámara al código.</p>
              </div>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
                onClick={() => navigate("/cupones/admin")}
              >
                Volver
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
            <p className="text-sm font-bold text-[#414141]">Vista de cámara</p>
            <div className="mt-3 rounded-2xl border-2 border-dashed border-[#cfcfcf] bg-[#f5f5f5] p-6 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-[#e1e1e1] bg-white">
                <span className="text-xs font-semibold text-[#8a8a8a]">QR</span>
              </div>
              <p className="mt-4 text-xs text-[#6a6a6a]">
                Activa la cámara para detectar el código automáticamente.
              </p>
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.14)]"
            style={{ backgroundColor: mutedRose, color: textDark }}
          >
            <p className="text-base font-extrabold">Datos del cupón</p>
            <div className="mt-3 space-y-2 text-sm font-semibold">
              <p>Nombre: {couponData.name}</p>
              <p>QR: {couponData.qr}</p>
              <p>Valid: {couponData.valid}</p>
              <p>LimitUsers: {couponData.limitUsers}</p>
              <p>Estado: {couponData.status}</p>
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <p className="text-sm font-semibold text-white/80">Revisión</p>
            <p className="mt-2 text-sm">
              Confirma los datos del cupón antes de aceptar la redención.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 rounded-full border border-white/70 px-3 py-2 text-xs font-bold text-white"
              >
                Rechazar
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#3e3e3e]"
                onClick={() => navigate("/cupones/admin/confirmado")}
              >
                Aceptar
              </button>
            </div>
          </section>
        </main>

        <div className="mt-10">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesScan };
export default CuponesScan;
