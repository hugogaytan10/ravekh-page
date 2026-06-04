import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearPosSessionSnapshot, isSalesOnlyOperator, readPosSessionSnapshot, storePendingPosUpgradeContext } from "../shared/config/posSession";
import { fetchPosBusinessFeatures, isOfflinePosPlan } from "../shared/config/posFeatureFlags";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2RequireAuthProps = {
  children: ReactNode;
};

export const PosV2RequireAuth = ({ children }: PosV2RequireAuthProps) => {
  const session = readPosSessionSnapshot();
  const location = useLocation();
  const [offlinePlan, setOfflinePlan] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(Boolean(session.token && session.businessId));

  useEffect(() => {
    if (!session.token || !session.businessId) {
      clearPosSessionSnapshot();
      setCheckingPlan(false);
      return;
    }

    if (isOfflinePosPlan(window.localStorage.getItem("plan"))) {
      storePendingPosUpgradeContext(session);
      clearPosSessionSnapshot();
      setOfflinePlan(true);
      setCheckingPlan(false);
      return;
    }

    let cancelled = false;
    fetchPosBusinessFeatures(session.businessId, session.token)
      .then((features) => {
        if (cancelled || !isOfflinePosPlan(features.plan)) return;
        storePendingPosUpgradeContext(session);
        clearPosSessionSnapshot();
        setOfflinePlan(true);
      })
      .catch(() => {
        if (!cancelled) setCheckingPlan(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingPlan(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session.businessId, session.token]);

  if (offlinePlan) {
    return <Navigate to={`${POS_V2_PATHS.login}?reason=offline`} replace />;
  }

  if (!session.token || !session.businessId) {
    return <Navigate to={POS_V2_PATHS.login} replace />;
  }

  if (checkingPlan) return null;

  if (isSalesOnlyOperator(session.token)) {
    const allowedPaths = new Set([POS_V2_PATHS.sales, POS_V2_PATHS.more, POS_V2_PATHS.printers, POS_V2_PATHS.facturaElectronica]);
    if (!allowedPaths.has(location.pathname)) {
      return <Navigate to={POS_V2_PATHS.sales} replace />;
    }
  }

  return <>{children}</>;
};
