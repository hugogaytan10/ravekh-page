import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { POS_V2_PATHS } from "../../routing/PosV2Paths";
import { fetchPosBusinessFeatures } from "../config/posFeatureFlags";
import { readPosSessionSnapshot } from "../config/posSession";
import { getPlanActionRule, hasRequiredPlan, normalizePosPlan, PlanActionRule, PlanProtectedAction, PosPlan } from "../config/posPlanAccess";

type BlockedPlanAction = PlanActionRule & {
  action: PlanProtectedAction;
  currentPlan: PosPlan;
};

const readStoredPlan = (): string => {
  try {
    return window.localStorage.getItem("plan")?.trim() ?? "";
  } catch {
    return "";
  }
};

export const usePlanActionGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingPlanAccess, setCheckingPlanAccess] = useState(false);
  const [resolvedPlan, setResolvedPlan] = useState<PosPlan | null>(null);
  const [blockedAction, setBlockedAction] = useState<BlockedPlanAction | null>(null);

  const resolveCurrentPlan = useCallback(async (): Promise<PosPlan> => {
    if (resolvedPlan) return resolvedPlan;

    const storedPlan = readStoredPlan();
    if (storedPlan) {
      const normalized = normalizePosPlan(storedPlan);
      setResolvedPlan(normalized);
      return normalized;
    }

    const session = readPosSessionSnapshot();
    if (!session.businessId || !session.token) return normalizePosPlan(null);

    setCheckingPlanAccess(true);
    try {
      const features = await fetchPosBusinessFeatures(session.businessId, session.token);
      const normalized = normalizePosPlan(features.plan);
      setResolvedPlan(normalized);
      return normalized;
    } finally {
      setCheckingPlanAccess(false);
    }
  }, [resolvedPlan]);

  const runWithPlanAccess = useCallback(async <T,>(action: PlanProtectedAction, callback: () => T | Promise<T>): Promise<T | undefined> => {
    const rule = getPlanActionRule(action);
    const currentPlan = await resolveCurrentPlan();

    if (hasRequiredPlan(currentPlan, rule.requiredPlan)) {
      return callback();
    }

    setBlockedAction({ action, currentPlan, ...rule });
    return undefined;
  }, [resolveCurrentPlan]);

  const closeBlockedActionModal = useCallback(() => setBlockedAction(null), []);

  const goToUpgradePlan = useCallback(() => {
    if (!blockedAction) return;
    const params = new URLSearchParams({
      requiredPlan: blockedAction.requiredPlan,
      feature: blockedAction.action,
      from: `${location.pathname}${location.search}`,
    });
    setBlockedAction(null);
    navigate(`${POS_V2_PATHS.upgradePlan}?${params.toString()}`);
  }, [blockedAction, location.pathname, location.search, navigate]);

  return { runWithPlanAccess, blockedAction, closeBlockedActionModal, goToUpgradePlan, checkingPlanAccess };
};
