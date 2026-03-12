import { BannerSection } from "../interface/sections/BannerSection";
import { BannerSecondarySection } from "../interface/sections/BannerSecondarySection";
import { ContentSection } from "../interface/sections/ContentSection";
import { WireframeSection } from "../interface/sections/WireframeSection";
import { DesignSection } from "../interface/sections/DesignSection";
import { DevelopmentSection } from "../interface/sections/DevelopmentSection";
import { FeaturesSection } from "../interface/sections/FeaturesSection";
import { ShowcaseSection } from "../interface/sections/ShowcaseSection";
import { PackagesSection } from "../interface/sections/PackagesSection";
import { ContactSection } from "../interface/sections/ContactSection";
import { FooterSection } from "../interface/sections/FooterSection";

export const landingSectionsModel = [
  { id: "banner", endColor: "109,1,209", bgClassName: "bg-[#6d01d1]", Component: BannerSection },
  {
    id: "banner-secundario",
    endColor: "78,10,148",
    bgClassName: "bg-[#4e0a94]",
    Component: BannerSecondarySection,
  },
  { id: "contenido", endColor: "250,171,171", bgClassName: "bg-[#faabab]", Component: ContentSection },
  { id: "wireframe", endColor: "124,204,190", bgClassName: "bg-[#7cccbc]", Component: WireframeSection },
  { id: "design", endColor: "151,194,217", bgClassName: "bg-[#97c2d9]", Component: DesignSection },
  {
    id: "desarrollo",
    endColor: "177,192,203",
    bgClassName: "bg-[#b1c0cb]",
    Component: DevelopmentSection,
  },
  { id: "caracteristicas", endColor: "0,0,0", bgClassName: "bg-black", Component: FeaturesSection },
  { id: "muestra", endColor: "41,53,65", bgClassName: "bg-[#293541]", minHeightClassName: "min-h-screen", Component: ShowcaseSection },
  {
    id: "paquetes",
    endColor: "31,41,55",
    bgClassName: "bg-slate-800",
    minHeightClassName: "min-h-screen",
    Component: PackagesSection,
  },
  { id: "contacto", endColor: "30,30,30", bgClassName: "bg-[#1e1e1e]", Component: ContactSection },
  { id: "footer", endColor: null, bgClassName: "bg-black", Component: FooterSection },
];
