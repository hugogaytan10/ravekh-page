import { useState } from "react";
import { Link } from "react-router-dom";
import "./CrmLandingPage.css";

const CONTACT_URL =
  "https://wa.me/525653989702?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20RAVEKH%20CRM";

const features = [
  {
    icon: "chat",
    title: "Conversaciones organizadas",
    text: "Centraliza los mensajes de clientes para atenderlos con orden y contexto.",
  },
  {
    icon: "contact",
    title: "Gestión de contactos",
    text: "Consulta y organiza la información de tus clientes y prospectos.",
  },
  {
    icon: "progress",
    title: "Seguimiento comercial",
    text: "Mantén la continuidad de conversaciones y oportunidades sin perder el hilo.",
  },
  {
    icon: "spark",
    title: "Asistencia con IA",
    text: "Herramientas configurables para apoyar la atención de cada negocio.",
  },
  {
    icon: "settings",
    title: "Configuración por negocio",
    text: "Cada empresa administra sus propias conexiones y preferencias.",
  },
];

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, JSX.Element> = {
    chat: <><path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></>,
    contact: <><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></>,
    progress: <><path d="M4 17l5-5 4 3 7-8"/><path d="M15 7h5v5"/></>,
    spark: <><path d="M12 3l1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3Z"/><path d="M5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1A7 7 0 0 0 15 6l-.4-2.7h-4L10 6a7 7 0 0 0-1.5 1L6 6 4 9.4 6 11a7 7 0 0 0 0 2l-2 1.6L6 18l2.5-1a7 7 0 0 0 1.5 1l.5 2.7h4L15 18a7 7 0 0 0 1.5-1l2.5 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const ProductPreview = () => (
  <figure className="crm-preview" aria-labelledby="crm-preview-caption">
    <div className="crm-preview__bar">
      <span className="crm-preview__brand">R</span>
      <span>Conversaciones</span>
      <span className="crm-preview__status">Vista conceptual</span>
    </div>
    <div className="crm-preview__body">
      <div className="crm-preview__list" aria-hidden="true">
        <div className="crm-preview__search">Buscar conversación</div>
        {["Cliente nuevo", "Pedido pendiente", "Seguimiento"].map((label, index) => (
          <div className={`crm-preview__person ${index === 0 ? "is-active" : ""}`} key={label}>
            <span className="crm-preview__avatar">{index + 1}</span>
            <span><strong>{label}</strong><small>{index === 0 ? "Gracias por la información" : "Conversación de ejemplo"}</small></span>
          </div>
        ))}
      </div>
      <div className="crm-preview__conversation" aria-hidden="true">
        <div className="crm-preview__contact"><span className="crm-preview__avatar">1</span><strong>Cliente nuevo</strong></div>
        <div className="crm-preview__messages">
          <span>Hola, quiero conocer sus servicios.</span>
          <span>Con gusto. ¿Cómo podemos ayudarte?</span>
          <span>Busco una solución para mi negocio.</span>
        </div>
        <div className="crm-preview__composer">Escribe un mensaje… <b>Enviar</b></div>
      </div>
      <aside className="crm-preview__details" aria-hidden="true">
        <span className="crm-preview__avatar crm-preview__avatar--large">1</span>
        <strong>Cliente nuevo</strong>
        <small>Contacto de demostración</small>
        <dl><div><dt>Estado</dt><dd>En seguimiento</dd></div><div><dt>Origen</dt><dd>WhatsApp</dd></div></dl>
      </aside>
    </div>
    <figcaption id="crm-preview-caption">Representación conceptual de la experiencia. El producto se encuentra en desarrollo.</figcaption>
  </figure>
);

