import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredPosRoutingMode, PosRoutingMode, savePosRoutingMode } from "./PosRoutingMode";

const LEGACY_ENTRY = "/MainSales";
const MODERN_ENTRY = "/v2/pos/products";

const parseMode = (raw: string | null): PosRoutingMode | null => {
  if (raw === "legacy" || raw === "modern") {
    return raw;
  }

  return null;
};

export const PosModeEntryPage = () => {
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const queryMode = parseMode(new URLSearchParams(location.search).get("mode"));
    const mode = queryMode ?? getStoredPosRoutingMode();

    savePosRoutingMode(mode);

    return mode === "legacy" ? LEGACY_ENTRY : MODERN_ENTRY;
  }, [location.search]);

  return <Navigate to={redirectPath} replace />;
};
