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
  bg:      "#F9F7FF",
  bgAlt:   "#F0ECFF",
  dark:    "#0E0820",
  card:    "#FFFFFF",
  violet:  "#6B21E8",
  violetLt:"#8B45FF",
  pink:    "#F472B6",
  muted:   "#6B6580",
  border:  "#DDD8F4",
  borderDk:"#1E1240",
  white:   "#F9F7FF",
};

function FontLoader() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
  }, []);
  return null;
}

const Label = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: light ? "rgba(249,247,255,.45)" : C.violet, display: "block", marginBottom: 16 }}>{children}</span>
);

function MockupPlaceholder({ label, height = 400, note }: { label: string; height?: number; note?: string }) {
  return (
    <div style={{ width: "100%", height, background: "#F0ECFF", border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="20" stroke={C.violet} strokeWidth="1" opacity=".3"/>
        <circle cx="20" cy="16" r="6" stroke={C.violet} strokeWidth="1" opacity=".45"/>
        <path d="M8 32 Q20 24 32 32" stroke={C.violet} strokeWidth="1" fill="none" opacity=".4"/>
      </svg>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, margin: 0, letterSpacing: 1, textAlign: "center", padding: "0 20px" }}>{label}</p>
      {note && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.border, margin: 0 }}>{note}</p>}
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
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: "0 clamp(20px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(249,247,255,.97)" : "transparent", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all .3s" }}>
      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: C.dark, letterSpacing: 1 }}>Ravekh</span>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[["Beneficios", "#beneficios"], ["Cómo funciona", "#como-funciona"], ["Planes", "#planes"]].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, textDecoration: "none", fontWeight: 500 }}>{l}</a>
        ))}
        <a href="#planes" style={{ padding: "10px 22px", background: C.violet, color: C.white, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, textDecoration: "none", borderRadius: 4 }}>Empezar gratis</a>
      </div>
    </nav>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ background: C.dark, minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px clamp(20px,6vw,80px) 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, rgba(107,33,232,.25) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(244,114,182,.12) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 680, position: "relative", zIndex: 1 }}>
        <Label light>Catálogo digital para accesorios y bisutería</Label>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(40px,6vw,80px)", color: C.white, margin: "0 0 28px", lineHeight: 1.05, fontStyle: "italic" }}>
          Tus accesorios merecen<br />
          <span style={{ color: C.violetLt }}>verse tan bien</span><br />
          como son
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(249,247,255,.55)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 44px", fontWeight: 400 }}>
          Organiza collares, aretes, pulseras y más en un catálogo que tus clientas pueden ver desde su celular. Ellas eligen, tú recibes el pedido por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="#planes" style={{ padding: "16px 36px", background: C.violet, color: C.white, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 4 }}>Crear mi catálogo gratis</a>
          <a href="#como-funciona" style={{ padding: "16px 36px", border: `1px solid rgba(249,247,255,.2)`, color: "rgba(249,247,255,.6)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, textDecoration: "none", borderRadius: 4 }}>Ver cómo funciona</a>
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM ─────────────────────────────────────────── */
function Problem() {
  const pains = [
    { icon: "📱", title: "El álbum de WhatsApp hecho un caos", desc: "Fotos mezcladas, precios que ya no corresponden y clientas que no saben qué sigue disponible." },
    { icon: "⏰", title: "Respondiendo preguntas todo el día", desc: "\"¿Tienen en dorado?\", \"¿Cuánto cuesta este?\", \"¿Llegan a domicilio?\" — sin parar." },
    { icon: "😕", title: "Clientas que se pierden en el proceso", desc: "Te preguntan, ven las fotos, dicen que lo piensan y no vuelven. La venta muere por falta de claridad." },
  ];
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>El problema</Label>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", color: C.dark, margin: 0, fontStyle: "italic" }}>Vender accesorios por WhatsApp<br /><span style={{ color: C.violet }}>puede ser más fácil</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {pains.map(p => (
            <div key={p.title} style={{ padding: "36px 28px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: C.dark, margin: "0 0 12px", fontStyle: "italic" }}>{p.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
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
    { n: "01", title: "Sube tu colección", desc: "Agrega cada accesorio con foto, nombre, precio y material. Organízalos por tipo: aretes, collares, pulseras, anillos." },
    { n: "02", title: "Comparte el link", desc: "Un link que mandas por WhatsApp o pones en tu bio de Instagram. Tus clientas navegan solas, como en una tienda real." },
    { n: "03", title: "Recibe pedidos claros", desc: "Tu clienta elige lo que quiere y te manda el pedido armado por WhatsApp. Sin idas y vueltas, sin confusión." },
  ];
  return (
    <section id="como-funciona" style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label>Cómo funciona</Label>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", color: C.dark, margin: 0, fontStyle: "italic" }}>Sencillo de usar.<br /><span style={{ color: C.violet }}>Poderoso para vender.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {steps.map(s => (
            <div key={s.n} style={{ padding: "48px 32px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, borderRadius: "50%", marginBottom: 24 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: C.dark, margin: "0 0 12px", fontStyle: "italic" }}>{s.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
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
    { title: "Colecciones organizadas", desc: "Por tipo, color o temporada. Tus clientas encuentran lo que buscan sin preguntarte." },
    { title: "Fotos que enamoran", desc: "Sube las mejores fotos de cada pieza. Tu catálogo vende incluso cuando estás ocupada." },
    { title: "Precios siempre visibles", desc: "Tu clienta sabe cuánto cuesta sin tener que preguntar. Llega decidida a comprar." },
    { title: "Pedidos por WhatsApp", desc: "Selecciona, manda pedido, listo. Así de simple para tu clienta y para ti." },
    { title: "Variantes por pieza", desc: "¿El arete viene en plateado y dorado? El plan Pro te permite poner todas las opciones." },
    { title: "Sin tecnicismos", desc: "Si sabes subir una foto a Instagram, sabes usar Ravekh. Así de simple." },
  ];
  return (
    <section id="beneficios" style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label light>Beneficios</Label>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", color: C.white, margin: 0, fontStyle: "italic" }}>Hecho para negocios<br /><span style={{ color: C.violetLt }}>que venden con estilo</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {benefits.map(b => (
            <div key={b.title} style={{ padding: "32px 28px", background: "#140930", border: `1px solid ${C.borderDk}`, borderRadius: 8 }}>
              <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, borderRadius: "50%", marginBottom: 20 }} />
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: C.white, margin: "0 0 10px", fontStyle: "italic" }}>{b.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(249,247,255,.4)", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", color: C.dark, margin: 0, fontStyle: "italic" }}>Tu colección,<br /><span style={{ color: C.violet }}>presentada como merece</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "end" }}>
          <MockupPlaceholder label="Vista del catálogo de accesorios" height={480} note="Screenshot de la app aquí" />
          <MockupPlaceholder label="Detalle del accesorio con variantes" height={360} note="Screenshot producto" />
          <MockupPlaceholder label="Pedido recibido en WhatsApp" height={360} note="Screenshot pedido" />
        </div>
      </div>
    </section>
  );
}

