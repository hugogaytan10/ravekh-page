import {
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FreeCatalogLoginModal } from "../components/FreeCatalogLoginModal";
import { POS_SESSION_STORAGE_KEYS } from "../../pos/shared/config/posSession";
import { FeatureUnlockModal, type UnlockPlanKey } from "../../pos/shared/ui/FeatureUnlockModal";
import "./MainCatalogPage.css";
import { trackMetaEvent, trackMetaCustomEvent } from "../../../../../scripts/metaPixel";

const WHATSAPP_PHONE = "5653989702";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;
const CONTACT_HASH = "#planes";
const LEAD_FORM_HASH = "#solicitar-catalogo";
const LOGIN_POS_PATH = "/login-punto-venta";
const MAIN_SALES_PATH = "/MainSales";
const FREE_CATALOG_PLAN_NAME = "Catálogo Gratuito";

type CardItem = {
  icon: ReactNode;
  title: string;
  text: string;
  href?: string;
};

type BillingCycle = "monthly" | "annual";

type Plan = {
  name: string;
  prices: Record<BillingCycle, string>;
  periodLabel: Record<BillingCycle, string>;
  limit: string;
  benefits: string[];
  recommended?: boolean;
  annualNote?: string;
  checkoutPlanKey?: UnlockPlanKey;
};

type CatalogCheckoutPlan = {
  name: string;
  amount: number;
  plan: UnlockPlanKey;
};

const IconSvg = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

const LinkIcon = () => (
  <IconSvg>
    <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
  </IconSvg>
);

const ImageIcon = () => (
  <IconSvg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <path d="M21 16l-5-5L5 19" />
  </IconSvg>
);

const TagIcon = () => (
  <IconSvg>
    <path d="M20 12l-8 8-9-9V4h7l10 8Z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </IconSvg>
);

const ChatIcon = () => (
  <IconSvg>
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-5A8 8 0 1 1 21 12Z" />
  </IconSvg>
);

const PhoneIcon = () => (
  <IconSvg>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </IconSvg>
);

const ChartIcon = () => (
  <IconSvg>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 16v-5" />
    <path d="M12 16V8" />
    <path d="M16 16v-3" />
  </IconSvg>
);

const EyeIcon = () => (
  <IconSvg>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </IconSvg>
);

const StarIcon = () => (
  <IconSvg>
    <path d="M12 2l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.9 3 1.1-6.5L2.5 8.9 9 8l3-6Z" />
  </IconSvg>
);

const MegaphoneIcon = () => (
  <IconSvg>
    <path d="M3 11v2a2 2 0 0 0 2 2h3l8 4V5l-8 4H5a2 2 0 0 0-2 2Z" />
    <path d="M19 9a4 4 0 0 1 0 6" />
  </IconSvg>
);

const LightbulbIcon = () => (
  <IconSvg>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M8 14a6 6 0 1 1 8 0c-.8.7-1 1.6-1 3H9c0-1.4-.2-2.3-1-3Z" />
  </IconSvg>
);

const BagIcon = () => (
  <IconSvg>
    <path d="M6 8h12l-1 13H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </IconSvg>
);

const ToolIcon = () => (
  <IconSvg>
    <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 3-3-3 3-3Z" />
  </IconSvg>
);

const BottleIcon = () => (
  <IconSvg>
    <path d="M10 2h4v4l2 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-2V2Z" />
    <path d="M9 12h6" />
  </IconSvg>
);

const UtensilsIcon = () => (
  <IconSvg>
    <path d="M4 3v8" />
    <path d="M7 3v8" />
    <path d="M4 7h3" />
    <path d="M5.5 11v10" />
    <path d="M15 3v18" />
    <path d="M15 3c3 2 4 5 4 8h-4" />
  </IconSvg>
);

const BalloonIcon = () => (
  <IconSvg>
    <path d="M12 3a6 6 0 0 0-3 11.2L8 17h8l-1-2.8A6 6 0 0 0 12 3Z" />
    <path d="M12 17v5" />
  </IconSvg>
);

const GlassesIcon = () => (
  <IconSvg>
    <circle cx="7" cy="14" r="4" />
    <circle cx="17" cy="14" r="4" />
    <path d="M11 14h2" />
    <path d="M3 14l1-6" />
    <path d="M21 14l-1-6" />
  </IconSvg>
);

const CartIcon = () => (
  <IconSvg>
    <path d="M3 3h2l2 12h11l2-8H6" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </IconSvg>
);

