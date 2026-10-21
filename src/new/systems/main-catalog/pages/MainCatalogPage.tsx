import { useMemo, useState, type ReactNode, type SVGProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FreeCatalogLoginModal } from "../components/FreeCatalogLoginModal";
import { POS_SESSION_STORAGE_KEYS } from "../../pos/shared/config/posSession";
import { FeatureUnlockModal } from "../../pos/shared/ui/FeatureUnlockModal";
import {
  billingCycleCopy,
  buildCatalogCheckoutPlan,
  catalogPlans,
  FREE_CATALOG_PLAN_NAME,
  LOGIN_POS_PATH,
  type BillingCycle,
  type CatalogCheckoutPlan,
  type VerticalCatalogPlan,
} from "../../ravekh-segment/pages/catalogPricingShared";
import { trackMetaEvent } from "../../../../../scripts/metaPixel";
import "./MainCatalogPage.css";
// importacion del video de demostracion
import demoVideo from "../../../../assets/landingCatalog/recorrido-catalogo.mp4";
const MAIN_SALES_PATH = "/MainSales";
const DEMO_CATALOG_PATH = "/v2/catalogo/1";
const START_INTRO_PRICE = 189;
const WHATSAPP_URL = "https://wa.me/524451113370?text=Hola%20Ravekh%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20cat%C3%A1logo%20digital";

type FeatureItem = {
  icon: ReactNode;
  title: string;
  text: string;
};

const Icon = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
);

const icons = {
  link: <Icon><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L11 5" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1L13 19" /></Icon>,
  products: <Icon><path d="M4 7 12 3l8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 17 8 4 8-4" /></Icon>,
  search: <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>,
  cart: <Icon><path d="M3 4h2l2.2 10.5h10.9L21 7H6" /><circle cx="9" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></Icon>,
  whatsapp: <Icon><path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.5 2.2 2 3.8 4.5 4.5" /></Icon>,
  variants: <Icon><path d="M5 5h6v6H5zM13 13h6v6h-6z" /><path d="M14 5h5M5 16h5" /></Icon>,
  checkout: <Icon><path d="M5 3h14v18H5z" /><path d="M8 8h8M8 12h8M8 16h4" /></Icon>,
  card: <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></Icon>,
  reports: <Icon><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>,
  pos: <Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Icon>,
  users: <Icon><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-4 2.7-6 6-6s5.3 2 6 6" /><circle cx="18" cy="9" r="2" /><path d="M16 15c2.7 0 4.3 1.7 5 5" /></Icon>,
  loyalty: <Icon><path d="M12 21s-7-4.4-7-11a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 6.6-7 11-7 11Z" /></Icon>,
  inventory: <Icon><path d="M4 7 12 3l8 4v10l-8 4-8-4V7Z" /><path d="m4 7 8 4 8-4M12 11v10" /></Icon>,
};

const catalogFeatures: FeatureItem[] = [
  { icon: icons.link, title: "Un link para vender", text: "Comparte tu catálogo en WhatsApp, Facebook, Instagram o donde ya están tus clientes." },
  { icon: icons.products, title: "Productos bien presentados", text: "Fotos, precios, descripciones, categorías y productos publicados desde un solo lugar." },
  { icon: icons.search, title: "Búsqueda y filtros", text: "Tu cliente encuentra rápido lo que quiere por nombre, categoría y rango de precio." },
  { icon: icons.variants, title: "Variantes y presentaciones", text: "Maneja tallas, medidas, aromas, colores o presentaciones sin llenar el catálogo de duplicados." },
  { icon: icons.cart, title: "Carrito de compra", text: "El cliente agrega varios productos, cantidades y variantes antes de confirmar." },
  { icon: icons.checkout, title: "Pedido con datos completos", text: "Puedes solicitar contacto, envío, dirección, referencias y método de pago." },
  { icon: icons.whatsapp, title: "Pedido directo a WhatsApp", text: "El pedido llega estructurado para que cierres la venta sin reconstruir la conversación." },
  { icon: icons.card, title: "Pago con tarjeta", text: "Cuando tu configuración lo permite, el cliente puede continuar a pago desde el mismo flujo." },
];

const ecosystemFeatures: FeatureItem[] = [
  { icon: icons.pos, title: "Punto de venta", text: "Vende desde móvil o web y mantén tu operación conectada." },
  { icon: icons.inventory, title: "Inventario", text: "Tus productos, existencias y catálogo viven dentro del mismo sistema." },
  { icon: icons.reports, title: "Reportes", text: "Consulta ventas, desempeño y datos para tomar mejores decisiones." },
  { icon: icons.users, title: "Clientes y equipo", text: "Gestiona clientes, empleados, sucursales y operación diaria según tu plan." },
  { icon: icons.loyalty, title: "Fidelidad", text: "Agrega visitas, cupones y recompensas para que tus clientes regresen." },
  { icon: icons.whatsapp, title: "CRM y conversación", text: "RAVEKH está preparado para crecer hacia atención y seguimiento desde tus canales comerciales." },
];

