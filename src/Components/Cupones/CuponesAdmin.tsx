import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const stats = [
  { label: "Cupones activos", value: "12", helper: "+3 esta semana" },
  { label: "Redenciones", value: "84", helper: "Últimos 7 días" },
  { label: "Clientes únicos", value: "53", helper: "Base actual" },
];

const coupons = [
  { name: "2x1 en salchitacos", status: "Activo", uses: "24 usos", expires: "Vence en 12 días" },
  { name: "10% en hamburguesa clásica", status: "Programado", uses: "12 usos", expires: "Inicia mañana" },
  { name: "Papas fritas gratis", status: "Pausado", uses: "8 usos", expires: "Revisar stock" },
];

const activity = [
  { title: "Cupón 2x1 aplicado", detail: "Sucursal Centro · Hace 10 min" },
  { title: "Nuevo registro", detail: "Ana Martínez · Hace 35 min" },
  { title: "Cupón pausado", detail: "Papas fritas gratis · Hace 1 h" },
];

const statusStyles: Record<string, string> = {
  Activo: "bg-[#fbbc04] text-[#3e3e3e]",
  Programado: "bg-white/85 text-[#3e3e3e]",
  Pausado: "bg-[#f3b7b7] text-[#7a1f1f]",
};

const CuponesAdmin: React.FC = () => {
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
            <p className="text-sm text-[#6a6a6a]">Panel de administración</p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Control de cupones</p>
                <p className="text-sm text-white/80">Gestiona promociones y beneficios activos.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/cupones/admin/crear")}
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
              >
                Crear cupón
              </button>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-3 py-4 text-center shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                style={{ backgroundColor: mutedRose, color: textDark }}
              >
                <p className="text-lg font-extrabold">{stat.value}</p>
                <p className="text-xs font-semibold">{stat.label}</p>
                <p className="mt-1 text-[10px] text-[#6a6a6a]">{stat.helper}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-base font-extrabold text-[#414141]">Cupones destacados</p>
              <button type="button" className="text-xs font-semibold text-[#414141]">
                Ver todos
              </button>
            </div>

            <div
              className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white"
              style={{ backgroundColor: cardRed }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold">Escanear cupón</p>
                  <p className="text-sm text-white/80">Valida un QR con la cámara.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/cupones/admin/escanear")}
                  className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#3e3e3e]"
                >
                  Escanear
                </button>
              </div>
            </div>

            {coupons.map((coupon) => (
              <div
                key={coupon.name}
                className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white"
                style={{ backgroundColor: cardRed }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold">{coupon.name}</p>
                    <p className="text-sm text-white/80">{coupon.uses}</p>
                    <p className="text-xs text-white/70">{coupon.expires}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[coupon.status]}`}
                  >
                    {coupon.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/cupones/admin/editar")}
                    className="flex-1 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#3e3e3e]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-white/70 px-3 py-2 text-xs font-bold text-white"
                  >
                    Pausar
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.16)] bg-white">
            <div className="flex items-center justify-between">
              <p className="text-base font-extrabold text-[#414141]">Actividad reciente</p>
              <span className="text-xs font-semibold text-[#6a6a6a]">Últimas 24 h</span>
            </div>
            <div className="mt-3 space-y-3">
              {activity.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentYellow }} />
                  <div>
                    <p className="text-sm font-semibold text-[#414141]">{item.title}</p>
                    <p className="text-xs text-[#6a6a6a]">{item.detail}</p>
                  </div>
                </div>
              ))}
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

export { CuponesAdmin };
export default CuponesAdmin;
