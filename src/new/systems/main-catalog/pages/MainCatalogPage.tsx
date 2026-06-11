import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MainCatalogPage.css";

const WHATSAPP_PHONE = "5653989702";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;
const CONTACT_HASH = "#planes";
const LEAD_FORM_HASH = "#solicitar-catalogo";

type CardItem = {
  icon: string;
  title: string;
  text: string;
};

type Plan = {
  name: string;
  price: string;
  limit: string;
  benefits: string[];
  recommended?: boolean;
};

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

const beforeItems = ["Fotos sueltas", "Precios desactualizados", "Clientes preguntando lo mismo", "Pedidos desordenados"];
const afterItems = ["Catálogo con link", "Productos actualizados", "Cliente elige más fácil", "Pedido más claro por WhatsApp"];

const features: CardItem[] = [
  {
    icon: "🌐",
    title: "Catálogo compartible por link",
    text: "Un solo enlace para mostrar tus productos en WhatsApp, Instagram, Facebook o Google Business.",
  },
  {
    icon: "🖼️",
    title: "Foto, precio y descripción",
    text: "Presenta cada producto con la información que tu cliente necesita para decidir más rápido.",
  },
  {
    icon: "🏷️",
    title: "Categorías organizadas",
    text: "Ordena tu catálogo digital para que encontrar productos sea simple desde celular.",
  },
  {
    icon: "📲",
    title: "Botón directo a WhatsApp",
    text: "Convierte la intención en conversación con un CTA claro para pedir o resolver dudas.",
  },
  {
    icon: "📱",
    title: "Diseño adaptable a celular",
    text: "Una tienda en línea simple, rápida y cómoda para clientes que compran desde móvil.",
  },
  {
    icon: "📊",
    title: "Métricas de interés",
    text: "Detecta qué productos se ven más para tomar mejores decisiones comerciales.",
  },
];

const steps = ["Compartes tu link.", "El cliente ve tu catálogo.", "Elige productos.", "Te contacta por WhatsApp con más claridad."];

const metrics: CardItem[] = [
  { icon: "👀", title: "Visitas al catálogo", text: "Identifica cuándo y cuánto están consultando tus productos." },
  { icon: "⭐", title: "Productos más vistos", text: "Detecta tus artículos con mayor interés para promoverlos mejor." },
  { icon: "📣", title: "Productos más compartidos", text: "Conoce qué productos se mueven mejor entre clientes y redes." },
  { icon: "💡", title: "Interés de tus clientes", text: "Usa señales simples para ajustar precios, stock y comunicación." },
];

const businessTypes: CardItem[] = [
  { icon: "👗", title: "Ropa y calzado", text: "Tallas, estilos y temporadas en un solo lugar." },
  { icon: "🔧", title: "Refacciones", text: "Muestra piezas y variantes sin perder conversaciones." },
  { icon: "🧴", title: "Perfumes", text: "Organiza aromas, presentaciones y promociones." },
  { icon: "🍔", title: "Comida", text: "Comparte menús, combos y productos por temporada." },
  { icon: "🎈", title: "Inflables", text: "Presenta paquetes, medidas y opciones disponibles." },
  { icon: "🕶️", title: "Accesorios", text: "Haz que tu cliente explore modelos sin pedir foto por foto." },
  { icon: "🛒", title: "Abarrotes", text: "Ordena productos de alta rotación para pedidos más rápidos." },
  { icon: "🎁", title: "Catálogos por temporada", text: "Lanza colecciones, promociones o campañas especiales." },
];

const differentiators: CardItem[] = [
  {
    icon: "✅",
    title: "Simple para el negocio",
    text: "No necesitas operar una tienda enorme para empezar a vender con una presentación profesional.",
  },
  {
    icon: "✨",
    title: "Claro para el cliente",
    text: "Tus productos se ven ordenados, rápidos y listos para iniciar una conversación de compra.",
  },
  {
    icon: "🚀",
    title: "Preparado para crecer",
    text: "Cuando tu operación avance, puedes conectar mejores procesos de venta, POS y fidelidad.",
  },
];

