import React from "react";
import cubito from "../../../assets/Cupones/cubito.png";
import cuponsito from "../../../assets/Cupones/cuponsito.png";

const accentYellow = "#fbbc04";

const coupons = [
  {
    title: "Próxima recompensa",
    description: "10% de descuento en hamburguesa clásica",
  },
  {
    title: "Descuento vigente",
    description: "10% de descuento en papas fritas",
  },
  {
    title: "Cupón destacado",
    description: "2x1 en salchitacos",
  },
];

const TicketIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8 text-white"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="4" y="5" width="16" height="14" rx="2.5" />
    <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
  </svg>
);

const LoyaltySection: React.FC = () => {
  return (
    <section className="bg-[#fff8e6] py-16">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-[#9f6b00]">Fidelidad y recompensas</p>
            <h2 className="mt-2 text-3xl font-bold text-[#2f2f2f]">
              Tus clientes ven cupones y descuentos de cada negocio en un solo lugar
            </h2>
            <p className="mt-4 text-base text-[#5b5b5b]">
              Con el módulo de fidelidad de Ravekh POS, cada usuario consulta su historial de visitas,
              cupones activos y promociones personalizadas. Los negocios pueden publicar recompensas y
              códigos QR para canje inmediato desde la app.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {[
                "Cupones por negocio",
                "Recompensas automáticas",
                "QR listo para canjear",
                "Historial de visitas",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#f6c13f] bg-white px-4 py-2 text-sm font-semibold text-[#7a4d00]"
                >
                  {item}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-8 rounded-full bg-[#c0202b] px-8 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(192,32,43,0.28)] transition hover:-translate-y-0.5"
            >
              Quiero mi programa de fidelidad
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-[32px] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#ffca1f]" />
              <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#ffca1f]" />

              <div className="relative z-10">
                <header className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#ffd24c] bg-[#fff2c2]">
                    <img src={cubito} alt="Avatar" className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#303030]">Hola Hugo</p>
                    <p className="text-xs text-[#6a6a6a]">Buen día</p>
                  </div>
                </header>

                <div className="mt-5 space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.description}
                      className="flex items-center gap-3 rounded-2xl bg-[#c0202b] px-4 py-3 text-white shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white/70">
                        <TicketIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide">{coupon.title}</p>
                        <p className="text-sm font-semibold leading-snug">{coupon.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#ffca1f]" />
              <div className="relative z-10 flex h-full flex-col items-center justify-between gap-6">
                <div className="flex w-full items-center justify-between">
                  <span className="rounded-full bg-[#f3f3f3] p-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-[#5d5d5d]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </span>
                  <img src={cuponsito} alt="Cupones" className="h-8 w-8" />
                </div>

                <div className="text-center">
                  <p className="text-base font-bold text-[#444]">Muestra el código</p>
                  <p className="text-xs text-[#7b7b7b]">Escanéalo en el negocio para canjear.</p>
                </div>

                <div className="grid h-40 w-40 grid-cols-7 gap-1 rounded-xl border-4 border-[#111] bg-white p-2">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={`qr-${index}`}
                      className={`block h-3 w-3 ${index % 5 === 0 || index % 7 === 0 ? "bg-black" : "bg-white"}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="rounded-full px-6 py-2 text-sm font-bold shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                  style={{ backgroundColor: accentYellow, color: "#4a3b00" }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltySection;