const GiftIcon = () => (
  <IconSvg>
    <path d="M20 12v8H4v-8" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 7v13" />
    <path d="M12 7H8a2 2 0 1 1 4 0Z" />
    <path d="M12 7h4a2 2 0 1 0-4 0Z" />
  </IconSvg>
);

const CheckCircleIcon = () => (
  <IconSvg>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l2.5 2.5L16 9" />
  </IconSvg>
);

const SparkleIcon = () => (
  <IconSvg>
    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />
    <path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" />
  </IconSvg>
);

const RocketIcon = () => (
  <IconSvg>
    <path d="M12 15l-3-3c1-5 4-8 10-9-1 6-4 9-9 10Z" />
    <path d="M9 12l-4 4" />
    <path d="M14 17l-4 4" />
    <path d="M5 19l-1 3 3-1" />
    <circle cx="16" cy="8" r="1" />
  </IconSvg>
);

const quickBenefits: CardItem[] = [
  {
    icon: "🔗",
    title: "Link profesional",
    text: "Comparte un catálogo online con una liga clara para WhatsApp, redes y clientes frecuentes.",
  },
  {
    icon: "🗂️",
    title: "Productos organizados",
    text: "Agrupa fotos, precios, descripciones y categorías en una experiencia fácil de revisar.",
  },
  {
    icon: "💬",
    title: "Pedidos más claros",
    text: "Tus clientes llegan a WhatsApp con más contexto y menos dudas repetidas.",
  },
  {
    icon: "⚡",
    title: "Actualización fácil",
    text: "Mantén tu link de productos al día sin reenviar fotos una por una.",
  },
];

const beforeItems = [
  "Fotos sueltas",
  "Precios desactualizados",
  "Clientes preguntando lo mismo",
  "Pedidos desordenados",
];
const afterItems = [
  "Catálogo con link",
  "Productos actualizados",
  "Cliente elige más fácil",
  "Pedido más claro por WhatsApp",
];

const features: CardItem[] = [
  {
    icon: <LinkIcon />,
    title: "Catálogo compartible por link",
    text: "Un solo enlace para mostrar tus productos en WhatsApp, Instagram, Facebook o Google Business.",
  },
  {
    icon: <ImageIcon />,
    title: "Foto, precio y descripción",
    text: "Presenta cada producto con la información que tu cliente necesita para decidir más rápido.",
  },
  {
    icon: <TagIcon />,
    title: "Categorías organizadas",
    text: "Ordena tu catálogo digital para que encontrar productos sea simple desde celular.",
  },
  {
    icon: <ChatIcon />,
    title: "Botón directo a WhatsApp",
    text: "Convierte la intención en conversación con un CTA claro para pedir o resolver dudas.",
  },
  {
    icon: <PhoneIcon />,
    title: "Diseño adaptable a celular",
    text: "Una tienda en línea simple, rápida y cómoda para clientes que compran desde móvil.",
  },
  {
    icon: <ChartIcon />,
    title: "Métricas de interés",
    text: "Detecta qué productos se ven más para tomar mejores decisiones comerciales.",
  },
];

const steps = [
  "Compartes tu link.",
  "El cliente ve tu catálogo.",
  "Elige productos.",
  "Te contacta por WhatsApp con más claridad.",
];

const metrics: CardItem[] = [
  {
    icon: <EyeIcon />,
    title: "Visitas al catálogo",
    text: "Identifica cuándo y cuánto están consultando tus productos.",
  },
  {
    icon: <StarIcon />,
    title: "Productos más vistos",
    text: "Detecta tus artículos con mayor interés para promoverlos mejor.",
  },
  {
    icon: <MegaphoneIcon />,
    title: "Productos más compartidos",
    text: "Conoce qué productos se mueven mejor entre clientes y redes.",
  },
  {
    icon: <LightbulbIcon />,
    title: "Interés de tus clientes",
    text: "Usa señales simples para ajustar precios, stock y comunicación.",
  },
];

const businessTypes: CardItem[] = [
  {
    icon: <BagIcon />,
    title: "Ropa y calzado",
    text: "Tallas, estilos y temporadas en un solo lugar.",
    href: "/ravekhBoutique",
  },
  {
    icon: <ToolIcon />,
    title: "Refacciones",
    text: "Muestra piezas y variantes sin perder conversaciones.",
    href: "/RavekhRefacciones",
  },
  {
    icon: <BottleIcon />,
    title: "Perfumes",
    text: "Organiza aromas, presentaciones y promociones.",
    href: "/RavekhPerfumeria",
  },
  {
    icon: <UtensilsIcon />,
    title: "Comida",
    text: "Comparte menús, combos y productos por temporada.",
  },
  {
    icon: <BalloonIcon />,
    title: "Inflables",
    text: "Presenta paquetes, medidas y opciones disponibles.",
  },
  {
    icon: <GlassesIcon />,
    title: "Accesorios",
    text: "Haz que tu cliente explore modelos sin pedir foto por foto.",
  },
  {
    icon: <CartIcon />,
    title: "Abarrotes",
    text: "Ordena productos de alta rotación para pedidos más rápidos.",
  },
  {
    icon: <GiftIcon />,
    title: "Catálogos por temporada",
    text: "Lanza colecciones, promociones o campañas especiales.",
  },
];

