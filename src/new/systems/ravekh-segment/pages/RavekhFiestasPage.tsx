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

/* ─── tokens ─────────────────────────────────────────── */
const C = {
  bg:       "#FFFEF5",
  bgAlt:    "#FFF8E0",
  dark:     "#120A00",
  card:     "#FFFFFF",
  magenta:  "#D4006A",
  magentaLt:"#F0208A",
  yellow:   "#FFD000",
  muted:    "#7A6648",
  border:   "#F0D898",
  borderDk: "#2A1A00",
  white:    "#FFFEF5",
};

function FontLoader() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
  }, []);
  return null;
}

const Label = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: light ? "rgba(255,254,245,.5)" : C.magenta, display: "block", marginBottom: 16 }}>{children}</span>
);

function MockupPlaceholder({ label, height = 400, note }: { label: string; height?: number; note?: string }) {
  return (
    <div style={{ width: "100%", height, background: "#FFF0F8", border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="4" stroke={C.magenta} strokeWidth="1" opacity=".35"/>
        <path d="M20 8 L22 14 L28 14 L23 18 L25 24 L20 20 L15 24 L17 18 L12 14 L18 14 Z" stroke={C.magenta} strokeWidth="1" fill="none" opacity=".5"/>
      </svg>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.muted, margin: 0, letterSpacing: 1, textAlign: "center", padding: "0 20px" }}>{label}</p>
      {note && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.border, margin: 0 }}>{note}</p>}
    </div>
  );
}

