import { useMemo } from "react";
import { getPrivacyPolicySections } from "../service/getPrivacyPolicySections";

export const usePrivacyPolicyContent = (product) => {
  return useMemo(() => getPrivacyPolicySections(product), [product]);
};
