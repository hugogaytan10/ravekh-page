import {
  privacyPolicyAgendaModel,
  privacyPolicyPosModel,
} from "../model/privacyPolicies";

const POLICY_BY_PRODUCT = {
  pos: privacyPolicyPosModel,
  agenda: privacyPolicyAgendaModel,
};

export const getPrivacyPolicySections = (product) => {
  return POLICY_BY_PRODUCT[product] ?? privacyPolicyPosModel;
};
