import { PropsWithChildren } from "react";
import AppProvider from "../../Components/CatalogoWeb/Context/AppContext";
import { ThemeProvider } from "./ThemeProvider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
};
