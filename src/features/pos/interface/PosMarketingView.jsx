import HeroSection from "../../../Components/RavekhPos/components/HeroSection";
import FeaturesSection from "../../../Components/RavekhPos/components/FeaturesSection";
import InventorySection from "../../../Components/RavekhPos/components/InventorySection";
import ReportsSection from "../../../Components/RavekhPos/components/ReportsSection";
import OnlineShopSection from "../../../Components/RavekhPos/components/OnlineShopSection";
import LoyaltySection from "../../../Components/RavekhPos/components/LoyaltySection";
import PricingSection from "../../../Components/RavekhPos/components/PricingSection";
import TestimonialsSection from "../../../Components/RavekhPos/components/TestimonialsSection";
import Footer from "../../../Components/RavekhPos/components/Footer";
import { Contacto } from "../../../Components/Contacto/Contacto";
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
        <Contacto catalogo />
      </section>
      <Footer />
    </div>
  );
};
