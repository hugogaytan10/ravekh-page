import { useEffect, useState } from "react";
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
  black: "#0A0A0A",
  dark: "#1A1A1A",
  card: "#141414",
  gold: "#C9A96E",
  goldLt: "#E2C99A",
  muted: "#888880",
  border: "#2A2A2A",
  white: "#F5F0EA",
};

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 auto", maxWidth: 240 }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.gold})` }} />
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <ellipse cx="7" cy="7" rx="2" ry="3.5" stroke={C.gold} strokeWidth="1.2" />
      <line x1="7" y1="10.5" x2="7" y2="14" stroke={C.gold} strokeWidth="1.2" />
    </svg>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.gold})` }} />
  </div>
);

const navLinks = [
  { label: "Beneficios", href: "#beneficios" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Planes", href: "#planes" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 40);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 clamp(20px, 5vw, 40px)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,10,0.96)" : "transparent",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all .4s ease",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.gold, letterSpacing: 3 }}>RAVEKH</span>
      <div style={{ display: "flex", gap: "clamp(12px, 3vw, 32px)", alignItems: "center" }}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: C.muted,
              textDecoration: "none",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.goldLt; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#planes"
          style={{
            padding: "9px 22px",
            border: `1px solid ${C.gold}`,
            color: C.gold,
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            textDecoration: "none",
            letterSpacing: 2,
            textTransform: "uppercase",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.black; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gold; }}
        >
          Empezar
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ minHeight: "100vh", background: C.black, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: `radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 32 }}>Para perfumerías · Catálogo digital</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 400, color: C.white, lineHeight: 1.1, maxWidth: 780, margin: "0 0 28px" }}>
        Tus fragancias<br />
        <em style={{ color: C.gold, fontStyle: "italic" }}>merecen ser vistas</em>
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: C.muted, maxWidth: 520, lineHeight: 1.75, margin: "0 0 52px" }}>
        Deja de mandar fotos por WhatsApp una por una. Muestra toda tu colección en un link elegante y recibe pedidos claros directamente en tu teléfono.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="#planes" style={{ padding: "16px 36px", background: C.gold, color: C.black, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLt; }} onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}>Ver planes</a>
        <a href="#como-funciona" style={{ padding: "16px 36px", border: `1px solid ${C.border}`, color: C.muted, fontFamily: "Inter, sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.white; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>Ver demo</a>
      </div>
      <div style={{ marginTop: 72, display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {[["Sin apps que instalar", "tus clientes"], ["Pedidos por WhatsApp", "sin llamadas"], ["Actualiza productos", "en minutos"]].map(([a, b]) => (
          <div key={a} style={{ textAlign: "center" }}><p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: C.white, margin: "0 0 4px" }}>{a}</p><p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>{b}</p></div>
        ))}
      </div>
    </section>
  );
}

type MockupPlaceholderProps = { label: string; width?: string; height?: number; note?: string };

function MockupPlaceholder({ label, width = "100%", height = 420, note }: MockupPlaceholderProps) {
  return (
    <div style={{ width, maxWidth: "100%", height, background: C.card, border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, flexShrink: 0 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="3" stroke={C.border} strokeWidth="1.5" /><circle cx="14" cy="14" r="5" stroke={C.gold} strokeWidth="1.2" opacity=".5" /><line x1="8" y1="32" x2="32" y2="32" stroke={C.border} strokeWidth="1" /><polyline points="8,26 18,18 24,24 30,18 32,20" stroke={C.gold} strokeWidth="1.2" opacity=".5" fill="none" /></svg>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, textAlign: "center", margin: 0, letterSpacing: 1 }}>{label}</p>
      {note && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.border, textAlign: "center", margin: 0 }}>{note}</p>}
    </div>
  );
}

