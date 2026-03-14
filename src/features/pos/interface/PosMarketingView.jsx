import {
  HeroSection,
  FeaturesSection,
  InventorySection,
  ReportsSection,
  OnlineShopSection,
  LoyaltySection,
  PricingSection,
  TestimonialsSection,
  Footer,
} from "../../../legacy/pos/marketing";
import { ContactPage } from "../../contact";
import { posMarketingNavigationItems } from "../model/posMarketingNavigation";
import { usePosMarketingNavigation } from "../hooks/usePosMarketingNavigation";
import { PosMarketingNavbar } from "./marketing/PosMarketingNavbar";

export const PosMarketingView = () => {
  const { isMenuOpen, activeSection, setIsMenuOpen, handleNavigateTo } =
    usePosMarketingNavigation(posMarketingNavigationItems);

  return (
    <div className="bg-white">
      <PosMarketingNavbar
        items={posMarketingNavigationItems}
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={handleNavigateTo}
      />

      <section id="inicio">
        <HeroSection />
      </section>
      <section id="funciones">
        <FeaturesSection />
      </section>
      <section id="inventario">
        <InventorySection />
      </section>
      <section id="reportes">
        <ReportsSection />
      </section>
      <section id="tienda-online">
        <OnlineShopSection />
      </section>
      <section id="lealtad">
        <LoyaltySection />
      </section>
      <section id="precios">
        <PricingSection />
      </section>
      <section id="testimonios">
        <TestimonialsSection />
      </section>
      <section id="contacto">
        <ContactPage catalogo />
      </section>
      <Footer />
    </div>
  );
};
