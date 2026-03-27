import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { readPosSessionSnapshot } from "../shared/config/posSession";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const { token } = readPosSessionSnapshot();

  if (!token) {
    return <Navigate to="/v2/login-punto-venta" replace />;
  }

  return <>{children}</>;
};
