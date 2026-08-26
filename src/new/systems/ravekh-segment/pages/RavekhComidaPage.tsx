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
  bg:      "#FFFBF5",
  bgAlt:   "#FFF3E0",
  dark:    "#1A0F00",
  card:    "#FFFFFF",
  chili:   "#D64000",
  chiliLt: "#F05020",
  muted:   "#7A6652",
  border:  "#E8D8C0",
  borderDk:"#2E1A00",
  white:   "#FFFBF5",
};

function FontLoader() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
  }, []);
  return null;
}

const Label = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: light ? "rgba(255,251,245,.5)" : C.chili, display: "block", marginBottom: 16 }}>{children}</span>
);

function MockupPlaceholder({ label, height = 400, note }: { label: string; height?: number; note?: string }) {
  return (
    <div style={{ width: "100%", height, background: "#FFF3E0", border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="4" stroke={C.chili} strokeWidth="1" opacity=".35"/>
        <path d="M14 28 Q20 18 26 28" stroke={C.chili} strokeWidth="1.2" fill="none" opacity=".5"/>
        <circle cx="20" cy="15" r="4" stroke={C.chili} strokeWidth="1" opacity=".4"/>
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
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: "0 clamp(20px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(255,251,245,.97)" : "transparent", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all .3s" }}>
      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: C.dark, letterSpacing: 1 }}>Ravekh</span>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[["Beneficios", "#beneficios"], ["Cómo funciona", "#como-funciona"], ["Planes", "#planes"]].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textDecoration: "none", fontWeight: 500 }}>{l}</a>
        ))}
        <a href="#planes" style={{ padding: "10px 22px", background: C.chili, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>Empezar gratis</a>
      </div>
    </nav>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ background: C.dark, minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px clamp(20px,6vw,80px) 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: `linear-gradient(135deg, rgba(214,64,0,.15) 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 680, position: "relative", zIndex: 1 }}>
        <Label light>Catálogo digital para negocios de comida</Label>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(40px,6vw,80px)", fontWeight: 600, color: C.white, margin: "0 0 28px", lineHeight: 1.05 }}>
          Deja de mandar<br />
          <em style={{ color: C.chili, fontStyle: "italic" }}>fotos borrosas</em><br />
          por WhatsApp
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "rgba(255,251,245,.6)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 44px" }}>
          Muestra tu menú o productos en un link ordenado. Tus clientes eligen lo que quieren y te escriben con el pedido listo. Sin vaivén de fotos, sin confusión.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="#planes" style={{ padding: "16px 36px", background: C.chili, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: .5 }}>Crear mi catálogo gratis</a>
          <a href="#como-funciona" style={{ padding: "16px 36px", border: `1px solid rgba(255,251,245,.2)`, color: "rgba(255,251,245,.7)", fontFamily: "Inter, sans-serif", fontSize: 14, textDecoration: "none" }}>Ver cómo funciona</a>
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM ─────────────────────────────────────────── */
function Problem() {
  const pains = [
    { icon: "📸", title: "Fotos que no convencen", desc: "Mandas foto tras foto por WhatsApp y el cliente igual termina sin saber qué ordenar." },
    { icon: "🔄", title: "Las mismas preguntas de siempre", desc: "\"¿Cuánto cuesta?\" \"¿Tienen X?\" \"¿Hacen envío?\" — todo el día, todos los días." },
    { icon: "😤", title: "Pedidos confusos", desc: "Te llegan pedidos a medias. Tienes que confirmar, re-confirmar y aún así hay errores." },
  ];
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>El problema</Label>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, color: C.dark, margin: 0 }}>Vender comida por WhatsApp<br /><em style={{ color: C.chili }}>no debería ser tan caótico</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {pains.map(p => (
            <div key={p.title} style={{ padding: "36px 28px", background: C.card, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: C.dark, margin: "0 0 12px" }}>{p.title}</h3>
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
    { n: "01", title: "Sube tus productos", desc: "Agrega tu menú o productos con foto, nombre, precio y descripción. Organízalos por categoría." },
    { n: "02", title: "Comparte el link", desc: "Un solo link para compartir por WhatsApp, Instagram o donde quieras. Sin apps que descargar." },
    { n: "03", title: "Recibe pedidos armados", desc: "Tu cliente selecciona lo que quiere y te lo manda por WhatsApp en un mensaje claro y completo." },
  ];
  return (
    <section id="como-funciona" style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label>Cómo funciona</Label>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, color: C.dark, margin: 0 }}>Listo en minutos,<br /><em style={{ color: C.chili }}>funciona para siempre</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 2 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ padding: "48px 36px", background: i % 2 === 0 ? C.card : C.chili, position: "relative" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 64, fontWeight: 700, color: i % 2 === 0 ? C.border : "rgba(255,255,255,.2)", margin: "0 0 24px", lineHeight: 1 }}>{s.n}</p>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: i % 2 === 0 ? C.dark : C.white, margin: "0 0 12px" }}>{s.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: i % 2 === 0 ? C.muted : "rgba(255,255,255,.8)", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
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
    { title: "Categorías claras", desc: "Organiza por tipo: antojitos, platillos del día, bebidas, postres. Cada cosa en su lugar." },
    { title: "Fotos que sí venden", desc: "Sube imágenes de cada producto. Tu catálogo hace el trabajo de convencer que hacías tú a mano." },
    { title: "Pedidos por WhatsApp", desc: "El cliente elige, le da clic al botón y te manda el pedido armado. Sin confusión, sin idas y vueltas." },
    { title: "Siempre actualizado", desc: "¿Se acabó algo? ¿Cambió el precio? Actualízalo desde tu teléfono en segundos." },
    { title: "Sin complicaciones técnicas", desc: "No necesitas saber de diseño ni de tecnología. Si usas WhatsApp, puedes usar Ravekh." },
    { title: "Funciona en cualquier teléfono", desc: "Tus clientes abren el link en su navegador. Sin apps que descargar, sin registros." },
  ];
  return (
    <section id="beneficios" style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Label light>Beneficios</Label>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, color: C.white, margin: 0 }}>Todo lo que necesitas<br /><em style={{ color: C.chili }}>para vender con orden</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 1 }}>
          {benefits.map(b => (
            <div key={b.title} style={{ padding: "36px 32px", borderTop: `1px solid ${C.borderDk}`, borderRight: `1px solid ${C.borderDk}` }}>
              <div style={{ width: 32, height: 3, background: C.chili, marginBottom: 20 }} />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: C.white, margin: "0 0 10px" }}>{b.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,251,245,.5)", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
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
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, color: C.dark, margin: 0 }}>Tu menú,<br /><em style={{ color: C.chili }}>presentado como se debe</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "end" }}>
          <MockupPlaceholder label="Vista del catálogo / menú" height={480} note="Screenshot de la app aquí" />
          <MockupPlaceholder label="Detalle del platillo" height={360} note="Screenshot producto" />
          <MockupPlaceholder label="Pedido recibido en WhatsApp" height={360} note="Screenshot pedido" />
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textAlign: "center", marginTop: 32 }}>Tu cliente navega desde su teléfono. Tú recibes el pedido armado en WhatsApp.</p>
      </div>
    </section>
  );
}

/* ─── SOCIAL PROOF ─────────────────────────────────────── */
function Social() {
  return (
    <section style={{ background: C.bgAlt, padding: "100px clamp(20px,6vw,80px)", textAlign: "center" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ width: 48, height: 3, background: C.chili, margin: "0 auto 48px" }} />
        <blockquote style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,34px)", color: C.dark, fontWeight: 400, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 32px" }}>
          "Antes tardaba media hora respondiendo preguntas por WhatsApp. Ahora mis clientes ven el menú, eligen y me mandan el pedido completo."
        </blockquote>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.chili, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>— Nombre del cliente</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted }}>Negocio de comida · Ciudad, México</p>
        <div style={{ width: 48, height: 3, background: C.chili, margin: "48px auto 0" }} />
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
    <section id="planes" style={{ background: C.dark, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Label light>Planes</Label>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, color: C.white, margin: "0 0 16px" }}>Empieza hoy.<br /><em style={{ color: C.chili }}>Crece a tu ritmo.</em></h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "rgba(255,251,245,.45)", margin: 0 }}>Sin contratos largos. Sin letra chica.</p>
        </div>
        <div role="group" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle => (
            <button key={cycle} type="button" onClick={() => setBillingCycle(cycle)} style={{ padding: "10px 22px", border: `1px solid ${billingCycle === cycle ? C.chili : C.borderDk}`, background: billingCycle === cycle ? C.chili : "transparent", color: billingCycle === cycle ? C.white : "rgba(255,251,245,.4)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>{billingCycleCopy[cycle].label}</button>
          ))}
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,251,245,.35)", textAlign: "center", margin: "0 0 36px" }}>{activeBilling.helper}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
          {catalogPlans.map(p => (
            <div key={p.name} style={{ padding: "44px 28px", border: p.recommended ? `1px solid ${C.chili}` : `1px solid ${C.borderDk}`, background: p.recommended ? "#200800" : "#141414", position: "relative", display: "flex", flexDirection: "column" }}>
              {p.recommended && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: C.chili, color: C.white, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 20px" }}>Recomendado</div>}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: 3, color: C.chili, textTransform: "uppercase", margin: "0 0 12px" }}>{p.name}</p>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.white, fontWeight: 400, margin: "0 0 8px" }}>{p.limit}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "24px 0 8px" }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 40, color: p.recommended ? C.chili : C.white, fontWeight: 600 }}>{p.prices[billingCycle]}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,251,245,.4)" }}>{p.periodLabel[billingCycle]}</span>
              </div>
              {billingCycle === "annual" && p.annualNote && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.chili, margin: "0 0 18px" }}>{p.annualNote}</p>}
              <ul style={{ margin: "18px 0 36px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {p.benefits.map(f => (
                  <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: C.chili, fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,251,245,.5)", lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={p.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(e) => { trackMetaEvent("Contact", { content_name: p.name, plan_price: p.prices[billingCycle] }); if (p.name !== FREE_CATALOG_PLAN_NAME) { e.preventDefault(); const plan = buildCatalogCheckoutPlan(p, billingCycle); if (!plan) return; if (!hasStoredPosSession()) { setLoginModalPlan(plan); return; } setUnlockModalPlan(plan); } }} style={{ display: "block", textAlign: "center", padding: "14px 0", background: p.recommended ? C.chili : "transparent", border: p.recommended ? "none" : `1px solid ${C.borderDk}`, color: p.recommended ? C.white : "rgba(255,251,245,.4)", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>Elegir plan</a>
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
    { q: "¿Mis clientes tienen que descargar algo?", a: "No. El catálogo es un link que abren desde cualquier navegador. Sin apps, sin registros." },
    { q: "¿Puedo poner fotos de mi comida?", a: "Sí, y es lo más importante. Una buena foto vende más que cualquier descripción. Súbelas directo desde tu teléfono." },
    { q: "¿Funciona para menú del día y platillos fijos?", a: "Sí. Puedes tener categorías separadas para el menú del día y para platillos que siempre tienes disponibles." },
    { q: "¿Puedo cambiar precios o productos cuando quiero?", a: "Cuando quieras, desde tu teléfono. Si algo se acabó, lo ocultas en segundos." },
    { q: "¿Mis pedidos llegan por WhatsApp?", a: "Sí. Tu cliente selecciona lo que quiere y lo manda directo a tu WhatsApp con el pedido completo y armado." },
  ];
  return (
    <section style={{ background: C.bg, padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>Preguntas frecuentes</Label>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 600, color: C.dark, margin: 0 }}>Resolvemos tus dudas</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={f.q} style={{ borderTop: `1px solid ${C.border}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}) }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: C.dark, fontWeight: 500 }}>{f.q}</span>
              <span style={{ color: C.chili, fontSize: 22, flexShrink: 0, marginLeft: 16, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
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
    <section style={{ background: C.chili, padding: "120px clamp(20px,6vw,80px)", textAlign: "center" }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 600, color: C.white, margin: "0 0 20px", lineHeight: 1.1 }}>Tu negocio de comida merece<br /><em>venderse con orden</em></h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,251,245,.75)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Deja el caos de las fotos por WhatsApp. Comparte un link, recibe pedidos claros.</p>
      <a href="#planes" style={{ display: "inline-block", padding: "18px 48px", background: C.white, color: C.chili, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>Crear mi catálogo gratis</a>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.dark, borderTop: `1px solid ${C.borderDk}`, padding: "40px clamp(20px,5vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.chili, fontWeight: 700 }}>Ravekh</span>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,251,245,.3)", margin: 0 }}>© {new Date().getFullYear()} Ravekh · Catálogo digital para negocios de comida</p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Términos", "Privacidad", "Contacto"].map(l => <a key={l} href="#" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,251,245,.3)", textDecoration: "none" }}>{l}</a>)}
      </div>
    </footer>
  );
}

export function RavekhComidaPage() {
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