const steps = [
  ["01", "Sube tus productos", "Agrégalos uno por uno o usa importación masiva cuando tu plan lo permita."],
  ["02", "Personaliza tu catálogo", "Configura qué vendes, cómo se ve y qué información pedir al cliente."],
  ["03", "Comparte tu link", "Ponlo en redes, anuncios, QR, WhatsApp o en tu perfil del negocio."],
  ["04", "Recibe el pedido", "El cliente arma su carrito y te manda una solicitud mucho más clara."],
];

// Commercial copy is separated from entitlements: only benefits present in the pricing configuration are asserted.
const planPresentation: Record<string, { audience: string; highlight: string; additions: string[]; caveat?: string }> = {
  "Catálogo Gratuito": {
    audience: "Para probar tu catálogo antes de contratar",
    highlight: "Publica y comparte tu primer catálogo",
    additions: ["Enlace para compartir", "1 foto por producto", "50 visitas mensuales por catálogo", "Datos guardados offline"],
    caveat: "El límite de productos no está especificado en esta configuración.",
  },
  "Catálogo Básico": {
    audience: "Para negocios que ya quieren vender en serio",
    highlight: "Productos ilimitados y respaldo en la nube",
    additions: ["Todo lo necesario para publicar productos", "Productos ilimitados · 3 imagen por producto", "Importación masiva de productos", "Reportes", "Sincronización en la nube"],
  },
  "Catálogo Intermedio": {
    audience: "Para negocios en crecimiento",
    highlight: "Más capacidad y seguimiento comercial",
    additions: ["Todo lo incluido en Básico", "Mayor capacidad configurada para el negocio", "Mejor seguimiento comercial", "Preparación para crecer con POS"],
    caveat: "Los límites y herramientas adicionales de PRO requieren confirmación.",
  },
  "Catálogo Pro": {
    audience: "Para operaciones que necesitan atención prioritaria",
    highlight: "Soporte prioritario y facturación",
    additions: ["Todo lo incluido en Intermedio", "Capacidad personalizada", "Soporte prioritario", "100 facturas timbradas al mes ante el SAT"],
    caveat: "La capacidad personalizada se define según tu operación.",
  },
};

const comparisonRows = [
  { label: "Enlace de catálogo", values: ["Sí", "Sí", "Sí", "Sí"] },
  { label: "Fotos por producto", values: ["1", "3", "8", "Sin límite"] },
  { label: "Visitas mensuales", values: ["50", "Sin límite", "Sin límite", "Sin límite"] },
  { label: "Productos", values: ["Límite por confirmar", "Ilimitados", "Incluidos", "Personalizados"] },
  { label: "Importación masiva", values: ["No anunciada", "Sí", "Sí", "Sí"] },
  { label: "Reportes y nube", values: ["No anunciados", "Sí", "Sí", "Sí"] },
  { label: "Seguimiento comercial adicional", values: ["No anunciado", "No anunciado", "Sí*", "Sí*"] },
  { label: "Soporte prioritario", values: ["No anunciado", "No anunciado", "No anunciado", "Sí"] },
  { label: "Facturas SAT / mes", values: ["No anunciadas", "No anunciadas", "No anunciadas", "100"] },
];

const getCheckoutPlan = (plan: VerticalCatalogPlan, billingCycle: BillingCycle): CatalogCheckoutPlan | null => {
  const checkout = buildCatalogCheckoutPlan(plan, billingCycle);
  if (!checkout) return null;
  if (billingCycle === "monthly" && checkout.plan === "START") {
    return { ...checkout, amount: START_INTRO_PRICE };
  }
  return checkout;
};