/* ─── SOCIAL PROOF ─────────────────────────────────────── */
function Social() {
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)", textAlign: "center" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ width: 60, height: 4, background: `linear-gradient(to right, ${C.violet}, ${C.pink})`, borderRadius: 2, margin: "0 auto 48px" }} />
        <blockquote style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(22px,3vw,36px)", color: C.dark, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 32px" }}>
          "Mis clientas ya no me preguntan ¿tienes esto? ¿cuánto cuesta? — solo me mandan el pedido con lo que quieren. Es un sueño."
        </blockquote>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.violet, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px", fontWeight: 700 }}>— Nombre de la clienta</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>Bisutería y accesorios · Ciudad, México</p>
        <div style={{ width: 60, height: 4, background: `linear-gradient(to right, ${C.violet}, ${C.pink})`, borderRadius: 2, margin: "48px auto 0" }} />
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
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", color: C.dark, margin: "0 0 16px", fontStyle: "italic" }}>Empieza hoy.<br /><span style={{ color: C.violet }}>Crece a tu ritmo.</span></h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: C.muted, margin: 0 }}>Sin contratos. Sin sorpresas.</p>
        </div>
        <div role="group" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle => (
            <button key={cycle} type="button" onClick={() => setBillingCycle(cycle)} style={{ padding: "10px 22px", border: `1px solid ${billingCycle === cycle ? C.violet : C.border}`, background: billingCycle === cycle ? C.violet : "transparent", color: billingCycle === cycle ? C.white : C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>{billingCycleCopy[cycle].label}</button>
          ))}
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, textAlign: "center", margin: "0 0 36px" }}>{activeBilling.helper}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
          {catalogPlans.map(p => (
            <div key={p.name} style={{ padding: "44px 28px", border: p.recommended ? `2px solid ${C.violet}` : `1px solid ${C.border}`, background: C.card, borderRadius: 12, position: "relative", display: "flex", flexDirection: "column" }}>
              {p.recommended && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(to right, ${C.violet}, ${C.pink})`, color: C.white, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 20px", borderRadius: "0 0 4px 4px" }}>Recomendado</div>}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 3, color: C.violet, textTransform: "uppercase", margin: "0 0 12px", fontWeight: 700 }}>{p.name}</p>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: C.dark, margin: "0 0 8px", fontStyle: "italic" }}>{p.limit}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "24px 0 8px" }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, color: p.recommended ? C.violet : C.dark }}>{p.prices[billingCycle]}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>{p.periodLabel[billingCycle]}</span>
              </div>
              {billingCycle === "annual" && p.annualNote && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.violet, margin: "0 0 18px" }}>{p.annualNote}</p>}
              <ul style={{ margin: "18px 0 36px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {p.benefits.map(f => (
                  <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: C.violet, fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={p.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(e) => { trackMetaEvent("Contact", { content_name: p.name, plan_price: p.prices[billingCycle] }); if (p.name !== FREE_CATALOG_PLAN_NAME) { e.preventDefault(); const plan = buildCatalogCheckoutPlan(p, billingCycle); if (!plan) return; if (!hasStoredPosSession()) { setLoginModalPlan(plan); return; } setUnlockModalPlan(plan); } }} style={{ display: "block", textAlign: "center", padding: "14px 0", background: p.recommended ? C.violet : "transparent", border: p.recommended ? "none" : `1px solid ${C.border}`, color: p.recommended ? C.white : C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 4 }}>Elegir plan</a>
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
    { q: "¿Puedo mostrar variantes de un mismo accesorio?", a: "Sí. En el plan Pro puedes poner variantes por producto: colores, tallas, materiales — cada uno con su precio si es diferente." },
    { q: "¿Mis clientas tienen que descargar una app?", a: "No. Solo abren el link desde su navegador. Funciona en cualquier celular sin instalar nada." },
    { q: "¿Puedo organizar mi catálogo por tipo de accesorio?", a: "Sí. Puedes crear categorías como aretes, collares, pulseras, anillos, sets — lo que mejor le acomode a tu colección." },
    { q: "¿Puedo actualizar mis productos cuando quiero?", a: "Cuando quieras, desde tu teléfono. Agrega nuevas piezas, cambia precios o retira artículos agotados en segundos." },
    { q: "¿Cómo me llegan los pedidos?", a: "Tu clienta selecciona lo que quiere en el catálogo y te manda el pedido directamente por WhatsApp, ya armado y claro." },
  ];
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>Preguntas frecuentes</Label>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(26px,3.5vw,44px)", color: C.dark, margin: 0, fontStyle: "italic" }}>Resolvemos tus dudas</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={f.q} style={{ borderTop: `1px solid ${C.border}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}) }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 19, color: C.dark, fontStyle: "italic" }}>{f.q}</span>
              <span style={{ color: C.violet, fontSize: 22, flexShrink: 0, marginLeft: 16, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            {open === i && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.75, margin: "0 0 22px", paddingRight: 32 }}>{f.a}</p>}
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
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: `radial-gradient(circle, rgba(107,33,232,.15) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <Label light>Empieza hoy</Label>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,5vw,64px)", color: C.white, margin: "0 0 20px", lineHeight: 1.1, fontStyle: "italic" }}>Tu colección merece<br /><span style={{ color: C.violetLt }}>venderse con orden</span></h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(249,247,255,.45)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Deja de mandar fotos por WhatsApp. Muestra tu colección en un link y recibe pedidos claros.</p>
        <a href="#planes" style={{ display: "inline-block", padding: "18px 48px", background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, color: C.white, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 4 }}>Crear mi catálogo gratis</a>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "#080414", borderTop: `1px solid ${C.borderDk}`, padding: "40px clamp(20px,5vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: C.violetLt, fontStyle: "italic" }}>Ravekh</span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(249,247,255,.3)", margin: 0 }}>© {new Date().getFullYear()} Ravekh · Catálogo digital para accesorios y bisutería</p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Términos", "Privacidad", "Contacto"].map(l => <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(249,247,255,.3)", textDecoration: "none" }}>{l}</a>)}
      </div>
    </footer>
  );
}

export function RavekhAccesoriosPage() {
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