function Problem() {
  const pains = [
    { icon: "📱", title: "Fotos una por una", desc: "Mandas cada fragancia por separado. El cliente se pierde, tú pierdes tiempo." },
    { icon: "🔁", title: "Las mismas preguntas", desc: "¿Cuánto cuesta? ¿Lo tienes en stock? ¿Qué notas tiene? Una y otra vez." },
    { icon: "😞", title: "Pedidos confusos", desc: "El cliente dice 'el de la botella azul'. Nunca queda claro qué quiere exactamente." },
  ];
  return <section style={{ background: C.dark, padding: "100px 40px" }}><div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>El problema</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 52px)", color: C.white, fontWeight: 400, margin: "0 0 64px" }}>Vender por WhatsApp sin orden<br /><em style={{ color: C.muted, fontStyle: "italic" }}>cansa a tus clientes</em></h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 24 }}>{pains.map((p) => <div key={p.title} style={{ padding: "36px 28px", border: `1px solid ${C.border}`, textAlign: "left", background: C.card }}><div style={{ fontSize: 28, marginBottom: 20 }}>{p.icon}</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.white, margin: "0 0 12px", fontWeight: 400 }}>{p.title}</h3><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.7 }}>{p.desc}</p></div>)}</div></div></section>;
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Carga tus fragancias", desc: "Sube fotos, nombre, precio, familia olfativa y notas de cada perfume. Una vez, y listo." },
    { n: "02", title: "Comparte tu link", desc: "Un link único que envías por WhatsApp, Instagram o donde quieras. Sin apps, sin descargas." },
    { n: "03", title: "Recibe pedidos armados", desc: "El cliente elige, agrega al carrito y te llega un mensaje con el pedido completo y claro." },
  ];
  return <section id="como-funciona" style={{ background: C.black, padding: "100px 40px" }}><div style={{ maxWidth: 1100, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 72 }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>Cómo funciona</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 52px)", color: C.white, fontWeight: 400, margin: 0 }}>Tres pasos para vender<br /><em style={{ color: C.gold, fontStyle: "italic" }}>con la presentación que mereces</em></h2></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 64, alignItems: "center" }}><MockupPlaceholder label="Pantalla del catálogo — vista del cliente" height={500} note="Reemplaza con screenshot de la app" /><div style={{ display: "flex", flexDirection: "column", gap: 40 }}>{steps.map((s) => <div key={s.n} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: C.gold, letterSpacing: 2, minWidth: 28, paddingTop: 4 }}>{s.n}</span><div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.white, margin: "0 0 8px", fontWeight: 400 }}>{s.title}</h3><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.7 }}>{s.desc}</p></div></div>)}</div></div></div></section>;
}

function Benefits() {
  const items = ["Catálogo siempre actualizado|Cambia precios, sube nuevos lanzamientos o retira productos en segundos desde tu teléfono.", "Organizado por colección|Agrupa tus fragancias por marca, familia olfativa o temporada. El cliente encuentra lo que busca sin preguntarte.", "Botón directo a WhatsApp|Desde cada producto, el cliente puede escribirte de inmediato con la fragancia que le interesa.", "Pedidos listos para surtir|Recibes un mensaje con nombre del producto, cantidad y variante. Sin confusión, sin llamadas de aclaración.", "Link para compartir en redes|Pega el link en tu bio de Instagram o como respuesta automática en WhatsApp Business.", "Sin conocimientos técnicos|No necesitas saber de páginas web. Si puedes escribir un status de WhatsApp, puedes usar Ravekh."].map((item) => { const [title, desc] = item.split("|"); return { title, desc }; });
  return <section id="beneficios" style={{ background: C.dark, padding: "100px 40px" }}><div style={{ maxWidth: 1100, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 72 }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>Beneficios</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 52px)", color: C.white, fontWeight: 400, margin: 0 }}>Todo lo que tu perfumería<br /><em style={{ color: C.gold, fontStyle: "italic" }}>necesita para ordenarse</em></h2></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, border: `1px solid ${C.border}` }}>{items.map((it) => <div key={it.title} style={{ padding: "36px 32px", background: C.card, border: `1px solid ${C.border}`, transition: "background .2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#1e1a14"; }} onMouseLeave={(e) => { e.currentTarget.style.background = C.card; }}><div style={{ width: 2, height: 28, background: C.gold, marginBottom: 24 }} /><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.white, margin: "0 0 12px", fontWeight: 400 }}>{it.title}</h3><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.7 }}>{it.desc}</p></div>)}</div></div></section>;
}

