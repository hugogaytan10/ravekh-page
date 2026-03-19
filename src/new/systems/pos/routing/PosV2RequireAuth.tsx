import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const TOKEN_KEY = "pos-v2-token";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return <Navigate to="/v2/login-punto-venta" replace />;
  }

  return <>{children}</>;
};