const differentiators: CardItem[] = [
  {
    icon: <CheckCircleIcon />,
    title: "Simple para el negocio",
    text: "No necesitas operar una tienda enorme para empezar a vender con una presentación profesional.",
  },
  {
    icon: <SparkleIcon />,
    title: "Claro para el cliente",
    text: "Tus productos se ven ordenados, rápidos y listos para iniciar una conversación de compra.",
  },
  {
    icon: <RocketIcon />,
    title: "Preparado para crecer",
    text: "Cuando tu operación avance, puedes conectar mejores procesos de venta, POS y fidelidad.",
  },
];

const billingCycleCopy: Record<
  BillingCycle,
  { label: string; helper: string }
> = {
  monthly: {
    label: "Mensual",
    helper: "Paga mes a mes y cambia de plan cuando tu negocio lo necesite.",
  },
  annual: {
    label: "Anual",
    helper: "Paga una vez al año y deja tu catálogo cubierto por 12 meses.",
  },
};

const plans: Plan[] = [
  {
    name: FREE_CATALOG_PLAN_NAME,
    prices: { monthly: "0.00 MXN", annual: "0.00 MXN" },
    periodLabel: { monthly: "Gratis", annual: "Gratis" },
    limit: "Límite de productos/fotos editable",
    benefits: [
      "Link de catálogo",
      "1 Imagen por producto",
      "50 Visitas al mes por catálogo",
      "Sin acceso a impuesto por venta",
      "Guardado 100% offline",
    ],
  },
  {
    name: "Catálogo Básico",
    prices: { monthly: "299.00 MXN", annual: "2,988.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Perfecto para empezar con un catálogo simple",
    benefits: [
      "Importación masiva",
      "Acceso a reportes",
      "Productos Ilimitados 1 imagen por producto",
      "Sincronización en la nube",
    ],
    recommended: true,
    annualNote: "Equivale a $249 MXN al mes",
    checkoutPlanKey: "START",
  },
  {
    name: "Catálogo Intermedio",
    prices: { monthly: "599.00 MXN", annual: "5,988.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Para negocios con más variedad de productos",
    benefits: [
      "Todo lo del plan Básico",
      "Mayor capacidad de productos",
      "Mejor seguimiento comercial",
      "Preparado para crecer a POS",
    ],
    annualNote: "Equivale a $499 MXN al mes",
    checkoutPlanKey: "PRO",
  },
  {
    name: "Catálogo Pro",
    prices: { monthly: "1299.00 MXN", annual: "13,788.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Límite de productos/fotos editable",
    benefits: [
      "Todo lo del plan Intermedio",
      "Capacidad de productos personalizada",
      "Soporte prioritario",
      "100 Facturas timbradas al mes ante el SAT",
    ],
    annualNote: "Equivale a $1,149 MXN al mes",
    checkoutPlanKey: "MAX",
  },
];


const parsePlanAmount = (price: string) => {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

const buildCatalogCheckoutPlan = (plan: Plan, billingCycle: BillingCycle): CatalogCheckoutPlan | null => {
  if (!plan.checkoutPlanKey) {
    return null;
  }

  return {
    name: plan.name,
    amount: parsePlanAmount(plan.prices[billingCycle]),
    plan: plan.checkoutPlanKey,
  };
};

const testimonials = [
  {
    quote:
      "Ahora mis clientes ven todo en un solo link y me preguntan menos por precios.",
    business: "As Perfumeria",
    logoUrl:
      "https://res.cloudinary.com/ravekh/image/upload/v1778857844/ravekh-fotos/hwo8yhdacmg92cxhmjcb.jpg",
    logoAlt: "As Perfumeria",
  },
  {
    quote:
      "Me ayudó a ordenar mis productos y compartirlos más rápido por WhatsApp.",
    business: "Óptica Bicentenario",
    logoUrl:
      "https://res.cloudinary.com/ravekh/image/upload/v1778874056/ravekh-fotos/gx700ycd7uh6qvbxhvp5.jpg",
    logoAlt: "Óptica Bicentenario",
  },
  {
    quote:
      "El catálogo se siente más profesional que mandar muchas fotos sueltas.",
    business: "DIABLITA SEXSHOP 😈🔥",
    logoUrl:
      "https://res.cloudinary.com/dban2urdk/image/upload/v1780428838/jfc5ozxjietcmcfe6ol9.jpg",
    logoAlt: "DIABLITA SEXSHOP 😈🔥",
  },
];

const faqs = [
  {
    question: "¿Necesito página web para usar el catálogo?",
    answer:
      "No. Ravekh te da un catálogo digital con link para compartirlo sin construir una página web completa.",
  },
  {
    question: "¿Mis clientes tienen que descargar una app?",
    answer:
      "No. Tus clientes abren el catálogo online desde el navegador de su celular o computadora.",
  },
  {
    question: "¿Puedo compartirlo por WhatsApp?",
    answer:
      "Sí. Está pensado para vender por WhatsApp, redes sociales y atención directa con menos fricción.",
  },
  {
    question: "¿Puedo actualizar mis productos?",
    answer:
      "Sí. La idea es que tu catálogo para negocios se mantenga ordenado y actualizado desde un solo lugar.",
  },
  {
    question: "¿Sirve para negocios pequeños?",
    answer:
      "Sí. Es ideal para empezar con una tienda en línea simple antes de invertir en procesos más complejos.",
  },
  {
    question: "¿Puedo crecer después a POS o fidelidad?",
    answer:
      "Sí. Ravekh puede acompañarte con soluciones para punto de venta, operación y fidelización cuando lo necesites.",
  },
];

const products = [
  { name: "Producto destacado", price: "$---", tone: "pink" },
  { name: "Nueva colección", price: "$---", tone: "purple" },
  { name: "Más vendido", price: "$---", tone: "blue" },
];

const scrollToId = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  document
    .querySelector(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const buildLeadWhatsAppUrl = (businessName: string, businessLine: string) => {
  const message = [
    "Hola, quiero información para crear mi catálogo digital en Ravekh.",
    "",
    `Nombre del negocio: ${businessName.trim() || "Por definir"}`,
    `Giro / qué vende: ${businessLine.trim() || "Por definir"}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M16.04 3C8.86 3 3.02 8.73 3.02 15.78c0 2.25.6 4.45 1.74 6.38L3 29l7.03-1.8a13.17 13.17 0 0 0 6.01 1.47c7.18 0 13.02-5.73 13.02-12.78C29.06 8.73 23.22 3 16.04 3Zm0 23.5c-1.86 0-3.68-.49-5.27-1.42l-.38-.22-4.17 1.07 1.11-4.02-.25-.4a10.39 10.39 0 0 1-1.6-5.55c0-5.84 4.84-10.6 10.78-10.6s10.78 4.76 10.78 10.6-5.06 10.54-11 10.54Zm5.9-7.92c-.32-.16-1.9-.92-2.2-1.03-.3-.1-.52-.16-.74.16-.22.32-.85 1.03-1.04 1.24-.19.22-.38.24-.7.08-.32-.16-1.36-.49-2.6-1.56-.96-.84-1.6-1.88-1.8-2.2-.18-.32-.02-.5.14-.65.14-.14.32-.38.49-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.65-.54-.54-.74-.55h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.1-1.14 2.67s1.17 3.1 1.33 3.31c.16.22 2.3 3.45 5.57 4.84.78.33 1.39.52 1.86.67.78.24 1.49.2 2.05.12.63-.09 1.9-.76 2.17-1.5.27-.73.27-1.35.19-1.5-.08-.13-.3-.21-.62-.37Z"
    />
  </svg>
);

const BenefitCard = ({ icon, title, text }: CardItem) => (
  <article className="main-catalog-card main-catalog-benefit-card">
    <span className="main-catalog-icon" aria-hidden="true">
      {icon}
    </span>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
);

const FeatureCard = ({ icon, title, text, href }: CardItem) => {
  const content = (
    <>
      <span className="main-catalog-icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </>
  );

  if (href) {
    return (
      <Link className="main-catalog-card main-catalog-feature-card main-catalog-card--link" to={href}>
        {content}
      </Link>
    );
  }

  return <article className="main-catalog-card main-catalog-feature-card">{content}</article>;
};

const CatalogMockup = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`catalog-phone ${compact ? "catalog-phone--compact" : ""}`}
    aria-label="Mockup de catálogo digital Ravekh"
    role="img"
  >
    <div className="catalog-phone__speaker" />
    <div className="catalog-phone__screen">
      <header className="catalog-phone__header">
        <div>
          <strong>Ravekh</strong>
          <span>Catálogo online</span>
        </div>
        <span className="catalog-phone__badge">Abierto</span>
      </header>
      <div className="catalog-phone__search">Buscar producto...</div>
      <div className="catalog-phone__chips" aria-hidden="true">
        <span>Todo</span>
        <span>Favoritos</span>
        <span>Nuevo</span>
      </div>
      <div className="catalog-phone__products">
        {products.map((product) => (
          <div className="catalog-phone__product" key={product.name}>
            <div
              className={`catalog-phone__image catalog-phone__image--${product.tone}`}
            />
            <div>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </div>
          </div>
        ))}
      </div>
      <a
        className="catalog-phone__button"
        href={WHATSAPP_URL}
        aria-label="Pedir por WhatsApp desde el catálogo"
      >
        Pedir por WhatsApp
      </a>
    </div>
  </div>
);

const CatalogHero = () => (
  <section className="main-catalog-hero" id="inicio">
    <div className="main-catalog-container main-catalog-hero__grid">
      <div className="main-catalog-hero__content">
        <span className="main-catalog-eyebrow">
          Catálogo digital para negocios en México
        </span>
        <h1>Tu catálogo digital listo para vender por WhatsApp</h1>
        <p className="main-catalog-lead">
          Organiza tus productos, comparte un solo link y deja de mandar fotos
          una por una. Ravekh convierte tu catálogo en una experiencia rápida,
          clara y profesional para tus clientes.
        </p>
        <div className="main-catalog-actions">
          <a
            className="main-catalog-button main-catalog-button--primary"
            href={CONTACT_HASH}
            onClick={scrollToId(CONTACT_HASH)}
            aria-label="Ir a los planes de catálogo digital"
          >
            Quiero mi catálogo
          </a>
          <a
            className="main-catalog-button main-catalog-button--secondary"
            href="#como-funciona"
            onClick={scrollToId("#como-funciona")}
            aria-label="Ver cómo funciona el catálogo digital Ravekh"
          >
            Ver cómo funciona
          </a>
        </div>
        <p className="main-catalog-microcopy">
          Pensado para negocios que venden por WhatsApp, redes sociales y
          atención directa.
        </p>
      </div>
      <div className="main-catalog-hero__visual" aria-hidden="true">
        <div className="main-catalog-desktop-mockup">
          <div className="main-catalog-window-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="main-catalog-dashboard-grid">
            <div className="main-catalog-dashboard-panel main-catalog-dashboard-panel--wide" />
            <div className="main-catalog-dashboard-panel" />
            <div className="main-catalog-dashboard-panel" />
          </div>
        </div>
        <CatalogMockup />
        <div className="main-catalog-floating-card main-catalog-floating-card--one">
          💬 Pedido recibido por WhatsApp
        </div>
        <div className="main-catalog-floating-card main-catalog-floating-card--two">
          ⚡ Productos actualizados
        </div>
        <div className="main-catalog-floating-card main-catalog-floating-card--three">
          🔗 Link listo para compartir
        </div>
      </div>
    </div>
  </section>
);

const ComparisonSection = () => (
  <section className="main-catalog-section main-catalog-section--soft">
    <div className="main-catalog-container main-catalog-split">
      <div>
        <span className="main-catalog-eyebrow">El problema</span>
        <h2>Mandar fotos por WhatsApp ya no escala</h2>
        <p>
          Cuando tu negocio crece, responder lo mismo, buscar fotos, confirmar
          precios y reenviar productos se vuelve lento. Tus clientes quieren ver
          todo rápido, claro y desde su celular.
        </p>
      </div>
      <div
        className="main-catalog-comparison"
        aria-label="Comparación antes y después de usar Ravekh"
      >
        <article className="main-catalog-compare-card main-catalog-compare-card--before">
          <h3>Antes</h3>
          <ul>
            {beforeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="main-catalog-compare-card main-catalog-compare-card--after">
          <h3>Después con Ravekh</h3>
          <ul>
            {afterItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  </section>
);

const MetricsSection = () => (
  <section className="main-catalog-section main-catalog-section--gradient">
    <div className="main-catalog-container">
      <div className="main-catalog-section-heading main-catalog-section-heading--center">
        <span className="main-catalog-eyebrow">Métricas simples</span>
        <h2>Controla lo que pasa en tu catálogo</h2>
        <p>
          No se trata solo de tener productos online. Se trata de saber qué está
          funcionando.
        </p>
      </div>
      <div className="main-catalog-grid main-catalog-grid--four">
        {metrics.map((metric) => (
          <FeatureCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  </section>
);

const PricingSection = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const activeBilling = billingCycleCopy[billingCycle];

  const hasStoredPosSession = () =>
    Boolean(window.localStorage.getItem(POS_SESSION_STORAGE_KEYS.token));

  return (
    <section
      className="main-catalog-section main-catalog-pricing-section"
      id="planes"
    >
      <div className="main-catalog-container">
        <div className="main-catalog-section-heading main-catalog-section-heading--center">
          <span className="main-catalog-eyebrow">Planes editables</span>
          <h2>Elige el catálogo que necesita tu negocio</h2>
          <p>
            Compara los planes mensual y anual. Mantén el gratuito para iniciar
            o elige un plan de pago cuando necesites más control.
          </p>
        </div>

        <div
          className="main-catalog-billing-toggle"
          role="group"
          aria-label="Seleccionar forma de pago"
        >
          {(Object.keys(billingCycleCopy) as BillingCycle[]).map((cycle) => {
            const isActive = billingCycle === cycle;

            return (
              <button
                className={`main-catalog-billing-toggle__button ${isActive ? "main-catalog-billing-toggle__button--active" : ""}`}
                type="button"
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                aria-pressed={isActive}
              >
                {billingCycleCopy[cycle].label}
              </button>
            );
          })}
        </div>
        <p className="main-catalog-billing-helper">{activeBilling.helper}</p>

        <div className="main-catalog-pricing-grid">
          {plans.map((plan) => (
            <article
              className={`main-catalog-plan ${plan.recommended ? "main-catalog-plan--recommended" : ""}`}
              key={plan.name}
            >
              <div className="main-catalog-plan__header">
                {plan.recommended && (
                  <span className="main-catalog-plan__tag">Recomendado</span>
                )}
                <h3>{plan.name}</h3>
              </div>
              <div className="main-catalog-plan__price-row">
                <p className="main-catalog-plan__price">
                  {plan.prices[billingCycle]}
                </p>
                <span>{plan.periodLabel[billingCycle]}</span>
              </div>
              {billingCycle === "annual" && plan.annualNote && (
                <p className="main-catalog-plan__saving">{plan.annualNote}</p>
              )}
              <p className="main-catalog-plan__limit">{plan.limit}</p>
              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <a
                className="main-catalog-button main-catalog-button--primary main-catalog-button--full"
                href={plan.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"}
                onClick={(event) => {
                  trackMetaEvent("Contact", {
                    content_name: plan.name,
                    plan_price: plan.prices[billingCycle],
                  });

                  if (plan.name !== FREE_CATALOG_PLAN_NAME) {
                    event.preventDefault();

                    const checkoutPlan = buildCatalogCheckoutPlan(plan, billingCycle);
                    if (!checkoutPlan) {
                      return;
                    }

                    if (!hasStoredPosSession()) {
                      setLoginModalPlan(checkoutPlan);
                      return;
                    }

                    setUnlockModalPlan(checkoutPlan);
                  }
                }}
                aria-label={`Elegir ${plan.name} ${billingCycleCopy[billingCycle].label.toLowerCase()}`}
              >
                Elegir plan
              </a>
            </article>
          ))}
        </div>
      </div>
      <FreeCatalogLoginModal
        open={Boolean(loginModalPlan)}
        planName={loginModalPlan?.name}
        onAuthenticated={() => {
          setUnlockModalPlan(loginModalPlan);
          setLoginModalPlan(null);
        }}
        onClose={() => setLoginModalPlan(null)}
      />
      <FeatureUnlockModal
        open={Boolean(unlockModalPlan)}
        onClose={() => setUnlockModalPlan(null)}
        title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`}
        message="Completa el pago para activar el paquete seleccionado y entrar al punto de venta."
        buttonText="Continuar al pago"
        unlockFeature="Catalog"
        initialPlan={unlockModalPlan ? {
          amount: unlockModalPlan.amount,
          plan: unlockModalPlan.plan,
          label: unlockModalPlan.name,
        } : undefined}
        onPaymentSuccess={() => navigate(MAIN_SALES_PATH)}
      />
    </section>
  );
};

const LeadFormSection = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessLine, setBusinessLine] = useState("");

  const whatsappLeadUrl = useMemo(
    () => buildLeadWhatsAppUrl(businessName, businessLine),
    [businessName, businessLine],
  );
  const isFormReady =
    businessName.trim().length > 0 && businessLine.trim().length > 0;

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  trackMetaEvent("Lead", {
    content_name: "catalogo_digital_whatsapp_form",
    business_name: businessName.trim(),
    business_line: businessLine.trim(),
  });

  window.open(whatsappLeadUrl, "_blank", "noopener,noreferrer");
};
  return (
    
    <section
      className="main-catalog-section main-catalog-lead-form-section"
      id="solicitar-catalogo"
    >
      
      <div className="main-catalog-container main-catalog-lead-form-card">
        <div className="main-catalog-lead-form-copy">
          <span className="main-catalog-eyebrow">Contacto por WhatsApp</span>
          <h2>Cuéntanos de tu negocio y te orientamos mejor</h2>
          <p>
            Llena estos datos y se abrirá WhatsApp con el mensaje listo. Así
            podemos entender rápido qué vendes y qué tipo de catálogo necesitas.
          </p>
          <div className="main-catalog-lead-form-preview" aria-live="polite">
            <strong>Mensaje que se enviará:</strong>
            <span>
              Nombre del negocio: {businessName.trim() || "Por definir"}
            </span>
            <span>
              Giro / qué vende: {businessLine.trim() || "Por definir"}
            </span>
          </div>
        </div>

        <form className="main-catalog-lead-form" onSubmit={handleSubmit}>
          <label htmlFor="businessName">Nombre del negocio</label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Ej. Boutique Mariela"
            autoComplete="organization"
            required
          />

          <label htmlFor="businessLine">¿Cuál es su giro? ¿Qué vende?</label>
          <textarea
            id="businessLine"
            name="businessLine"
            value={businessLine}
            onChange={(event) => setBusinessLine(event.target.value)}
            placeholder="Ej. Ropa para dama, calzado, perfumes, comida, refacciones..."
            rows={4}
            required
          />

          <button
            className="main-catalog-whatsapp-submit"
            type="submit"
            disabled={!isFormReady}
          >
            <WhatsAppIcon className="main-catalog-whatsapp-submit__icon" />
            Enviar datos por WhatsApp
          </button>
          <p className="main-catalog-lead-form-note">
            No se envía nada hasta que confirmes el mensaje en WhatsApp.
          </p>
        </form>
      </div>
    </section>
  );
};

const FloatingWhatsAppButton = () => (
<a
  className="main-catalog-button main-catalog-button--primary"
  href={CONTACT_HASH}
  onClick={(event) => {
    trackMetaCustomEvent("CatalogCTA_Click", {
      location: "hero",
      destination: "planes",
    });

    scrollToId(CONTACT_HASH)(event);
  }}
>
  Quiero mi catálogo
</a>
);

const FAQSection = () => (
  <section className="main-catalog-section main-catalog-section--soft" id="faq">
    <div className="main-catalog-container">
      <div className="main-catalog-section-heading main-catalog-section-heading--center">
        <span className="main-catalog-eyebrow">Preguntas frecuentes</span>
        <h2>Resuelve dudas antes de empezar</h2>
      </div>
      <div className="main-catalog-faq-grid">
        {faqs.map((faq) => (
          <details className="main-catalog-faq" key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="main-catalog-final-cta">
    <div className="main-catalog-container main-catalog-final-cta__card">
      <div>
        <span className="main-catalog-eyebrow main-catalog-eyebrow--light">
          Listo para vender mejor
        </span>
        <h2>
          Deja de vender con fotos sueltas. Empieza con un catálogo profesional.
        </h2>
        <p>
          Convierte tu catálogo para negocios en un link claro, rápido y
          preparado para WhatsApp.
        </p>
      </div>
      <div className="main-catalog-actions main-catalog-actions--end">
        <a
          className="main-catalog-button main-catalog-button--light"
          href={CONTACT_HASH}
          onClick={scrollToId(CONTACT_HASH)}
        >
          Quiero mi catálogo
        </a>
        <a
          className="main-catalog-button main-catalog-button--ghost"
          href={WHATSAPP_URL}
          aria-label="Hablar por WhatsApp sobre el catálogo digital Ravekh"
        >
          Hablar por WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export const MainCatalogPage = (): JSX.Element => {
  return (
    <main className="main-catalog-page">
      <header
        className="main-catalog-nav"
        aria-label="Navegación de catálogo digital Ravekh"
      >
        <Link
          className="main-catalog-brand"
          to="/"
          aria-label="Volver al inicio de Ravekh"
        >
          <span>R</span> Ravekh
        </Link>
        <nav>
          <a href="#beneficios" onClick={scrollToId("#beneficios")}>
            Beneficios
          </a>
          <a href="#como-funciona" onClick={scrollToId("#como-funciona")}>
            Cómo funciona
          </a>
          <a href="#planes" onClick={scrollToId("#planes")}>
            Planes
          </a>
          <a href="#faq" onClick={scrollToId("#faq")}>
            FAQ
          </a>
          <a href={LEAD_FORM_HASH} onClick={scrollToId(LEAD_FORM_HASH)}>
            WhatsApp
          </a>
        </nav>
        <div
          className="main-catalog-nav-actions"
          aria-label="Accesos principales"
        >
          <a
            className="main-catalog-nav-cta main-catalog-nav-cta--primary"
            href={LEAD_FORM_HASH}
            onClick={scrollToId(LEAD_FORM_HASH)}
          >
            Prueba gratis
          </a>
          <Link
            className="main-catalog-nav-cta main-catalog-nav-cta--secondary"
            to="/login-punto-venta"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <CatalogHero />

      <section
        className="main-catalog-benefits"
        id="beneficios"
        aria-label="Beneficios rápidos del catálogo digital"
      >
        <div className="main-catalog-container main-catalog-grid main-catalog-grid--four">
          {quickBenefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </section>

      <ComparisonSection />

      <section className="main-catalog-section">
        <div className="main-catalog-container">
          <div className="main-catalog-section-heading">
            <span className="main-catalog-eyebrow">La solución</span>
            <h2>Un catálogo online simple, bonito y hecho para vender</h2>
            <p>
              Ravekh combina presentación profesional, link de productos y
              contacto directo para que tu negocio venda por WhatsApp con menos
              fricción.
            </p>
          </div>
          <div className="main-catalog-grid main-catalog-grid--three">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="main-catalog-section main-catalog-experience"
        id="como-funciona"
      >
        <div className="main-catalog-container main-catalog-split main-catalog-split--center">
          <div>
            <span className="main-catalog-eyebrow">
              Experiencia del cliente
            </span>
            <h2>
              Tu cliente entra, ve tus productos y te escribe con más contexto.
            </h2>
            <ol className="main-catalog-steps">
              {steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="main-catalog-experience__mockup">
            <CatalogMockup compact />
          </div>
        </div>
      </section>

      <MetricsSection />

      <section className="main-catalog-section">
        <div className="main-catalog-container">
          <div className="main-catalog-section-heading main-catalog-section-heading--center">
            <span className="main-catalog-eyebrow">Para quién es</span>
            <h2>Funciona para negocios que venden todos los días</h2>
          </div>
          <div className="main-catalog-grid main-catalog-grid--four">
            {businessTypes.map((business) => (
              <FeatureCard key={business.title} {...business} />
            ))}
          </div>
        </div>
      </section>

      <section className="main-catalog-section main-catalog-section--soft">
        <div className="main-catalog-container">
          <div className="main-catalog-section-heading main-catalog-section-heading--center">
            <span className="main-catalog-eyebrow">Diferenciador</span>
            <h2>
              No necesitas una tienda complicada para empezar a vender mejor
            </h2>
            <p>
              Ravekh no busca complicarte con una tienda enorme. Te da una forma
              práctica de mostrar tus productos, compartirlos y atender mejor
              por WhatsApp.
            </p>
          </div>
          <div className="main-catalog-grid main-catalog-grid--three">
            {differentiators.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection />
      <LeadFormSection />

      <section className="main-catalog-section main-catalog-testimonials">
        <div className="main-catalog-container">
          <div className="main-catalog-section-heading main-catalog-section-heading--center">
            <span className="main-catalog-eyebrow">Prueba social editable</span>
            <h2>Negocios que ya venden con más orden</h2>
          </div>
          <div className="main-catalog-grid main-catalog-grid--three">
            {testimonials.map((testimonial) => (
              <article
                className="main-catalog-testimonial"
                key={testimonial.quote}
              >
                <span aria-hidden="true">“</span>
                <p>{testimonial.quote}</p>
                <div>
                  <div className="main-catalog-avatar" aria-hidden="true">
                    <img src={testimonial.logoUrl} alt="" loading="lazy" />
                  </div>
                  <strong>{testimonial.business}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />

      <FloatingWhatsAppButton />

      <footer className="main-catalog-footer">
        <div className="main-catalog-container">
          <p>© Ravekh. Catálogo digital, POS y soluciones para negocios.</p>
          <Link to="/politicas/catalogo">
            Política de privacidad del catálogo
          </Link>
        </div>
      </footer>
    </main>
  );
};
