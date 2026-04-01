import { useEffect, useMemo, useState } from "react";
import { couponsThemes, type CouponsThemeMode } from "./theme";

const STORAGE_KEY = "coupons-theme";

type ThemePreference = CouponsThemeMode | "system";

const getSystemTheme = (): CouponsThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const readPreference = (): ThemePreference => {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return stored === "light" || stored === "dark" ? stored : "system";
};

const persistPreference = (value: ThemePreference) => {
  if (typeof window === "undefined") return;
  if (value === "system") {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value);
};

const useCouponsTheme = () => {
  const [preference, setPreference] = useState<ThemePreference>(() => readPreference());
  const [systemTheme, setSystemTheme] = useState<CouponsThemeMode>(() => getSystemTheme());

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const handler = () => setSystemTheme(media.matches ? "dark" : "light");
    handler();
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, []);

  const themeMode: CouponsThemeMode = preference === "system" ? systemTheme : preference;

  const setThemePreference = (value: ThemePreference) => {
    setPreference(value);
    persistPreference(value);
  };

  const theme = useMemo(() => couponsThemes[themeMode], [themeMode]);

  return { theme, themeMode, preference, setThemePreference };
};

export { useCouponsTheme };
export type { ThemePreference };
