import { useState, useEffect } from "react";
import { FreeCatalogLoginModal } from "../../main-catalog/components/FreeCatalogLoginModal";
import { FeatureUnlockModal } from "../../pos/shared/ui/FeatureUnlockModal";
import { trackMetaEvent } from "../../../../../scripts/metaPixel";
import {
  billingCycleCopy,
  buildCatalogCheckoutPlan,
  catalogPlans,
  FREE_CATALOG_PLAN_NAME,
  hasStoredPosSession,
  LOGIN_POS_PATH,
  type BillingCycle,
  type CatalogCheckoutPlan,
} from "./catalogPricingShared";

const C = {
  bg:      "#F5F5F0",
  bgAlt:   "#EBEBE4",
  dark:    "#141410",
  card:    "#FFFFFF",
  green:   "#1A7A3C",
  greenLt: "#25A050",
  muted:   "#6B6B60",
  border:  "#D4D4C8",
  borderDk:"#252520",
  white:   "#F5F5F0",
};

function FontLoader() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
  }, []);
  return null;
}

const Label = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: light ? "rgba(245,245,240,.4)" : C.green, display: "block", marginBottom: 16 }}>{children}</span>
);

function MockupPlaceholder({ label, height = 400, note }: { label: string; height?: number; note?: string }) {
  return (
    <div style={{ width: "100%", height, background: C.bgAlt, border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="2" stroke={C.green} strokeWidth="1" opacity=".35"/>
        <path d="M10 28 L10 20 L16 14 L22 18 L28 10 L28 28 Z" stroke={C.green} strokeWidth="1" fill="none" opacity=".4"/>
      </svg>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: C.muted, margin: 0, letterSpacing: 1, textAlign: "center", padding: "0 20px" }}>{label}</p>
      {note && <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: C.border, margin: 0 }}>{note}</p>}
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: "0 clamp(20px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(245,245,240,.97)" : "transparent", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all .3s" }}>
      <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 22, fontWeight: 600, color: scrolled ? C.dark : C.white }}>Ravekh</span>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[["Beneficios", "#beneficios"], ["Cómo funciona", "#como-funciona"], ["Planes", "#planes"]].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: scrolled ? C.muted : "rgba(245,245,240,.6)", textDecoration: "none", fontWeight: 500 }}>{l}</a>
        ))}
        <a href="#planes" style={{ padding: "10px 22px", background: C.green, color: C.white, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Empezar gratis</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ background: C.dark, minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px clamp(20px,6vw,80px) 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(245,245,240,.02) 0px, rgba(245,245,240,.02) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(245,245,240,.02) 0px, rgba(245,245,240,.02) 1px, transparent 1px, transparent 40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "5%", top: "20%", width: 500, height: 500, background: `radial-gradient(circle, rgba(26,122,60,.15) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
        <Label light>Catálogo digital para abarrotes y misceláneas</Label>
        <h1 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(36px,5.5vw,72px)", fontWeight: 600, color: C.white, margin: "0 0 28px", lineHeight: 1.1 }}>
          Tu tienda de siempre,<br />
          <span style={{ color: C.greenLt }}>ordenada en un link</span>
        </h1>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 17, color: "rgba(245,245,240,.5)", maxWidth: 540, lineHeight: 1.7, margin: "0 0 44px" }}>
          Muestra todo lo que tienes —abarrotes, lácteos, limpieza, botanas— en un catálogo claro. Tus clientes ven los precios, eligen lo que necesitan y te mandan el pedido por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="#planes" style={{ padding: "16px 36px", background: C.green, color: C.white, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Crear mi catálogo gratis</a>
          <a href="#como-funciona" style={{ padding: "16px 36px", border: `1px solid rgba(245,245,240,.2)`, color: "rgba(245,245,240,.55)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, textDecoration: "none" }}>Ver cómo funciona</a>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const pains = [
    { icon: "📋", title: '"¿Qué tienes?" todo el día', desc: "Tus clientes te llaman o mandan mensajes para saber si tienes algo. Tú interrumpes lo que estás haciendo para responder." },
    { icon: "💸", title: '"¿A cómo está?" sin parar', desc: "Preguntan precio por precio por WhatsApp. Sin una lista clara, tú respondes y ellos siguen preguntando." },
    { icon: "🛒", title: "Pedidos mal entendidos", desc: "El cliente pide de memoria y llegan cosas de más, de menos o que no eran. Devoluciones, molestias, tiempo perdido." },
  ];
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>El problema</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 600, color: C.dark, margin: 0 }}>Atender pedidos por WhatsApp<br /><span style={{ color: C.green }}>quita demasiado tiempo</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 1 }}>
          {pains.map((p, i) => (
            <div key={p.title} style={{ padding: "40px 32px", background: i % 2 === 0 ? C.card : C.bgAlt, borderTop: `3px solid ${i === 0 ? C.green : C.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, fontWeight: 600, color: C.dark, margin: "0 0 12px" }}>{p.title}</h3>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Carga tus productos", desc: "Agrega lo que tienes con foto, precio y categoría. Lácteos, abarrotes, refrescos, limpieza — cada sección donde debe estar." },
    { n: "02", title: "Comparte el link", desc: "Un solo link para mandar por WhatsApp o poner en tus estados. Tu cliente abre el catálogo desde su celular, sin apps." },
    { n: "03", title: "Recibe el pedido armado", desc: "El cliente selecciona lo que necesita y te manda el pedido completo por WhatsApp. Tú lo preparas y listo." },
  ];
  return (
    <section id="como-funciona" style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label>Cómo funciona</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 600, color: C.dark, margin: 0 }}>Simple, rápido<br /><span style={{ color: C.green }}>y sin complicaciones</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {steps.map(s => (
            <div key={s.n} style={{ padding: "48px 36px", background: C.card, borderLeft: `4px solid ${C.green}` }}>
              <p style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 52, fontWeight: 600, color: C.border, margin: "0 0 20px", lineHeight: 1 }}>{s.n}</p>
              <h3 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, fontWeight: 600, color: C.dark, margin: "0 0 12px" }}>{s.title}</h3>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    { title: "Categorías por departamento", desc: "Separa abarrotes, lácteos, carnes, limpieza, botanas y más. Tus clientes encuentran lo que buscan solos." },
    { title: "Precios siempre visibles", desc: "No más responder precios uno por uno. Tu cliente ve todo en el catálogo antes de escribirte." },
    { title: "Pedidos por WhatsApp", desc: "El cliente elige, tú recibes el pedido completo. Sin vaivén de mensajes, sin errores." },
    { title: "Actualiza al momento", desc: "¿Se acabó algo? ¿Subió el precio? Lo cambias en segundos desde tu teléfono." },
    { title: "Sin descarga de apps", desc: "Tus clientes abren el link directo en su navegador. Sin registros, sin instalaciones." },
    { title: "Funciona en cualquier celular", desc: "Desde el último iPhone hasta el Android más sencillo. Si tiene internet, abre el catálogo." },
  ];
  return (
    <section id="beneficios" style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label light>Beneficios</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 600, color: C.white, margin: 0 }}>Hecho para tiendas<br /><span style={{ color: C.greenLt }}>que quieren vender mejor</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 1 }}>
          {benefits.map(b => (
            <div key={b.title} style={{ padding: "36px 32px", background: "#1A1A14", borderBottom: `1px solid ${C.borderDk}`, borderRight: `1px solid ${C.borderDk}` }}>
              <div style={{ width: 4, height: 32, background: C.green, marginBottom: 20 }} />
              <h3 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, fontWeight: 600, color: C.white, margin: "0 0 10px" }}>{b.title}</h3>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "rgba(245,245,240,.4)", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>La experiencia</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 600, color: C.dark, margin: 0 }}>Tu tienda, ordenada<br /><span style={{ color: C.green }}>en un link</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "end" }}>
          <MockupPlaceholder label="Vista del catálogo de tu tienda" height={480} note="Screenshot de la app aquí" />
          <MockupPlaceholder label="Sección de productos con precio" height={360} note="Screenshot producto" />
          <MockupPlaceholder label="Pedido recibido en WhatsApp" height={360} note="Screenshot pedido" />
        </div>
      </div>
    </section>
  );
}

