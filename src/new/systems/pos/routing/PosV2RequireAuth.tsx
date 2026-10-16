import { ReactNode, useEffect, useState } from "react";
import { FetchHttpClient } from "../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../shared/config/posEnv";
import { persistPosCurrency } from "../shared/config/posCurrency";
import { Navigate, useLocation } from "react-router-dom";
import { isSalesOnlyOperator, readPosSessionSnapshot } from "../shared/config/posSession";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const session = readPosSessionSnapshot();
  const location = useLocation();
  const [currencySession, setCurrencySession] = useState("");
  const sessionKey = `${session.businessId}:${session.token}`;
  useEffect(() => {
    if (!session.token || !session.businessId) return;
    let active = true;
    new FetchHttpClient(getPosApiBaseUrl()).request<{ MoneyTipe?: string }>({ method: "GET", path: `business/${session.businessId}`, token: session.token })
      .then(business => { if (active && business.MoneyTipe) persistPosCurrency(session.businessId, business.MoneyTipe); })
      .catch(() => undefined)
      .finally(() => { if (active) setCurrencySession(sessionKey); });
    return () => { active = false; };
  }, [session.businessId, session.token, sessionKey]);
  if (!session.token || !session.businessId) {
    return <Navigate to={POS_V2_PATHS.login} replace />;
  }

  if (isSalesOnlyOperator(session.token)) {
    const allowedPaths = new Set<string>([POS_V2_PATHS.sales, POS_V2_PATHS.more, POS_V2_PATHS.printers, POS_V2_PATHS.facturaElectronica, POS_V2_PATHS.settings, POS_V2_PATHS.account, POS_V2_PATHS.deleteAccount, POS_V2_PATHS.currency, POS_V2_PATHS.securityQuestions]);
    if (!allowedPaths.has(location.pathname)) {
      return <Navigate to={POS_V2_PATHS.sales} replace />;
    }
  }

  if (currencySession !== sessionKey) return <p role="status">Cargando negocio…</p>;
  return <>{children}</>;
};
