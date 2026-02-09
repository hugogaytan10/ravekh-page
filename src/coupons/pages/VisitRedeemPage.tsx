import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserId, hasCuponesSession } from "../services/session";
import { redeemVisitQr } from "../services/visitsApi";

const VisitRedeemPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCouponsTheme();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [couponGenerated, setCouponGenerated] = useState(false);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") ?? "";
  }, [location.search]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No encontramos el QR de visita en el enlace.");
      return;
    }

    if (!hasCuponesSession()) {
      setStatus("idle");
      return;
    }

    const userId = getCuponesUserId();
    if (!userId) {
      setStatus("error");
      setMessage("Necesitamos tu sesión activa para registrar la visita.");
      return;
    }

    const submitRedeem = async () => {
      setStatus("loading");
      setMessage("");
      try {
        const response = await redeemVisitQr(token, userId);
        setCouponGenerated(response.couponGenerated);
        setStatus("success");
        setMessage("¡Visita registrada exitosamente!");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo registrar la visita.");
      }
    };

    submitRedeem();
  }, [token]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 py-12 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-160px] right-[-200px] w-[380px] h-[380px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-220px] left-[-240px] w-[440px] h-[440px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-4 px-1" style={{ color: theme.textPrimary }}>
          <div
            className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
          >
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Registro de visita</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Valida tu QR para sumar visitas.
            </p>
          </div>
        </header>

        <main className="mt-10 space-y-4">
          {!hasCuponesSession() ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-base font-extrabold">Inicia sesión para continuar</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Necesitamos tu cuenta para registrar la visita. Luego podrás ver tus cupones aquí mismo.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full rounded-full px-4 py-2 text-sm font-bold"
                  style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                  onClick={() => navigate("/cupones")}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="w-full rounded-full border px-4 py-2 text-sm font-bold"
                  style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
                  onClick={() => navigate("/cupones/registro")}
                >
                  Crear cuenta
                </button>
              </div>
            </section>
          ) : (
            <section
              className="rounded-2xl px-6 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.22)] text-center border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surfaceElevated }}
              >
                <span className="text-3xl">
                  {status === "loading" ? "⏳" : status === "success" ? "✅" : status === "error" ? "⚠️" : "📍"}
                </span>
              </div>
              <p className="mt-4 text-xl font-extrabold">
                {status === "loading"
                  ? "Registrando visita..."
                  : status === "success"
                  ? "Visita registrada"
                  : status === "error"
                  ? "No pudimos registrar la visita"
                  : "Confirma tu visita"}
              </p>
              <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
                {message || "Procesaremos tu QR en segundos."}
              </p>
              {status === "success" ? (
                <p className="mt-3 text-sm font-semibold" style={{ color: theme.textMuted }}>
                  {couponGenerated
                    ? "¡Genial! Se generó un cupón por tu visita."
                    : "Sigue visitando el negocio para desbloquear recompensas."}
                </p>
              ) : null}
            </section>
          )}

          {hasCuponesSession() ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-full px-4 py-3 text-sm font-bold"
                style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                onClick={() => navigate("/cupones/home")}
              >
                Ir a inicio
              </button>
              <button
                type="button"
                className="w-full rounded-full border px-4 py-3 text-sm font-bold"
                style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
                onClick={() => navigate("/cupones/cupones")}
              >
                Ver mis cupones
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export { VisitRedeemPage };
export default VisitRedeemPage;