import { PropsWithChildren, useEffect } from "react";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark" || storedTheme === "light") {
      root.setAttribute("data-theme", storedTheme);
    }
  }, []);

  return children;
};