const ProductPreview = () => (
  <div className="catalog-landing-preview" aria-label="Vista ilustrativa del catálogo Ravekh">
    <div className="catalog-landing-browser">
      <div className="catalog-landing-browser__bar"><span /><span /><span /><div>tutienda.ravekh.com</div></div>
      <div className="catalog-landing-browser__body">
        <div className="catalog-landing-browser__hero"><div><span>Nueva colección</span><strong>Tu negocio,<br />bien presentado.</strong></div><div className="catalog-landing-browser__hero-art" /></div>
        <div className="catalog-landing-browser__chips"><span>Todo</span><span>Favoritos</span><span>Nuevo</span><span>Ofertas</span></div>
        <div className="catalog-landing-browser__products">
          {["01", "02", "03"].map((item) => <div key={item} className={`catalog-landing-browser__product catalog-landing-browser__product--${item}`}><div /><strong>Producto {item}</strong><span>$299.00</span></div>)}
        </div>
      </div>
    </div>
    <div className="catalog-landing-phone">
      <div className="catalog-landing-phone__notch" />
      <div className="catalog-landing-phone__header"><div><span>RAVEKH STORE</span><strong>Catálogo</strong></div><b>3</b></div>
      <div className="catalog-landing-phone__search">Buscar productos</div>
      <div className="catalog-landing-phone__card"><div /><p><strong>Tu producto</strong><span>Variante · Disponible</span><b>$299</b></p></div>
      <div className="catalog-landing-phone__card"><div /><p><strong>Otro producto</strong><span>En stock</span><b>$449</b></p></div>
      <button type="button" tabIndex={-1}>Ver carrito · $748</button>
    </div>
    <div className="catalog-landing-floating catalog-landing-floating--order"><span>✓</span><div><strong>Pedido más claro</strong><small>Listo para WhatsApp</small></div></div>
    <div className="catalog-landing-floating catalog-landing-floating--stock"><span>12</span><div><strong>Stock conectado</strong><small>Desde RAVEKH</small></div></div>
  </div>
);

const FeatureCard = ({ icon, title, text }: FeatureItem) => (
  <article className="catalog-landing-feature-card"><span className="catalog-landing-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>
);

