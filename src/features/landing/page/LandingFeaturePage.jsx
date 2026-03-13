import { useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLandingStatusBar } from "../hooks/useLandingStatusBar";
import { LandingSections } from "../interface/LandingSections";
import { FloatingWhatsAppButton } from "../interface/FloatingWhatsAppButton";
import { landingSectionsModel } from "../model/landingSections";
import "../interface/styles/landingPage.css";

export const LandingFeaturePage = () => {
  const containerRef = useRef(null);
  const statusBarColor = useLandingStatusBar(containerRef);

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content={statusBarColor} />
      </Helmet>

      <div
        ref={containerRef}
        className="h-screen flex flex-col overflow-y-scroll  snap-y snap-mandatory scrollbar-hidden"
      >
        <LandingSections sections={landingSectionsModel} />
        <FloatingWhatsAppButton />
      </div>
    </HelmetProvider>
  );
};
