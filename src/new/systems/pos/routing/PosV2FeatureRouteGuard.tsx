import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchPosBusinessFeatures, isPosFeatureBlocked, isPosModuleBlocked, POS_FEATURES_UNKNOWN, PosBusinessFeatures, PosFeatureKey } from "../shared/config/posFeatureFlags";
import { readPosSessionSnapshot } from "../shared/config/posSession";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2FeatureRouteGuardProps = {
  children: ReactNode;
  feature: PosFeatureKey;
  fallbackPath?: string;
  mode?: "redirect" | "upgrade-screen";
};

export const PosV2FeatureRouteGuard = ({ children, feature, fallbackPath = POS_V2_PATHS.products, mode = "redirect" }: PosV2FeatureRouteGuardProps) => {
  const location = useLocation();
  const [features, setFeatures] = useState<PosBusinessFeatures | null>(null);

  useEffect(() => {
    const session = readPosSessionSnapshot();
    if (!session.token || !session.businessId) {
      setFeatures(POS_FEATURES_UNKNOWN);
      return;
    }

    let cancelled = false;
    fetchPosBusinessFeatures(session.businessId, session.token)
      .then((nextFeatures) => {
        if (!cancelled) setFeatures(nextFeatures);
      })
      .catch(() => {
        if (!cancelled) setFeatures(POS_FEATURES_UNKNOWN);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!features) return null;
  if (feature === "pos" ? isPosModuleBlocked(features) : isPosFeatureBlocked(features[feature])) {
    if (mode === "upgrade-screen") {
      const params = new URLSearchParams({ requiredPlan: "START", feature, from: `${location.pathname}${location.search}` });
      return <Navigate to={`${POS_V2_PATHS.upgradePlan}?${params.toString()}`} replace />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
