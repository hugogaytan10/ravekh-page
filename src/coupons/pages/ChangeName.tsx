import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserName, hasCuponesSession, setCuponesUserName } from "../services/session";

const ChangeName: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();
  const [name, setName] = useState(getCuponesUserName());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setMessage("Por favor escribe tu nombre.");
      return;
    }
    setIsSaving(true);
    setCuponesUserName(name.trim());
    setMessage("Nombre actualizado correctamente.");
    setTimeout(() => {
      setIsSaving(false);
      navigate("/cupones/ajustes");
    }, 900);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-36 transition-colors"
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
        <header className="flex items-center gap-3 pt-8 px-1" style={{ color: theme.textPrimary }}>
          <div
            className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
          >
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Actualiza tu nombre</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Este nombre se mostrará en tus cupones.
            </p>
          </div>
        </header>

        <main className="mt-10 space-y-4">
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <label className="text-sm font-semibold" htmlFor="coupon-name">
              Nombre completo
            </label>
            <input
              id="coupon-name"
              type="text"
              className="mt-3 w-full rounded-2xl px-5 py-3 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: theme.surfaceElevated, color: theme.textPrimary, boxShadow: "none" }}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {message ? (
              <p className="mt-3 text-sm font-semibold" style={{ color: theme.textMuted }}>
                {message}
              </p>
            ) : null}
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_10px_22px_rgba(0,0,0,0.2)] disabled:opacity-70"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              className="w-full rounded-full border px-4 py-3 text-sm font-bold"
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/ajustes")}
            >
              Cancelar
            </button>
          </div>
        </main>

        <CuponesNav active="ajustes" />
      </div>
    </div>
  );
};

export { ChangeName };
export default ChangeName;