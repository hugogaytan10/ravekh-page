import {useEffect, useState} from "react";
import {fetchPosBusinessFeatures} from "../config/posFeatureFlags";
import {hasRequiredPlan, normalizePosPlan} from "../config/posPlanAccess";

export const mexicoReportDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"}).format(date);

export function useDayOnlyReports(businessId: number, token: string) {
  const [dayOnly, setDayOnly] = useState(true);
  useEffect(() => {
    setDayOnly(true);
    if (!businessId || !token) return;
    let active = true;
    void fetchPosBusinessFeatures(businessId, token)
      .then(features => {
        if (active) setDayOnly(!hasRequiredPlan(normalizePosPlan(features.plan), "START"));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [businessId, token]);
  return dayOnly;
}
