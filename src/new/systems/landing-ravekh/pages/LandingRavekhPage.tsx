import React from "react";
import { LandingPage } from "../../../../Components/LandingPage/LandingPage";

/**
 * Transitional composition for the new landing system.
 *
 * Goal: keep the exact same visual output as the legacy "/" route,
 * while routing ownership migrates into `src/new/systems/landing-ravekh`.
 */
export const LandingRavekhPage = () => {
  return <LandingPage />;
};
