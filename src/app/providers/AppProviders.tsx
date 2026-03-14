import { PropsWithChildren } from "react";
import { AppProvider } from "../../legacy/providers/appContext";
import { ThemeProvider } from "./ThemeProvider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
};