/* ─── NAV ─────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: "0 clamp(20px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(255,254,245,.97)" : "transparent", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all .3s" }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.dark, letterSpacing: 2 }}>Ravekh</span>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[["Beneficios", "#beneficios"], ["Cómo funciona", "#como-funciona"], ["Planes", "#planes"]].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textDecoration: "none", fontWeight: 500 }}>{l}</a>
        ))}
        <a href="#planes" style={{ padding: "10px 22px", background: C.magenta, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>Empezar gratis</a>
      </div>
    </nav>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ background: C.dark, minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px clamp(20px,6vw,80px) 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,0,106,.2) 0%, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "30%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,208,0,.1) 0%, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
        <Label light>Catálogo digital para fiestas e inflables</Label>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(40px,6vw,80px)", fontWeight: 800, color: C.white, margin: "0 0 28px", lineHeight: 1 }}>
          Muestra todo lo que<br />
          <span style={{ color: C.magenta }}>rentas</span> en un solo link
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "rgba(255,254,245,.55)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 44px" }}>
          Inflables, sillas, mesas, sonido, decoración — todo organizado con foto, precio y disponibilidad. Tus clientes eligen y te escriben con el pedido armado por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="#planes" style={{ padding: "16px 36px", background: C.magenta, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Crear mi catálogo gratis</a>
          <a href="#como-funciona" style={{ padding: "16px 36px", border: `1px solid rgba(255,254,245,.2)`, color: "rgba(255,254,245,.6)", fontFamily: "Inter, sans-serif", fontSize: 14, textDecoration: "none" }}>Ver cómo funciona</a>
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM ─────────────────────────────────────────── */
function Problem() {
  const pains = [
    { icon: "📱", title: "Respondiendo lo mismo todo el día", desc: "\"¿Tienen castillo de 4x4?\", \"¿Cuánto cobran por las sillas?\" — las mismas preguntas, una y otra vez." },
    { icon: "😵", title: "Clientes que no saben qué tienes", desc: "Mandas listas por WhatsApp pero nadie las lee bien. El cliente termina confundido o se va con la competencia." },
    { icon: "📋", title: "Pedidos que hay que confirmar dos veces", desc: "El cliente pide algo, tú confirmas disponibilidad, él cambia de opinión. El proceso se alarga sin necesidad." },
  ];
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>El problema</Label>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.dark, margin: 0 }}>Vender rentas por WhatsApp<br /><span style={{ color: C.magenta }}>quita demasiado tiempo</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {pains.map(p => (
            <div key={p.title} style={{ padding: "36px 28px", background: C.card, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.magenta}` }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>{p.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Carga tu inventario de rentas", desc: "Agrega cada artículo con foto, precio por evento y descripción. Inflables, mobiliario, sonido — todo en un lugar." },
    { n: "02", title: "Comparte el link con tus clientes", desc: "Un link que mandas por WhatsApp, Instagram o Facebook. Tu cliente navega solo, sin que tengas que guiarlo." },
    { n: "03", title: "Recibe el pedido listo para cotizar", desc: "El cliente selecciona lo que necesita y te lo manda directo por WhatsApp. Tú solo confirmas fechas y cierras la venta." },
  ];
  return (
    <section id="como-funciona" style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label>Cómo funciona</Label>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.dark, margin: 0 }}>Tres pasos.<br /><span style={{ color: C.magenta }}>Sin complicaciones.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ padding: "48px 36px", background: C.card, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 20, right: 24, fontFamily: "'Syne', sans-serif", fontSize: 80, fontWeight: 800, color: i === 0 ? "rgba(212,0,106,.07)" : i === 1 ? "rgba(255,208,0,.12)" : "rgba(212,0,106,.07)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ width: 40, height: 40, background: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: C.white }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>{s.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BENEFITS ─────────────────────────────────────────── */
function Benefits() {
  const benefits = [
    { title: "Por categoría de renta", desc: "Separa inflables, mesas y sillas, sonido, decoración, brincas — cada cosa donde el cliente la espera encontrar." },
    { title: "Con fotos reales de tus artículos", desc: "Una foto vale más que mil descripciones. El cliente ve exactamente lo que va a rentar." },
    { title: "Precios claros desde el catálogo", desc: "Sin preguntarle a nadie. El cliente sabe cuánto cuesta desde que navega, y llega más decidido a contratar." },
    { title: "Pedidos armados por WhatsApp", desc: "El cliente selecciona lo que quiere y te lo manda. Tú solo confirmas fecha y disponibilidad." },
    { title: "Actualiza cuando quieras", desc: "¿Se dañó un inflable? ¿Subiste precios? Lo cambias en segundos desde tu teléfono." },
    { title: "Funciona en cualquier celular", desc: "Tus clientes abren un link desde su navegador. Sin descargar nada, sin registrarse." },
  ];
  return (
    <section id="beneficios" style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label light>Beneficios</Label>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.white, margin: 0 }}>Todo lo que necesitas<br /><span style={{ color: C.magenta }}>para rentar con orden</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {benefits.map(b => (
            <div key={b.title} style={{ padding: "32px 28px", background: "#180A00", border: `1px solid ${C.borderDk}` }}>
              <div style={{ width: 28, height: 28, background: C.magenta, marginBottom: 20 }} />
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>{b.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,254,245,.4)", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SHOWCASE ─────────────────────────────────────────── */
function Showcase() {
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>La experiencia</Label>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.dark, margin: 0 }}>Tu catálogo de rentas,<br /><span style={{ color: C.magenta }}>siempre disponible</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "end" }}>
          <MockupPlaceholder label="Vista del catálogo de rentas" height={480} note="Screenshot de la app aquí" />
          <MockupPlaceholder label="Detalle del artículo con precio" height={360} note="Screenshot producto" />
          <MockupPlaceholder label="Pedido recibido en WhatsApp" height={360} note="Screenshot pedido" />
        </div>
      </div>
    </section>
  );
}

/* ─── SOCIAL PROOF ─────────────────────────────────────── */
function Social() {
  return (
    <section style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: `radial-gradient(circle, rgba(212,0,106,.08) 0%, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
        <div style={{ fontSize: 48, marginBottom: 32 }}>🎉</div>
        <blockquote style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px,3vw,32px)", color: C.white, fontWeight: 600, lineHeight: 1.4, margin: "0 0 32px" }}>
          "Antes tardaba horas mandando listas y cotizaciones. Ahora mando mi link y el cliente llega con el pedido listo."
        </blockquote>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.magenta, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>— Nombre del cliente</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,254,245,.35)" }}>Renta de inflables y mobiliario · Ciudad, México</p>
      </div>
    </section>
  );
}

/* ─── PRICING ─────────────────────────────────────────── */
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
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.dark, margin: "0 0 16px" }}>Empieza hoy.<br /><span style={{ color: C.magenta }}>Crece a tu ritmo.</span></h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: C.muted, margin: 0 }}>Sin contratos largos. Sin letra chica.</p>
        </div>
        <div role="group" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle => (
            <button key={cycle} type="button" onClick={() => setBillingCycle(cycle)} style={{ padding: "10px 22px", border: `1px solid ${billingCycle === cycle ? C.magenta : C.border}`, background: billingCycle === cycle ? C.magenta : "transparent", color: billingCycle === cycle ? C.white : C.muted, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>{billingCycleCopy[cycle].label}</button>
          ))}
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textAlign: "center", margin: "0 0 36px" }}>{activeBilling.helper}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
          {catalogPlans.map(p => (
            <div key={p.name} style={{ padding: "44px 28px", border: p.recommended ? `2px solid ${C.magenta}` : `1px solid ${C.border}`, background: C.card, position: "relative", display: "flex", flexDirection: "column" }}>
              {p.recommended && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: C.magenta, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 20px" }}>Recomendado</div>}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: 3, color: C.magenta, textTransform: "uppercase", margin: "0 0 12px" }}>{p.name}</p>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.dark, fontWeight: 700, margin: "0 0 8px" }}>{p.limit}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "24px 0 8px" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, color: p.recommended ? C.magenta : C.dark, fontWeight: 700 }}>{p.prices[billingCycle]}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>{p.periodLabel[billingCycle]}</span>
              </div>
              {billingCycle === "annual" && p.annualNote && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.magenta, margin: "0 0 18px" }}>{p.annualNote}</p>}
              <ul style={{ margin: "18px 0 36px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {p.benefits.map(f => (
                  <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: C.magenta, fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={p.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(e) => { trackMetaEvent("Contact", { content_name: p.name, plan_price: p.prices[billingCycle] }); if (p.name !== FREE_CATALOG_PLAN_NAME) { e.preventDefault(); const plan = buildCatalogCheckoutPlan(p, billingCycle); if (!plan) return; if (!hasStoredPosSession()) { setLoginModalPlan(plan); return; } setUnlockModalPlan(plan); } }} style={{ display: "block", textAlign: "center", padding: "14px 0", background: p.recommended ? C.magenta : "transparent", border: p.recommended ? "none" : `1px solid ${C.border}`, color: p.recommended ? C.white : C.muted, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>Elegir plan</a>
            </div>
          ))}
        </div>
      </div>
      <FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={() => setLoginModalPlan(null)} />
      <FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={() => setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount: unlockModalPlan.amount, plan: unlockModalPlan.plan, label: unlockModalPlan.name } : undefined} onPaymentSuccess={() => { window.location.href = "/MainSales"; }} />
    </section>
  );
}

