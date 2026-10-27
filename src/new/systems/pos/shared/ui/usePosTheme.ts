import { useEffect, useState } from "react";

export const usePosTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = window.localStorage.getItem("pos-v2-ui-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch { /* El navegador puede bloquear el almacenamiento. */ }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { window.localStorage.setItem("pos-v2-ui-theme", theme); } catch { /* Conserva el tema durante la sesión. */ }
  }, [theme]);
  return [theme, setTheme] as const;
};