export const MainCatalogPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeBilling = billingCycleCopy[billingCycle];
  const startPlan = useMemo(() => catalogPlans.find((plan) => plan.checkoutPlanKey === "START"), []);

  const choosePlan = (plan: VerticalCatalogPlan) => {
    trackMetaEvent("Contact", { content_name: plan.name, plan_price: plan.prices[billingCycle] });
    if (plan.name === FREE_CATALOG_PLAN_NAME) {
      navigate(LOGIN_POS_PATH);
      return;
    }
    const checkoutPlan = getCheckoutPlan(plan, billingCycle);
    if (!checkoutPlan) return;
    const hasSession = Boolean(window.localStorage.getItem(POS_SESSION_STORAGE_KEYS.token));
    if (!hasSession) {
      setLoginModalPlan(checkoutPlan);
      return;
    }
    setUnlockModalPlan(checkoutPlan);
  };

  return (
    <main className="catalog-landing">
      <header className="catalog-landing-nav-shell">
        <div className="catalog-landing-nav">
          <Link className="catalog-landing-brand" to="/maincatalogo" aria-label="Ravekh Catálogo"><span>R</span><div><strong>RAVEKH</strong><small>CATÁLOGO</small></div></Link>
          <button className="catalog-landing-menu" type="button" aria-label="Abrir menú" onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
          <nav className={menuOpen ? "is-open" : ""}>
            <a href="#funciones" onClick={() => setMenuOpen(false)}>Funciones</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
            <a href="#ravekh" onClick={() => setMenuOpen(false)}>RAVEKH</a>
            <a href="#planes" onClick={() => setMenuOpen(false)}>Planes</a>
          </nav>
          <div className="catalog-landing-nav-actions">
            <Link className="catalog-landing-text-link" to={LOGIN_POS_PATH}>Entrar</Link>
            <a className="catalog-landing-pill catalog-landing-pill--dark" href="#planes">Crear catálogo</a>
          </div>
        </div>
      </header>

      <section className="catalog-landing-hero">
        <div className="catalog-landing-container catalog-landing-hero__grid">
          <div className="catalog-landing-hero__copy">
            <span className="catalog-landing-kicker">CATÁLOGO DIGITAL + SISTEMA PARA TU NEGOCIO</span>
            <h1>Deja de vender<br /><em>foto por foto.</em></h1>
            <p>Con RAVEKH tus clientes ven productos, precios y variantes, arman su carrito y te envían un pedido claro. Tú administras todo desde el mismo sistema donde puede vivir tu inventario, ventas y clientes.</p>
            <div className="catalog-landing-hero__actions">
              <a className="catalog-landing-button catalog-landing-button--primary" href="#planes">Crear mi catálogo</a>
              <Link className="catalog-landing-button catalog-landing-button--secondary" to={DEMO_CATALOG_PATH}>Ver un catálogo</Link>
            </div>
            <div className="catalog-landing-hero__proof"><span>✓ Sin mandar fotos una por una</span><span>✓ Funciona desde celular</span><span>✓ Comparte un solo link</span></div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="catalog-landing-strip" aria-label="Resumen de beneficios"><div className="catalog-landing-container"><span>PRODUCTOS</span><i>•</i><span>VARIANTES</span><i>•</i><span>CARRITO</span><i>•</i><span>WHATSAPP</span><i>•</i><span>PAGOS</span><i>•</i><span>INVENTARIO</span></div></section>

      <section className="catalog-landing-section" id="funciones">
        <div className="catalog-landing-container">
          <div className="catalog-landing-heading"><span>LO QUE RECIBE TU CLIENTE</span><h2>Un catálogo que sí ayuda a cerrar la venta.</h2><p>No es una página llena de fotos. Es un flujo pensado para que el cliente encuentre, elija y te diga exactamente qué quiere.</p></div>
          <div className="catalog-landing-feature-grid">{catalogFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div>
        </div>
      </section>

      <section className="catalog-landing-section catalog-landing-section--ink" id="como-funciona">
        <div className="catalog-landing-container catalog-landing-process">
          <div className="catalog-landing-heading catalog-landing-heading--light"><span>ASÍ FUNCIONA</span><h2>Publicas una vez. Compartes siempre.</h2><p>Tu catálogo se vuelve la puerta de entrada a tus productos y tú mantienes el control desde RAVEKH.</p></div>
          <div className="catalog-landing-steps">{steps.map(([number, title, text]) => <article key={number}><b>{number}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="catalog-landing-section catalog-landing-media-section">
        <div className="catalog-landing-container catalog-landing-media-grid">
          <div className="catalog-landing-media-placeholder">
            <div className="catalog-landing-media-placeholder__top"><span>DEMO DEL SISTEMA</span><b>00:29</b></div>
            <video
              className="catalog-landing-video"
              controls
              playsInline
              preload="metadata"
              aria-label="Demostración de RAVEKH Catálogo"
            >
              <source src={demoVideo} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
          <div className="catalog-landing-media-copy">

            <div className="catalog-landing-media-copy">
              <span className="catalog-landing-kicker">
                DESCUBRE RAVEKH EN 30 SEGUNDOS
              </span>

              <h2>
                Tu negocio merece vender de una forma más sencilla.
              </h2>

              <p>
                Olvídate de enviar fotos, precios y disponibilidad
                producto por producto.
              </p>

              <p>
                Con <strong>RAVEKH</strong>, tus clientes
                pueden explorar tus productos, elegir variantes,
                agregar al carrito y enviarte sus pedidos
                directamente por WhatsApp.
              </p>

              <p>
                Tú mantienes el control de tus productos,
                inventario y pedidos desde una sola plataforma.
              </p>

              <a
                href="#planes"
                className="catalog-landing-inline-link"
              >
                Crear mi catálogo <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-landing-section catalog-landing-ecosystem" id="ravekh">
        <div className="catalog-landing-container">
          <div className="catalog-landing-heading"><span>NO SE QUEDA SOLO EN EL CATÁLOGO</span><h2>Tu catálogo vive dentro de RAVEKH.</h2><p>Empieza mostrando productos. Cuando tu operación lo necesite, ya tienes una base para vender, controlar y dar seguimiento desde el mismo ecosistema.</p></div>
          <div className="catalog-landing-ecosystem-grid">{ecosystemFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div>
          <div className="catalog-landing-ecosystem-note"><div><span>R</span><p><strong>Un solo sistema.</strong><br />Menos herramientas separadas para operar tu negocio.</p></div><Link to="/pos">Conocer RAVEKH POS →</Link></div>
        </div>
      </section>

      <section className="catalog-landing-section catalog-landing-pricing" id="planes">
        <div className="catalog-landing-container">
          <div className="catalog-landing-heading catalog-landing-heading--center"><span>PLANES</span><h2>Empieza con lo que necesitas hoy.</h2><p>Todos entran al mismo sistema. Puedes comenzar gratis o activar más capacidad cuando tu negocio lo requiera.</p></div>
          <div className="catalog-landing-billing"><div>{(Object.keys(billingCycleCopy) as BillingCycle[]).map((cycle) => <button key={cycle} type="button" className={billingCycle === cycle ? "is-active" : ""} onClick={() => setBillingCycle(cycle)}>{billingCycleCopy[cycle].label}</button>)}</div><p>{activeBilling.helper}</p></div>
          <div className="catalog-landing-plan-guidance">
            <strong>¿Cuál te conviene?</strong>
            <p><b>Gratis</b> para explorar · <b>Básico</b> para publicar sin límite de productos · <b>Intermedio</b> para crecer · <b>Pro</b> para soporte prioritario y facturación.</p>
          </div>
          <div className="catalog-landing-pricing-grid">
            {catalogPlans.map((plan) => {
              const isStart = plan.checkoutPlanKey === "START";
              const presentation = planPresentation[plan.name];
              const displayedPrice = billingCycle === "monthly" && isStart ? `$${START_INTRO_PRICE} MXN` : plan.prices[billingCycle];
              return <article key={plan.name} className={`catalog-landing-plan ${plan.recommended ? "catalog-landing-plan--recommended" : ""}`}>
                {plan.recommended ? <span className="catalog-landing-plan__badge">IDEAL PARA EMPEZAR A VENDER</span> : null}
                <div className="catalog-landing-plan__name"><span>{plan.name}</span><h3>{presentation.highlight}</h3><p className="catalog-landing-plan__audience">{presentation.audience}</p></div>
                <div className="catalog-landing-plan__price"><strong>{displayedPrice}</strong><span>{billingCycle === "monthly" && isStart ? "el primer mes" : plan.periodLabel[billingCycle]}</span></div>
                {billingCycle === "monthly" && isStart ? <p className="catalog-landing-plan__note">A partir del segundo mes: {startPlan?.prices.monthly} / mes.</p> : billingCycle === "annual" && plan.annualNote ? <p className="catalog-landing-plan__note">{plan.annualNote} · cobro anual</p> : <div className="catalog-landing-plan__note-spacer" />}
                <p className="catalog-landing-plan__includes">LO QUE INCLUYE</p>
                <ul>{presentation.additions.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}</ul>
                {presentation.caveat ? <p className="catalog-landing-plan__caveat">{presentation.caveat}</p> : null}
                <button type="button" className={plan.recommended ? "catalog-landing-plan__button catalog-landing-plan__button--primary" : "catalog-landing-plan__button"} onClick={() => choosePlan(plan)}>{plan.name === FREE_CATALOG_PLAN_NAME ? "Comenzar gratis" : `Elegir ${plan.name.replace("Catálogo ", "")}`}</button>
              </article>;
            })}
          </div>
          <div className="catalog-landing-comparison" id="comparar-planes">
            <div className="catalog-landing-comparison__heading"><div><span>COMPARACIÓN DETALLADA</span><h3>Las diferencias, sin letra pequeña.</h3></div><p>Compara lo que está descrito actualmente en la configuración de los paquetes.</p></div>
            <div className="catalog-landing-comparison__scroll"><table><thead><tr><th scope="col">Función</th>{catalogPlans.map(plan => <th scope="col" key={plan.name}>{plan.name.replace("Catálogo ", "")}</th>)}</tr></thead><tbody>{comparisonRows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table></div>
            <p className="catalog-landing-comparison__disclaimer">* La configuración disponible no detalla las funciones exactas ni los límites de seguimiento comercial en Intermedio/Pro. “No anunciado” no necesariamente significa que una función esté deshabilitada. Confirma los alcances antes de contratar.</p>
          </div>
          <p className="catalog-landing-pricing-footnote">Precios tomados de la configuración de tu proyecto. En Básico mensual: $189 MXN el primer mes y $299 MXN al mes después. En anual, el cobro se realiza por 12 meses.</p>
        </div>
      </section>

      <section className="catalog-landing-final">
        <div className="catalog-landing-container catalog-landing-final__inner"><div><span>¿LISTO PARA DEJAR DE MANDAR FOTOS?</span><h2>Convierte tus productos en un catálogo que vende contigo.</h2></div><div><a className="catalog-landing-button catalog-landing-button--light" href="#planes">Crear mi catálogo</a><a className="catalog-landing-final__whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Hablar por WhatsApp →</a></div></div>
      </section>

      <footer className="catalog-landing-footer"><div className="catalog-landing-container"><Link className="catalog-landing-brand catalog-landing-brand--footer" to="/"><span>R</span><div><strong>RAVEKH</strong><small>SOFTWARE PARA NEGOCIOS</small></div></Link><p>Catálogo digital, punto de venta y herramientas para operar mejor.</p><div><Link to="/politicas">Políticas</Link><Link to={LOGIN_POS_PATH}>Entrar al sistema</Link></div></div></footer>

      <FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={() => setLoginModalPlan(null)} />
      <FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={() => setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado y entrar al sistema." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount: unlockModalPlan.amount, plan: unlockModalPlan.plan, label: unlockModalPlan.name } : undefined} onPaymentSuccess={() => navigate(MAIN_SALES_PATH)} />
    </main>
  );
};
