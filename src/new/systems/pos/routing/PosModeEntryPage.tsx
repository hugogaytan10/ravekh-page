import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredPosRoutingMode, PosRoutingMode, savePosRoutingMode } from "./PosRoutingMode";
import { POS_V2_PATHS } from "./PosV2Paths";

const MODERN_ENTRY = POS_V2_PATHS.login;

const parseMode = (raw: string | null): PosRoutingMode | null => {
  return raw === "modern" ? "modern" : null;
};

export const PosModeEntryPage = () => {
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const queryMode = parseMode(new URLSearchParams(location.search).get("mode"));
    const mode = queryMode ?? getStoredPosRoutingMode();

    savePosRoutingMode(mode);

    return MODERN_ENTRY;
  }, [location.search]);

  return <Navigate to={redirectPath} replace />;
};
