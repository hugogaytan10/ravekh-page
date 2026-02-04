import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme, type ThemePreference } from "../interface/useCouponsTheme";
import { getCuponesUserName, hasCuponesSession, setCuponesSession } from "../services/session";

const options = [
  { label: "Cambiar nombre" },
  { label: "Eliminar cuenta" },
];

const ArrowIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();
  const { theme, themeMode, preference, setThemePreference } = useCouponsTheme();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

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
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Buen día
            </p>
          </div>
        </header>

        <main className="mt-10 space-y-3">
          <section
            className="w-full rounded-2xl px-4 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">Tema oscuro</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Se ajusta automáticamente al dispositivo cuando está en modo sistema.
                </p>
              </div>
              <button
                type="button"
                className="relative h-8 w-20 rounded-full transition-colors"
                style={{ backgroundColor: themeMode === "dark" ? theme.accent : theme.surfaceElevated }}
                onClick={() => {
                  const nextMode: ThemePreference = themeMode === "dark" ? "light" : "dark";
                  setThemePreference(nextMode);
                }}
              >
                <span
                  className="absolute top-1 h-6 w-6 rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.2)] transition-transform"
                  style={{
                    transform: themeMode === "dark" ? "translateX(-28px)" : "translateX(4px)",
                    backgroundColor: themeMode === "dark" ? theme.surface : theme.accent,
                  }}
                />
              </button>
            </div>
            <button
              type="button"
              className="mt-3 text-xs font-semibold underline"
              style={{ color: theme.textMuted }}
              onClick={() => setThemePreference("system")}
            >
              Usar tema del dispositivo ({preference === "system" ? "activo" : "restaurar"})
            </button>
          </section>
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
              onClick={() => {
                if (option.path) {
                  navigate(option.path);
                }
              }}
            >
              <span>{option.label}</span>
              <span className="text-xl" style={{ color: theme.textMuted }}>
                <ArrowIcon />
              </span>
            </button>
          ))}
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
            style={{ backgroundColor: theme.accent, color: theme.textPrimary, borderColor: theme.border }}
            onClick={() => {
              setCuponesSession(false);
              navigate("/cupones", { replace: true });
            }}
          >
            <span>Cerrar sesión</span>
            <span className="text-xl" style={{ color: theme.textPrimary }}>
              <ArrowIcon />
            </span>
          </button>
        </main>

        <CuponesNav active="ajustes" />
      </div>
    </div>
  );
};

export { SettingsPage };
export default SettingsPage;