const plans: Plan[] = [
  {
    name: "Catálogo Gratuito",
    price: "0.00 MXN",
    limit: "Límite de productos/fotos editable",
    benefits: ["Link de catálogo", "1 Imagen por producto", "50 Visitas al mes por catálogo", "Sin acceso a impuesto por venta", "Guardado 100% offline"],
  },
  {
    name: "Catálogo Básico",
    price: "299.00 MXN",
    limit: "Perfecto para empezar con un catálogo simple",
    benefits: ["Importación masiva", "Acceso a reportes", "Productos Ilimitados 1 imagen por producto", "Sincronisación en la nube"],
    recommended: true,
  },
  {
    name: "Catálogo Intermedio",
    price: "599.00 MXN",
    limit: "Para negocios con más variedad de productos",
    benefits: ["Todo lo del plan Básico", "Mayor capacidad de productos", "Mejor seguimiento comercial", "Preparado para crecer a POS"],
  },
    {
    name: "Catálogo Pro",
    price: "1299.00 MXN",
    limit: "Límite de productos/fotos editable",
    benefits: ["Todo lo del plan Intermedio", "Capacidad de productos personalizada", "Soporte prioritario", "100 Facturas timbradas al mes ante el sat"],
  },
];

const testimonials = [
  {
    quote: "Ahora mis clientes ven todo en un solo link y me preguntan menos por precios.",
    business: "As Perfumeria",
    logoUrl: "https://res.cloudinary.com/ravekh/image/upload/v1778857844/ravekh-fotos/hwo8yhdacmg92cxhmjcb.jpg",
    logoAlt: "As Perfumeria",
  },
  {
    quote: "Me ayudó a ordenar mis productos y compartirlos más rápido por WhatsApp.",
    business: "Óptica Bicentenario",
    logoUrl: "https://res.cloudinary.com/ravekh/image/upload/v1778874056/ravekh-fotos/gx700ycd7uh6qvbxhvp5.jpg",
    logoAlt: "Óptica Bicentenario",
  },
  {
    quote: "El catálogo se siente más profesional que mandar muchas fotos sueltas.",
    business: "DIABLITA SEXSHOP 😈🔥",
    logoUrl: "https://res.cloudinary.com/dban2urdk/image/upload/v1780428838/jfc5ozxjietcmcfe6ol9.jpg",
    logoAlt: "DIABLITA SEXSHOP 😈🔥",
  },
];

const faqs = [
  {
    question: "¿Necesito página web para usar el catálogo?",
    answer: "No. Ravekh te da un catálogo digital con link para compartirlo sin construir una página web completa.",
  },
  {
    question: "¿Mis clientes tienen que descargar una app?",
    answer: "No. Tus clientes abren el catálogo online desde el navegador de su celular o computadora.",
  },
  {
    question: "¿Puedo compartirlo por WhatsApp?",
    answer: "Sí. Está pensado para vender por WhatsApp, redes sociales y atención directa con menos fricción.",
  },
  {
    question: "¿Puedo actualizar mis productos?",
    answer: "Sí. La idea es que tu catálogo para negocios se mantenga ordenado y actualizado desde un solo lugar.",
  },
  {
    question: "¿Sirve para negocios pequeños?",
    answer: "Sí. Es ideal para empezar con una tienda en línea simple antes de invertir en procesos más complejos.",
  },
  {
    question: "¿Puedo crecer después a POS o fidelidad?",
    answer: "Sí. Ravekh puede acompañarte con soluciones para punto de venta, operación y fidelización cuando lo necesites.",
  },
];

const products = [
  { name: "Producto destacado", price: "$---", tone: "pink" },
  { name: "Nueva colección", price: "$---", tone: "purple" },
  { name: "Más vendido", price: "$---", tone: "blue" },
];

const scrollToId = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
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

const FeatureCard = ({ icon, title, text }: CardItem) => (
  <article className="main-catalog-card main-catalog-feature-card">
    <span className="main-catalog-icon" aria-hidden="true">
      {icon}
    </span>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
);

const CatalogMockup = ({ compact = false }: { compact?: boolean }) => (
  <div className={`catalog-phone ${compact ? "catalog-phone--compact" : ""}`} aria-label="Mockup de catálogo digital Ravekh" role="img">
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
            <div className={`catalog-phone__image catalog-phone__image--${product.tone}`} />
            <div>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </div>
          </div>
        ))}
      </div>
      <a className="catalog-phone__button" href={WHATSAPP_URL} aria-label="Pedir por WhatsApp desde el catálogo">
        Pedir por WhatsApp
      </a>
    </div>
  </div>
);