function Showcase() {
  return <section style={{ background: C.black, padding: "100px 40px" }}><div style={{ maxWidth: 1100, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 64 }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>La experiencia</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 52px)", color: C.white, fontWeight: 400, margin: 0 }}>Un catálogo que<br /><em style={{ color: C.gold, fontStyle: "italic" }}>refleja la calidad de tus fragancias</em></h2></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, alignItems: "end" }}><MockupPlaceholder label="Vista principal del catálogo" height={480} note="Screenshot de la app aquí" /><MockupPlaceholder label="Detalle de fragancia" height={360} note="Screenshot producto" /><MockupPlaceholder label="Pedido en WhatsApp" height={360} note="Screenshot pedido recibido" /></div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textAlign: "center", marginTop: 32, letterSpacing: .5 }}>Tu cliente navega desde su teléfono. Tú recibes el pedido armado en WhatsApp.</p></div></section>;
}

function Social() {
  return <section style={{ background: C.dark, padding: "100px 40px" }}><div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}><Divider /><blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 36px)", color: C.white, fontWeight: 400, fontStyle: "italic", lineHeight: 1.5, margin: "56px 0" }}>“Antes mandaba fotos hasta de madrugada. Ahora mis clientas ven todo en el link y me escriben directamente con lo que quieren.”</blockquote><p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.gold, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>— Nombre de cliente</p><p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>Perfumería · Ciudad, México</p><div style={{ marginTop: 56 }}><Divider /></div></div></section>;
}

function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const activeBilling = billingCycleCopy[billingCycle];

  return <section id="planes" style={{ background: C.black, padding: "100px 40px" }}><div style={{ maxWidth: 1180, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 42 }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>Planes</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 52px)", color: C.white, fontWeight: 400, margin: "0 0 16px" }}>Empieza cuando quieras.<br /><em style={{ color: C.gold, fontStyle: "italic" }}>Crece a tu ritmo.</em></h2><p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: C.muted, margin: 0 }}>Sin contratos largos. Sin compromisos.</p></div><div role="group" aria-label="Seleccionar forma de pago" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>{(Object.keys(billingCycleCopy) as BillingCycle[]).map((cycle) => <button key={cycle} type="button" aria-pressed={billingCycle === cycle} onClick={() => setBillingCycle(cycle)} style={{ padding: "10px 22px", border: `1px solid ${billingCycle === cycle ? C.gold : C.border}`, background: billingCycle === cycle ? C.gold : "transparent", color: billingCycle === cycle ? C.black : C.muted, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>{billingCycleCopy[cycle].label}</button>)}</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, textAlign: "center", margin: "0 0 36px" }}>{activeBilling.helper}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>{catalogPlans.map((p) => <div key={p.name} style={{ padding: "44px 28px", border: p.recommended ? `1px solid ${C.gold}` : `1px solid ${C.border}`, background: p.recommended ? "#111008" : C.card, position: "relative", display: "flex", flexDirection: "column" }}>{p.recommended && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.black, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 20px" }}>Recomendado</div>}<p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 3, color: C.gold, textTransform: "uppercase", margin: "0 0 12px" }}>{p.name}</p><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.white, fontWeight: 400, margin: "0 0 8px" }}>{p.limit}</h3><div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "24px 0 8px" }}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: p.recommended ? C.gold : C.white, fontWeight: 400 }}>{p.prices[billingCycle]}</span><span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>{p.periodLabel[billingCycle]}</span></div>{billingCycle === "annual" && p.annualNote && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.gold, margin: "0 0 18px" }}>{p.annualNote}</p>}<ul style={{ margin: "18px 0 36px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>{p.benefits.map((f) => <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><span style={{ color: C.gold, fontSize: 14, marginTop: 1 }}>✓</span><span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span></li>)}</ul><a href={p.name === FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(event) => { trackMetaEvent("Contact", { content_name: p.name, plan_price: p.prices[billingCycle] }); if (p.name !== FREE_CATALOG_PLAN_NAME) { event.preventDefault(); const checkoutPlan = buildCatalogCheckoutPlan(p, billingCycle); if (!checkoutPlan) return; if (!hasStoredPosSession()) { setLoginModalPlan(checkoutPlan); return; } setUnlockModalPlan(checkoutPlan); } }} style={{ display: "block", textAlign: "center", padding: "14px 0", background: p.recommended ? C.gold : "transparent", border: p.recommended ? "none" : `1px solid ${C.border}`, color: p.recommended ? C.black : C.muted, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", transition: "all .2s" }}>Elegir plan</a></div>)}</div></div><FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={() => setLoginModalPlan(null)} /><FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={() => setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado y entrar al punto de venta." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount: unlockModalPlan.amount, plan: unlockModalPlan.plan, label: unlockModalPlan.name } : undefined} onPaymentSuccess={() => { window.location.href = "/MainSales"; }} /></section>;
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Mis clientes necesitan descargar alguna app?", a: "No. Tu catálogo es un link que abren desde cualquier navegador. Nada que instalar, nada que registrar." },
    { q: "¿Puedo actualizar mis fragancias yo mismo?", a: "Sí, desde tu teléfono. Agrega nuevos lanzamientos, cambia precios o retira productos en segundos." },
    { q: "¿Funciona con WhatsApp Business?", a: "Completamente. El botón de pedido puede configurarse con tu número de WhatsApp Business para que los mensajes lleguen directo ahí." },
    { q: "¿Qué pasa si tengo variantes de un perfume? (30ml, 50ml, 100ml)", a: "El plan Pro incluye variantes por producto. Cada fragancia puede tener sus presentaciones con precios distintos." },
    { q: "¿Necesito conocimientos de diseño o tecnología?", a: "Para nada. Si puedes hacer una publicación en Instagram, puedes usar Ravekh." },
  ];
  return <section style={{ background: C.dark, padding: "100px 40px" }}><div style={{ maxWidth: 720, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 64 }}><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>Preguntas frecuentes</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3.5vw, 44px)", color: C.white, fontWeight: 400, margin: 0 }}>Resolvemos tus dudas</h2></div><div style={{ display: "flex", flexDirection: "column" }}>{faqs.map((f, i) => <div key={f.q} style={{ borderTop: `1px solid ${C.border}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}) }}><button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.white, fontWeight: 400 }}>{f.q}</span><span style={{ color: C.gold, fontSize: 20, flexShrink: 0, marginLeft: 16, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span></button>{open === i && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.75, margin: "0 0 24px", paddingRight: 32 }}>{f.a}</p>}</div>)}</div></div></section>;
}

