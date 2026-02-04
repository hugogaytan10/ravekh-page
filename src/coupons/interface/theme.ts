type CouponsThemeMode = "light" | "dark";
const couponsThemes = {
  light: {
    background: "#ffffff",
    surface: "#ffffff",
    surfaceElevated: "#f4f4f5",
    textPrimary: "#2f2f2f",
    textMuted: "#6b6b6b",
    accent: "#f6b11a",
    accentSoft: "#ffd36a",
    border: "#eeeeee",
    nav: "#555555",
  },
  dark: {
    background: "#1f1f1f",
    surface: "#4a4a4a",
    surfaceElevated: "#3c3c3c",
    textPrimary: "#f3f3f3",
    textMuted: "#c7c7c7",
    accent: "#f6b11a",
    accentSoft: "#ffd36a",
    border: "#5a5a5a",
    nav: "#4a4a4a",
  },
} as const;

export type { CouponsThemeMode };
export { couponsThemes };