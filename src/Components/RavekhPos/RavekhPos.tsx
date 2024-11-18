import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import Footer from "./components/Footer";
import PricingSection from "./components/PricingSection";
import { Contacto } from "../Contacto/Contacto";
import InventorySection from "./components/InventorySection";
import ReportsSection from "./components/ReportsSection";
import OnlineShopSection from "./components/OnlineShopSection";

export const RavekhPos: React.FC = () => {
  return (
    <div>
      {/*<Navbar />*/}
      <HeroSection />
      <FeaturesSection />
      <InventorySection />
      <ReportsSection />
      <OnlineShopSection />
      <PricingSection />
      <TestimonialsSection />
      <Contacto catalogo={true} />
      <Footer />
    </div>
  );
};