function FinalCTA() {
  return <section style={{ background: C.black, padding: "120px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: `radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 65%)`, pointerEvents: "none" }} /><p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 32 }}>Empieza hoy</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 64px)", color: C.white, fontWeight: 400, margin: "0 0 24px", lineHeight: 1.15 }}>Tu perfumería merece<br /><em style={{ color: C.gold, fontStyle: "italic" }}>venderse con orden</em></h2><p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: C.muted, maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Deja el caos de las fotos por WhatsApp. Muestra tus fragancias en un catálogo que refleja la calidad de lo que vendes.</p><a href="#planes" style={{ display: "inline-block", padding: "18px 48px", background: C.gold, color: C.black, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}>Ver planes y empezar</a></section>;
}

function Footer() {
  return <footer style={{ background: C.dark, borderTop: `1px solid ${C.border}`, padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.gold, letterSpacing: 3 }}>RAVEKH</span><p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>© {new Date().getFullYear()} Ravekh · Catálogo digital para perfumerías</p><div style={{ display: "flex", gap: 24 }}>{["Términos", "Privacidad", "Contacto"].map((label) => <a key={label} href="#" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, textDecoration: "none", letterSpacing: 1 }} onMouseEnter={(e) => { e.currentTarget.style.color = C.goldLt; }} onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}>{label}</a>)}</div></footer>;
}

function FontLoader() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600;700&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, []);
  return null;
}

export function RavekhPerfumeriaPage() {
  return (
    <div style={{ background: C.black, minHeight: "100vh", color: C.white }}>
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
