import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchPosBusinessFeatures, isPosFeatureBlocked, POS_FEATURES_UNKNOWN, PosBusinessFeatures } from "../shared/config/posFeatureFlags";
import { readPosSessionSnapshot } from "../shared/config/posSession";
import { POS_V2_PATHS } from "./PosV2Paths";

type PosV2FeatureRouteGuardProps = {
  children: ReactNode;
  feature: keyof PosBusinessFeatures;
  fallbackPath?: string;
};

export const PosV2FeatureRouteGuard = ({ children, feature, fallbackPath = POS_V2_PATHS.products }: PosV2FeatureRouteGuardProps) => {
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
  if (isPosFeatureBlocked(features[feature])) return <Navigate to={fallbackPath} replace />;

  return <>{children}</>;
};
