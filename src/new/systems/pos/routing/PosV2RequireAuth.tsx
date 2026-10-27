import { ReactNode, useEffect, useState } from "react";
import { FetchHttpClient } from "../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../shared/config/posEnv";
import { persistPosCurrency } from "../shared/config/posCurrency";
import { Navigate, useLocation } from "react-router-dom";
import { isSalesOnlyOperator, readPosSessionSnapshot } from "../shared/config/posSession";
import { readPosBusinessFeatures, PosBusinessFeatureResponse } from "../shared/config/posFeatureFlags";
import { POS_BUSINESS_UPDATED_EVENT } from "../shared/config/posSessionRuntime";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const session = readPosSessionSnapshot();
  const location = useLocation();
  const [revision, setRevision] = useState(0);
  const [currencySession, setCurrencySession] = useState("");
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", refresh);
      window.clearInterval(timer);
    };
  }, []);
  const sessionKey = `${session.businessId}:${session.token}`;
  useEffect(() => {
    if (!session.token || !session.businessId) return;
    let active = true;
    new FetchHttpClient(getPosApiBaseUrl()).request<{ MoneyTipe?: string; Plan?: string } & PosBusinessFeatureResponse>({ method: "GET", path: `business/${session.businessId}`, token: session.token })
      .then(business => {
        if (!active) return;
        if (business.MoneyTipe) persistPosCurrency(session.businessId, business.MoneyTipe);
        if (business.Plan) window.localStorage.setItem("plan", business.Plan);
        window.dispatchEvent(new CustomEvent(POS_BUSINESS_UPDATED_EVENT, {detail: readPosBusinessFeatures(business)}));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setCurrencySession(sessionKey); });
    return () => { active = false; };
  }, [session.businessId, session.token, sessionKey, revision]);
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