function Social() {
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)", textAlign: "center" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ height: 3, background: C.green, width: 48, margin: "0 auto 48px" }} />
        <blockquote style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(20px,2.8vw,32px)", color: C.dark, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 32px" }}>
          "Mis clientes ven los precios en el link y me mandan el pedido completo. Ya no me interrumpen cada rato para preguntar qué tengo."
        </blockquote>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.green, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>— Nombre del cliente</p>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.muted }}>Abarrotes y miscelánea · Ciudad, México</p>
        <div style={{ height: 3, background: C.green, width: 48, margin: "48px auto 0" }} />
      </div>
    </section>
  );
}

function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const activeBilling = billingCycleCopy[billingCycle];
  return (
    <section id="planes" style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Label>Planes</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 600, color: C.dark, margin: "0 0 16px" }}>Empieza hoy.<br /><span style={{ color: C.green }}>Sin complicaciones.</span></h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, color: C.muted, margin: 0 }}>Sin contratos. Sin letra chica.</p>
        </div>
        <div role="group" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle => (
            <button key={cycle} type="button" onClick={() => setBillingCycle(cycle)} style={{ padding: "10px 22px", border: `1px solid ${billingCycle === cycle ? C.green : C.border}`, background: billingCycle === cycle ? C.green : "transparent", color: billingCycle === cycle ? C.white : C.muted, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>{billingCycleCopy[cycle].label}</button>
          ))}
        </div>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, textAlign: "center", margin: "0 0 36px" }}>{activeBilling.helper}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
          {catalogPlans.map(p => (
            <div key={p.name} style={{ padding: "44px 28px", border: p.recommended ? `2px solid ${C.green}` : `1px solid ${C.border}`, background: C.card, position: "relative", display: "flex", flexDirection: "column" }}>
              {p.recommended && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: C.green, color: C.white, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 20px" }}>Recomendado</div>}
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, letterSpacing: 3, color: C.green, textTransform: "uppercase", margin: "0 0 12px", fontWeight: 700 }}>{p.name}</p>
              <h3 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, color: C.dark, fontWeight: 600, margin: "0 0 8px" }}>{p.limit}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "24px 0 8px" }}>
                <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 40, color: p.recommended ? C.green : C.dark, fontWeight: 600 }}>{p.prices[billingCycle]}</span>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted }}>{p.periodLabel[billingCycle]}</span>
              </div>
              {billingCycle === "annual" && p.annualNote && <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.green, margin: "0 0 18px" }}>{p.annualNote}</p>}
              <ul style={{ margin: "18px 0 36px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {p.benefits.map(f => (
                  <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: C.green, fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={p.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(e) => { trackMetaEvent("Contact", { content_name: p.name, plan_price: p.prices[billingCycle] }); if (p.name !== FREE_CATALOG_PLAN_NAME) { e.preventDefault(); const plan = buildCatalogCheckoutPlan(p, billingCycle); if (!plan) return; if (!hasStoredPosSession()) { setLoginModalPlan(plan); return; } setUnlockModalPlan(plan); } }} style={{ display: "block", textAlign: "center", padding: "14px 0", background: p.recommended ? C.green : "transparent", border: p.recommended ? "none" : `1px solid ${C.border}`, color: p.recommended ? C.white : C.muted, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>Elegir plan</a>
            </div>
          ))}
        </div>
      </div>
      <FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={() => setLoginModalPlan(null)} />
      <FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={() => setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount: unlockModalPlan.amount, plan: unlockModalPlan.plan, label: unlockModalPlan.name } : undefined} onPaymentSuccess={() => { window.location.href = "/MainSales"; }} />
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Cuántos productos puedo poner?", a: "El plan Básico incluye una cantidad limitada. El plan Pro te da más capacidad para una tienda con mucho surtido." },
    { q: "¿Mis clientes tienen que descargar algo?", a: "No. Solo abren el link en su navegador. Funciona en cualquier celular sin apps ni registros." },
    { q: "¿Puedo organizar mis productos por sección?", a: "Sí. Crea categorías como abarrotes, lácteos, carnes, botanas, limpieza — lo que mejor te funcione." },
    { q: "¿Puedo actualizar precios cuando cambian?", a: "Cuando quieras, desde tu teléfono. El catálogo se actualiza al momento." },
    { q: "¿Cómo llegan los pedidos?", a: "Tu cliente selecciona lo que necesita y te manda el pedido por WhatsApp ya armado. Tú lo preparas y listo." },
  ];
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>Preguntas frecuentes</Label>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 600, color: C.dark, margin: 0 }}>Resolvemos tus dudas</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={f.q} style={{ borderTop: `1px solid ${C.border}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}) }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: C.dark }}>{f.q}</span>
              <span style={{ color: C.green, fontSize: 22, flexShrink: 0, marginLeft: 16, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            {open === i && <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.75, margin: "0 0 22px", paddingRight: 32 }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ background: C.green, padding: "120px clamp(20px,6vw,80px)", textAlign: "center" }}>
      <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(32px,5vw,60px)", fontWeight: 600, color: C.white, margin: "0 0 20px", lineHeight: 1.1 }}>Tu tienda merece<br /><em>atender con más orden</em></h2>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, color: "rgba(245,245,240,.75)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Deja de responder las mismas preguntas. Comparte un link y recibe pedidos claros.</p>
      <a href="#planes" style={{ display: "inline-block", padding: "18px 48px", background: C.white, color: C.green, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Crear mi catálogo gratis</a>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: C.dark, borderTop: `1px solid ${C.borderDk}`, padding: "40px clamp(20px,5vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, color: C.greenLt, fontWeight: 600 }}>Ravekh</span>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "rgba(245,245,240,.3)", margin: 0 }}>© {new Date().getFullYear()} Ravekh · Catálogo digital para abarrotes</p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Términos", "Privacidad", "Contacto"].map(l => <a key={l} href="#" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "rgba(245,245,240,.3)", textDecoration: "none" }}>{l}</a>)}
      </div>
    </footer>
  );
}

export function RavekhAbarrotesPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <FontLoader />
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Benefits />
      <Showcase />
      <Social />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}