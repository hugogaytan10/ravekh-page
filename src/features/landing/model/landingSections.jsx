import { Banner } from "../../../Components/Banner/Banner";
import { BannerSecundario } from "../../../Components/BannerSecundario/BannerSecundario";
import { Contenido } from "../../../Components/Contenido/Contenido";
import { Wireframe } from "../../../Components/Wireframe/Wireframe";
import { Design } from "../../../Components/Design/Design";
import { Desarrollo } from "../../../Components/Desarrollo/Desarrollo";
import { Caracteristicas } from "../../../Components/Caracteristicas/Caracteristicas";
import { Contacto } from "../../../Components/Contacto/Contacto";
import { Footer } from "../../../Components/Footer/Footer";

export const landingSectionsModel = [
  { id: "banner", endColor: "109,1,209", Component: Banner },
  { id: "banner-secundario", endColor: "78,10,148", Component: BannerSecundario },
  { id: "contenido", endColor: "250,171,171", Component: Contenido },
  { id: "wireframe", endColor: "124,204,190", Component: Wireframe },
  { id: "design", endColor: "151,194,217", Component: Design },
  { id: "desarrollo", endColor: "177,192,203", Component: Desarrollo },
  { id: "caracteristicas", endColor: "0,0,0", Component: Caracteristicas },
  {
    id: "contacto",
    endColor: "30,30,30",
    Component: function ContactSection() {
      return <Contacto catalogo={false} />;
    },
  },
  { id: "footer", endColor: null, Component: Footer },
];
