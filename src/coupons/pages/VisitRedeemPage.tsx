import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserId, hasCuponesSession } from "../services/session";
import { redeemVisitQr } from "../services/visitsApi";
import { CouponsPageHeader } from "../components/CouponsPageHeader";

const VisitRedeemPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCouponsTheme();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [couponGenerated, setCouponGenerated] = useState(false);

  const hasSession = hasCuponesSession();

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

    if (!hasSession) {
      setStatus("idle");
      return;
    }

    const userId = getCuponesUserId();
    // Aunque no es probable que esto falle, lo validamos para evitar errores inesperados al hacer la petición.
    const controller = new AbortController();

    if (typeof userId !== "number" || !Number.isFinite(userId)) {
      setStatus("error");
      setMessage("Necesitamos tu sesión activa para registrar la visita.");
      return;
    }

    const submitRedeem = async () => {
      setStatus("loading");
      setMessage("");
      try {
        const response = await redeemVisitQr(token, userId, controller.signal);
        setCouponGenerated(response.couponGenerated);
        setStatus("success");
        setMessage("¡Visita registrada exitosamente!");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo registrar la visita.");
      }
    };

    void submitRedeem();
  }, [hasSession, token]);

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
        <CouponsPageHeader
          theme={theme}
          title="Registro de visita"
          subtitle="Valida tu QR para sumar visitas."
          onBack={() => navigate("/cupones/home")}
          backLabel="Volver a inicio"
        />

        <main className="mt-10 space-y-4">
          {!hasSession ? (
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
                <div className="mt-3 space-y-3">
                  <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
                    {couponGenerated
                      ? "¡Genial! Se generó un cupón por tu visita."
                      : "Sigue visitando el negocio para desbloquear recompensas."}
                  </p>
                  {couponGenerated ? (
                    <button
                      type="button"
                      className="w-full rounded-full px-4 py-2 text-sm font-bold"
                      style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                      onClick={() => navigate("/cupones/mis-cupones")}
                    >
                      Ver mis cupones
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {hasSession ? (
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
                onClick={() => navigate("/cupones/mis-cupones")}
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