/* ─── FAQ ──────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Puedo poner disponibilidad o fechas en mi catálogo?", a: "Puedes agregar notas de disponibilidad por artículo. Para reservas con fechas específicas, el cliente te las confirma directamente por WhatsApp." },
    { q: "¿Cómo ven mis clientes los precios de renta?", a: "Pones el precio por evento o por día junto a cada artículo. El cliente lo ve antes de escribirte, así llega más decidido." },
    { q: "¿Puedo organizar inflables, mesas y sonido por separado?", a: "Sí. Creas las categorías que necesites: inflables, mobiliario, sonido, decoración, paquetes — lo que mejor le acomode a tu negocio." },
    { q: "¿Mis clientes tienen que descargar algo?", a: "No. Solo abren el link desde su navegador. Funciona en cualquier celular, sin apps, sin registros." },
    { q: "¿Qué pasa si cambio precios o se daña un artículo?", a: "Actualizas desde tu teléfono en segundos. Ocultas el artículo o cambias el precio y el catálogo se actualiza al momento." },
  ];
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>Preguntas frecuentes</Label>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 700, color: C.dark, margin: 0 }}>Resolvemos tus dudas</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={f.q} style={{ borderTop: `1px solid ${C.border}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}) }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, color: C.dark, fontWeight: 600 }}>{f.q}</span>
              <span style={{ color: C.magenta, fontSize: 22, flexShrink: 0, marginLeft: 16, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            {open === i && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.75, margin: "0 0 22px", paddingRight: 32 }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FINAL CTA ─────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ background: C.dark, padding: "120px clamp(20px,6vw,80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: `radial-gradient(circle, rgba(212,0,106,.1) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <Label light>Empieza hoy</Label>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 800, color: C.white, margin: "0 0 20px", lineHeight: 1.05 }}>Tu negocio de rentas merece<br /><span style={{ color: C.magenta }}>venderse con orden</span></h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,254,245,.5)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Muestra todo lo que tienes, recibe pedidos claros y cierra ventas más rápido.</p>
        <a href="#planes" style={{ display: "inline-block", padding: "18px 48px", background: C.magenta, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Crear mi catálogo gratis</a>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "#0A0400", borderTop: `1px solid ${C.borderDk}`, padding: "40px clamp(20px,5vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.magenta, fontWeight: 800 }}>Ravekh</span>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,254,245,.3)", margin: 0 }}>© {new Date().getFullYear()} Ravekh · Catálogo digital para fiestas e inflables</p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Términos", "Privacidad", "Contacto"].map(l => <a key={l} href="#" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,254,245,.3)", textDecoration: "none" }}>{l}</a>)}
      </div>
    </footer>
  );
}

export function RavekhFiestasPage() {
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