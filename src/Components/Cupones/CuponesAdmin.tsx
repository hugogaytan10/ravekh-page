import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { Coupon, getCouponsByBusiness } from "./couponsApi";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const activity = [
  { title: "Cupón 2x1 aplicado", detail: "Sucursal Centro · Hace 10 min" },
  { title: "Nuevo registro", detail: "Ana Martínez · Hace 35 min" },
  { title: "Cupón pausado", detail: "Papas fritas gratis · Hace 1 h" },
];

const BUSINESS_ID = 1;

const statusStyles: Record<string, string> = {
  Activo: "bg-[#fbbc04] text-[#3e3e3e]",
  Programado: "bg-white/85 text-[#3e3e3e]",
  Pausado: "bg-[#f3b7b7] text-[#7a1f1f]",
  Vencido: "bg-white/85 text-[#7a1f1f]",
};

const CuponesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();

  // ✅ Siempre array
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Normalizador: lo que sea que venga, lo conviertes a array seguro
  const normalizeCoupons = (payload: unknown): Coupon[] => {
    if (Array.isArray(payload)) return payload as Coupon[];

    // Si tu api a veces regresa { data: [...] }
    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      Array.isArray((payload as any).data)
    ) {
      return (payload as any).data as Coupon[];
    }

    return [];
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const activeCount = coupons.filter((coupon) => {
      const t = new Date(coupon.Valid).getTime();
      return Number.isFinite(t) && t >= now;
    }).length;

    return [
      { label: "Cupones activos", value: `${activeCount}`, helper: "Vigentes hoy" },
      { label: "Cupones totales", value: `${coupons.length}`, helper: "Registrados" },
      { label: "Clientes únicos", value: "53", helper: "Base actual" },
    ];
  }, [coupons]);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
      return;
    }

    const loadCoupons = async () => {
      setIsLoading(true);
      try {
        const response = await getCouponsByBusiness(BUSINESS_ID);

        // ✅ Aquí se evita que truene aunque venga null/undefined/objeto
        const safeCoupons = normalizeCoupons(response);

        setCoupons(safeCoupons);
        setErrorMessage("");
      } catch (error) {
        setCoupons([]); // ✅ evita que quede basura/estado raro
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar los cupones.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoupons();
  }, [navigate]);

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatus = (coupon: Coupon) => {
    const validTime = new Date(coupon.Valid).getTime();
    if (!Number.isFinite(validTime)) return "Vencido";
    return validTime >= Date.now() ? "Activo" : "Vencido";
  };

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

            {isLoading ? (
              <div
                className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white"
                style={{ backgroundColor: cardRed }}
              >
                <p className="text-sm font-semibold">Cargando cupones...</p>
              </div>
            ) : null}

            {!isLoading && errorMessage ? (
              <div
                className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white"
                style={{ backgroundColor: cardRed }}
              >
                <p className="text-sm font-semibold">{errorMessage}</p>
              </div>
            ) : null}

            {/* ✅ Aquí ya nunca truena: coupons siempre es array */}
            {!isLoading && !errorMessage && coupons.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white"
                style={{ backgroundColor: cardRed }}
              >
                <p className="text-sm font-semibold">No hay cupones.</p>
              </div>
            ) : null}

            {!isLoading && !errorMessage
              ? coupons.map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <div
                      key={coupon.Id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate("/cupones/admin/editar", { state: { coupon } })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          navigate("/cupones/admin/editar", { state: { coupon } });
                        }
                      }}
                      className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-white cursor-pointer"
                      style={{ backgroundColor: cardRed }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-extrabold">{coupon.Description}</p>
                          <p className="text-sm text-white/80">{`Límite: ${coupon.LimitUsers} usuarios`}</p>
                          <p className="text-xs text-white/70">{`Vence el ${formatDate(coupon.Valid)}`}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate("/cupones/admin/editar", { state: { coupon } });
                          }}
                          className="flex-1 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#3e3e3e]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate("/cupones/admin/editar", { state: { coupon, focusDelete: true } });
                          }}
                          className="flex-1 rounded-full border border-white/70 px-3 py-2 text-xs font-bold text-white"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              : null}
          </section>
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Escanear cupón</p>
                <p className="text-sm text-white/80">Valida un QR con la cámara.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/cupones/admin/escanear")}
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
              >
                Escanear
              </button>
            </div>
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
