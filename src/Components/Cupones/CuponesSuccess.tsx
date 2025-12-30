import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";

const CuponesSuccess: React.FC = () => {
  const navigate = useNavigate();

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
            <p className="text-sm font-semibold">Hola Hugo</p>
            <p className="text-sm text-[#6a6a6a]">Cupón confirmado</p>
          </div>
        </header>

        <main className="mt-10 space-y-5">
          <section
            className="rounded-2xl px-6 py-6 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white text-center"
            style={{ backgroundColor: cardRed }}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
              <span className="text-3xl">✅</span>
            </div>
            <p className="mt-4 text-xl font-extrabold">Venta completada</p>
            <p className="mt-2 text-sm text-white/80">
              El cupón se aplicó correctamente y quedó registrado.
            </p>
          </section>

          <section className="rounded-2xl bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#414141]">Detalle del canje</p>
              <span className="text-xs font-semibold text-[#6a6a6a]">#A-0091</span>
            </div>
            <div className="mt-3 space-y-2 text-sm font-semibold text-[#414141]">
              <p>QR: QR-AB12C-9F4D</p>
              <p>Cupón: 2x1 en salchitacos</p>
              <p>Redención: 1 usuario</p>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
              onClick={() => navigate("/cupones/admin/escanear")}
            >
              Escanear otro cupón
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-[#cfcfcf] bg-white px-4 py-3 text-sm font-bold text-[#3e3e3e]"
              onClick={() => navigate("/cupones/admin")}
            >
              Volver al panel
            </button>
          </div>
        </main>

        <div className="mt-10">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesSuccess };
export default CuponesSuccess;