export const CrmLandingPage = (): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="crm-page">
      <a className="crm-skip" href="#contenido">Saltar al contenido</a>
      <header className="crm-nav">
        <div className="crm-container crm-nav__inner">
          <Link className="crm-logo" to="/" aria-label="RAVEKH, volver al inicio">
            <img src="/ravekh.png" width="48" height="27" alt="" />
            <span>RAVEKH <b>CRM</b></span>
          </Link>
          <button className="crm-nav__toggle" type="button" aria-expanded={menuOpen} aria-controls="crm-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="sr-only">Abrir menú</span><i/><i/><i/>
          </button>
          <nav id="crm-navigation" className={menuOpen ? "is-open" : ""} aria-label="Navegación principal">
            <a href="#funcionalidades" onClick={closeMenu}>Funcionalidades</a>
            <a href="#como-funciona" onClick={closeMenu}>Cómo funciona</a>
            <a href="#privacidad" onClick={closeMenu}>Privacidad</a>
            <a className="crm-button crm-button--small" href={CONTACT_URL} target="_blank" rel="noreferrer">Conocer el CRM</a>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section className="crm-hero">
          <div className="crm-container crm-hero__grid">
            <div className="crm-hero__copy">
              <span className="crm-kicker"><i/> Producto en desarrollo</span>
              <h1>Tus conversaciones.<br/>Tus clientes. <em>Un solo lugar.</em></h1>
              <p>RAVEKH CRM es una plataforma para administrar conversaciones de WhatsApp Business, organizar contactos y facilitar el seguimiento de tus clientes desde una experiencia sencilla.</p>
              <div className="crm-actions">
                <a className="crm-button" href="#funcionalidades">Conocer RAVEKH CRM</a>
                <a className="crm-button crm-button--ghost" href="#como-funciona">Cómo funciona <span aria-hidden="true">↓</span></a>
              </div>
              <small>La disponibilidad pública y algunas capacidades aún están sujetas a desarrollo y autorización.</small>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section className="crm-section crm-conversation" id="funcionalidades">
          <div className="crm-container">
            <div className="crm-heading"><span className="crm-eyebrow">Una atención más clara</span><h2>Todo en una sola conversación</h2><p>Contexto, contacto y seguimiento reunidos para que cada interacción continúe donde se quedó.</p></div>
            <div className="crm-flow">
              <div><span>01</span><strong>Visualiza</strong><p>Revisa conversaciones desde una bandeja organizada.</p></div>
              <div><span>02</span><strong>Responde</strong><p>Atiende desde la aplicación con el contexto disponible.</p></div>
              <div><span>03</span><strong>Conoce</strong><p>Consulta la información asociada a cada contacto.</p></div>
              <div><span>04</span><strong>Continúa</strong><p>Retoma el seguimiento sin perder antecedentes.</p></div>
            </div>
          </div>
        </section>

        <section className="crm-section crm-features">
          <div className="crm-container">
            <div className="crm-heading crm-heading--split"><div><span className="crm-eyebrow">Capacidades planeadas</span><h2>Lo esencial para cuidar cada relación</h2></div><p>Estamos construyendo estas capacidades como parte de RAVEKH CRM. Su alcance y disponibilidad pueden cambiar durante el desarrollo.</p></div>
            <div className="crm-feature-grid">
              {features.map((feature) => <article key={feature.title}><span className="crm-icon"><Icon name={feature.icon}/></span><h3>{feature.title}</h3><p>{feature.text}</p><small>En desarrollo</small></article>)}
            </div>
          </div>
        </section>

        <section className="crm-section crm-steps" id="como-funciona">
          <div className="crm-container crm-steps__layout">
            <div className="crm-heading"><span className="crm-eyebrow">Cómo funciona</span><h2>De la conexión a la conversación</h2><p>Un flujo pensado para que cada negocio conserve el control de su cuenta y su operación.</p></div>
            <ol>
              <li><span>1</span><div><h3>Configura tu espacio</h3><p>Crea o prepara el espacio independiente de tu negocio en RAVEKH CRM.</p></div></li>
              <li><span>2</span><div><h3>Autoriza la conexión</h3><p>Conecta la cuenta de WhatsApp Business mediante el proceso autorizado.</p></div></li>
              <li><span>3</span><div><h3>Administra conversaciones</h3><p>Atiende y da seguimiento desde la experiencia móvil del CRM.</p></div></li>
            </ol>
          </div>
          <p className="crm-note crm-container">La conexión depende de los requisitos, permisos y autorizaciones aplicables de Meta. No todos los números o cuentas pueden ser elegibles.</p>
        </section>

        <section className="crm-section crm-whatsapp">
          <div className="crm-container crm-whatsapp__grid">
            <div><span className="crm-eyebrow">WhatsApp Business Platform</span><h2>Conecta tu negocio con tus clientes</h2><p>RAVEKH CRM está diseñado para integrar la plataforma oficial de WhatsApp Business y ofrecer las funciones de comunicación contratadas.</p><p className="crm-disclaimer">RAVEKH no es propietario de las cuentas de sus clientes y no afirma asociación, certificación o aprobación por parte de Meta.</p></div>
            <ul>
              <li><b>Tu cuenta, tu autorización.</b><span>La conexión requiere el permiso del negocio propietario.</span></li>
              <li><b>Datos para prestar el servicio.</b><span>Los mensajes e identificadores asociados se procesan para habilitar la comunicación.</span></li>
              <li><b>Configuración independiente.</b><span>Cada empresa utiliza y administra su propia cuenta de WhatsApp Business.</span></li>
              <li><b>Control de la conexión.</b><span>El negocio puede solicitar soporte para desconectar su integración.</span></li>
            </ul>
          </div>
        </section>

        <section className="crm-section crm-privacy" id="privacidad">
          <div className="crm-container crm-privacy__grid">
            <div><span className="crm-eyebrow">Privacidad y control</span><h2>Transparencia desde el primer contacto</h2></div>
            <div className="crm-privacy__content"><p>Para operar el servicio, RAVEKH CRM puede tratar mensajes, identificadores de WhatsApp e información de contactos que el negocio autorice. Estos datos se usan para habilitar la atención, organización y seguimiento solicitados.</p><p>Cuando una función de inteligencia artificial esté habilitada, cierta información podrá ser procesada por proveedores externos para generar asistencia. Su uso deberá configurarse y comunicarse conforme a la implementación disponible.</p><p>El acceso depende de los permisos concedidos. Para solicitar soporte, ejercer derechos sobre datos o gestionar una desconexión, utiliza nuestros canales oficiales.</p><div className="crm-text-links"><Link to="/politicas/ravekh-crm">Política de privacidad del CRM</Link><Link to="/terminos/ravekh-crm">Términos del servicio</Link><a href="mailto:ravekh@ravekh.com">ravekh@ravekh.com</a></div><small>Los documentos legales publicados son borradores informativos pendientes de validación legal.</small></div>
          </div>
        </section>

        <section className="crm-section crm-about">
          <div className="crm-container crm-about__inner"><div className="crm-about__mark">R</div><div><span className="crm-eyebrow">Acerca de RAVEKH</span><h2>Tecnología que ayuda a los negocios a avanzar</h2><p>RAVEKH desarrolla soluciones digitales para empresas. RAVEKH CRM forma parte de un ecosistema de herramientas comerciales que también incluye RAVEKH POS y experiencias de catálogo y fidelización.</p><Link to="/">Conocer RAVEKH <span aria-hidden="true">→</span></Link></div></div>
        </section>

        <section className="crm-final">
          <div className="crm-container"><span>RAVEKH CRM</span><h2>Una forma más sencilla de atender a tus clientes.</h2><p>Conoce cómo estamos desarrollando una experiencia de atención más organizada para los negocios.</p><a className="crm-button crm-button--light" href={CONTACT_URL} target="_blank" rel="noreferrer">Hablar con RAVEKH</a></div>
        </section>
      </main>

      <footer className="crm-footer"><div className="crm-container crm-footer__inner"><div><strong>RAVEKH <b>CRM</b></strong><p>Soluciones tecnológicas para negocios.</p></div><nav aria-label="Enlaces del pie"><Link to="/">RAVEKH</Link><Link to="/maincatalogo">RAVEKH POS</Link><Link to="/politicas/ravekh-crm">Privacidad</Link><Link to="/terminos/ravekh-crm">Términos</Link><a href="mailto:ravekh@ravekh.com">Contacto</a></nav><small>© {new Date().getFullYear()} RAVEKH</small></div></footer>
    </div>
  );
};
