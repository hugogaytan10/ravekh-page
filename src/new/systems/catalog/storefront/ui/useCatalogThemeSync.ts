import { useEffect } from "react";

const THEME_STORAGE_KEY = "pos-v2-ui-theme";

type UiTheme = "light" | "dark";

const resolveTheme = (): UiTheme => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "light";
};

export const useCatalogThemeSync = () => {
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      root.setAttribute("data-theme", resolveTheme());
    };

    applyTheme();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === THEME_STORAGE_KEY) {
        applyTheme();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);
};
