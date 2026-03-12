import React from "react";
import { usePrivacyPolicyContent } from "../hooks/usePrivacyPolicyContent";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";

export const PrivacyPolicyAgendaPage = () => {
  const policy = usePrivacyPolicyContent("agenda");

  return <PrivacyPolicyPage title={policy.title} sections={policy.sections} />;
};
