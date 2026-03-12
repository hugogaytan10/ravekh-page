import React from "react";
import { usePrivacyPolicyContent } from "../hooks/usePrivacyPolicyContent";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";

export const PrivacyPolicyPosPage = () => {
  const policy = usePrivacyPolicyContent("pos");

  return <PrivacyPolicyPage title={policy.title} sections={policy.sections} />;
};