const CatalogHero = () => (
  <section className="main-catalog-hero" id="inicio">
    <div className="main-catalog-container main-catalog-hero__grid">
      <div className="main-catalog-hero__content">
        <span className="main-catalog-eyebrow">Catálogo digital para negocios en México</span>
        <h1>Tu catálogo digital listo para vender por WhatsApp</h1>
        <p className="main-catalog-lead">
          Organiza tus productos, comparte un solo link y deja de mandar fotos una por una. Ravekh convierte tu catálogo en una experiencia rápida, clara y profesional para tus clientes.
        </p>
        <div className="main-catalog-actions">
          <a className="main-catalog-button main-catalog-button--primary" href={CONTACT_HASH} onClick={scrollToId(CONTACT_HASH)} aria-label="Ir a los planes de catálogo digital">
            Quiero mi catálogo
          </a>
          <a className="main-catalog-button main-catalog-button--secondary" href="#como-funciona" onClick={scrollToId("#como-funciona")} aria-label="Ver cómo funciona el catálogo digital Ravekh">
            Ver cómo funciona
          </a>
        </div>
        <p className="main-catalog-microcopy">Pensado para negocios que venden por WhatsApp, redes sociales y atención directa.</p>
      </div>
      <div className="main-catalog-hero__visual" aria-hidden="true">
        <div className="main-catalog-desktop-mockup">
          <div className="main-catalog-window-bar"><span /><span /><span /></div>
          <div className="main-catalog-dashboard-grid">
            <div className="main-catalog-dashboard-panel main-catalog-dashboard-panel--wide" />
            <div className="main-catalog-dashboard-panel" />
            <div className="main-catalog-dashboard-panel" />
          </div>
        </div>
        <CatalogMockup />
        <div className="main-catalog-floating-card main-catalog-floating-card--one">💬 Pedido recibido por WhatsApp</div>
        <div className="main-catalog-floating-card main-catalog-floating-card--two">⚡ Productos actualizados</div>
        <div className="main-catalog-floating-card main-catalog-floating-card--three">🔗 Link listo para compartir</div>
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
          Cuando tu negocio crece, responder lo mismo, buscar fotos, confirmar precios y reenviar productos se vuelve lento. Tus clientes quieren ver todo rápido, claro y desde su celular.
        </p>
      </div>
      <div className="main-catalog-comparison" aria-label="Comparación antes y después de usar Ravekh">
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
        <p>No se trata solo de tener productos online. Se trata de saber qué está funcionando.</p>
      </div>
      <div className="main-catalog-grid main-catalog-grid--four">
        {metrics.map((metric) => (
          <FeatureCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section className="main-catalog-section" id="planes">
    <div className="main-catalog-container">
      <div className="main-catalog-section-heading main-catalog-section-heading--center">
        <span className="main-catalog-eyebrow">Planes editables</span>
        <h2>Elige el catálogo que necesita tu negocio</h2>
        <p>Los precios y límites quedan centralizados en un array local para editarlos con facilidad.</p>
      </div>
      <div className="main-catalog-pricing-grid">
        {plans.map((plan) => (
          <article className={`main-catalog-plan ${plan.recommended ? "main-catalog-plan--recommended" : ""}`} key={plan.name}>
            {plan.recommended && <span className="main-catalog-plan__tag">Recomendado</span>}
            <h3>{plan.name}</h3>
            <p className="main-catalog-plan__price">{plan.price}</p>
            <p className="main-catalog-plan__limit">{plan.limit}</p>
            <ul>
              {plan.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <a className="main-catalog-button main-catalog-button--primary main-catalog-button--full" href={WHATSAPP_URL} aria-label={`Elegir ${plan.name}`}>
              Elegir plan
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const LeadFormSection = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessLine, setBusinessLine] = useState("");

  const whatsappLeadUrl = useMemo(() => buildLeadWhatsAppUrl(businessName, businessLine), [businessName, businessLine]);
  const isFormReady = businessName.trim().length > 0 && businessLine.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.open(whatsappLeadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="main-catalog-section main-catalog-lead-form-section" id="solicitar-catalogo">
      <div className="main-catalog-container main-catalog-lead-form-card">
        <div className="main-catalog-lead-form-copy">
          <span className="main-catalog-eyebrow">Contacto por WhatsApp</span>
          <h2>Cuéntanos de tu negocio y te orientamos mejor</h2>
          <p>Llena estos datos y se abrirá WhatsApp con el mensaje listo. Así podemos entender rápido qué vendes y qué tipo de catálogo necesitas.</p>
          <div className="main-catalog-lead-form-preview" aria-live="polite">
            <strong>Mensaje que se enviará:</strong>
            <span>Nombre del negocio: {businessName.trim() || "Por definir"}</span>
            <span>Giro / qué vende: {businessLine.trim() || "Por definir"}</span>
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

          <button className="main-catalog-whatsapp-submit" type="submit" disabled={!isFormReady}>
            <WhatsAppIcon className="main-catalog-whatsapp-submit__icon" />
            Enviar datos por WhatsApp
          </button>
          <p className="main-catalog-lead-form-note">No se envía nada hasta que confirmes el mensaje en WhatsApp.</p>
        </form>
      </div>
    </section>
  );
};

const FloatingWhatsAppButton = () => (
  <a
    className="main-catalog-whatsapp-float"
    href={LEAD_FORM_HASH}
    onClick={scrollToId(LEAD_FORM_HASH)}
    aria-label="Ir al formulario de contacto por WhatsApp"
  >
    <WhatsAppIcon className="main-catalog-whatsapp-float__icon" />
    <span>Quiero mi catálogo</span>
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
        <span className="main-catalog-eyebrow main-catalog-eyebrow--light">Listo para vender mejor</span>
        <h2>Deja de vender con fotos sueltas. Empieza con un catálogo profesional.</h2>
        <p>Convierte tu catálogo para negocios en un link claro, rápido y preparado para WhatsApp.</p>
      </div>
      <div className="main-catalog-actions main-catalog-actions--end">
        <a className="main-catalog-button main-catalog-button--light" href={CONTACT_HASH} onClick={scrollToId(CONTACT_HASH)}>
          Quiero mi catálogo
        </a>
        <a className="main-catalog-button main-catalog-button--ghost" href={WHATSAPP_URL} aria-label="Hablar por WhatsApp sobre el catálogo digital Ravekh">
          Hablar por WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export const MainCatalogPage = (): JSX.Element => {
  return (
    <main className="main-catalog-page">
      <header className="main-catalog-nav" aria-label="Navegación de catálogo digital Ravekh">
        <Link className="main-catalog-brand" to="/" aria-label="Volver al inicio de Ravekh">
          <span>R</span> Ravekh
        </Link>
        <nav>
          <a href="#beneficios" onClick={scrollToId("#beneficios")}>Beneficios</a>
          <a href="#como-funciona" onClick={scrollToId("#como-funciona")}>Cómo funciona</a>
          <a href="#planes" onClick={scrollToId("#planes")}>Planes</a>
          <a href="#faq" onClick={scrollToId("#faq")}>FAQ</a>
          <a href={LEAD_FORM_HASH} onClick={scrollToId(LEAD_FORM_HASH)}>WhatsApp</a>
        </nav>
        <div className="main-catalog-nav-actions" aria-label="Accesos principales">
          <a className="main-catalog-nav-cta main-catalog-nav-cta--primary" href={LEAD_FORM_HASH} onClick={scrollToId(LEAD_FORM_HASH)}>
            Prueba gratis
          </a>
          <Link className="main-catalog-nav-cta main-catalog-nav-cta--secondary" to="/login-punto-venta">
            Ingresar
          </Link>
        </div>
      </header>

      <CatalogHero />

      <section className="main-catalog-benefits" id="beneficios" aria-label="Beneficios rápidos del catálogo digital">
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
            <p>Ravekh combina presentación profesional, link de productos y contacto directo para que tu negocio venda por WhatsApp con menos fricción.</p>
          </div>
          <div className="main-catalog-grid main-catalog-grid--three">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="main-catalog-section main-catalog-experience" id="como-funciona">
        <div className="main-catalog-container main-catalog-split main-catalog-split--center">
          <div>
            <span className="main-catalog-eyebrow">Experiencia del cliente</span>
            <h2>Tu cliente entra, ve tus productos y te escribe con más contexto.</h2>
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
            <h2>No necesitas una tienda complicada para empezar a vender mejor</h2>
            <p>Ravekh no busca complicarte con una tienda enorme. Te da una forma práctica de mostrar tus productos, compartirlos y atender mejor por WhatsApp.</p>
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
              <article className="main-catalog-testimonial" key={testimonial.quote}>
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
          <Link to="/politicas/catalogo">Política de privacidad del catálogo</Link>
        </div>
      </footer>
    </main>
  );
};
