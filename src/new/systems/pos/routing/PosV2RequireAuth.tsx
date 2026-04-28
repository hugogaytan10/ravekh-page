import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSalesOnlyOperator, readPosSessionSnapshot } from "../shared/config/posSession";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const { token } = readPosSessionSnapshot();
  const location = useLocation();

  if (!token) {
    return <Navigate to={POS_V2_PATHS.login} replace />;
  }

  if (isSalesOnlyOperator(token)) {
    const allowedPaths = new Set([POS_V2_PATHS.sales, POS_V2_PATHS.more, POS_V2_PATHS.printers, POS_V2_PATHS.facturation]);
    if (!allowedPaths.has(location.pathname)) {
      return <Navigate to={POS_V2_PATHS.sales} replace />;
    }
  }

  return <>{children}</>;
};
