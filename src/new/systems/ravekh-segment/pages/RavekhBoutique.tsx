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

/* ─── tokens ────────────────────────────────────────────────── */
const C = {
  bg:       "#FAFAF7",
  bgAlt:    "#F4EDE8",
  bgDark:   "#1C1917",
  card:     "#FFFFFF",
  terra:    "#C4714F",
  terraLt:  "#D98B6A",
  muted:    "#78716C",
  border:   "#E5DDD8",
  borderDk: "#2C2420",
  ink:      "#1C1917",
  white:    "#FAFAF7",
};

/* ─── google fonts ──────────────────────────────────────────── */
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

/* ─── helpers ───────────────────────────────────────────────── */
const Tag = ({ children, light }) => (
  <span style={{
    fontFamily:"Inter, sans-serif", fontSize:10, letterSpacing:4,
    textTransform:"uppercase",
    color: light ? C.bgAlt : C.terra,
    display:"block", marginBottom:20,
  }}>{children}</span>
);

const Hairline = ({ light }) => (
  <div style={{ height:1, background: light ? "rgba(255,255,255,.12)" : C.border, margin:"0" }} />
);

function MockupPlaceholder({ label, height=400, note, dark }) {
  const bg   = dark ? "#2A2420" : "#EDE7E3";
  const bdr  = dark ? "#3A3230" : C.border;
  const clr  = dark ? "#5A5250" : C.muted;
  return (
    <div style={{
      width:"100%", height,
      background:bg,
      border:`1px dashed ${bdr}`,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:10,
    }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="1" y="1" width="34" height="34" rx="2" stroke={dark ? C.terra : C.terra} strokeWidth="1" opacity=".4"/>
        <circle cx="13" cy="13" r="4" stroke={C.terra} strokeWidth="1" opacity=".5"/>
        <polyline points="7,28 14,20 19,24 24,17 29,20" stroke={C.terra} strokeWidth="1" opacity=".5" fill="none"/>
      </svg>
      <p style={{ fontFamily:"Inter, sans-serif", fontSize:11, color:clr, margin:0, letterSpacing:1, textAlign:"center", padding:"0 16px" }}>{label}</p>
      {note && <p style={{ fontFamily:"Inter, sans-serif", fontSize:10, color:dark?"#3A3230":C.border, margin:0, textAlign:"center" }}>{note}</p>}
    </div>
  );
}

/* ─── NAV ───────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 48px", height:60,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(250,250,247,0.97)" : "transparent",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition:"all .35s ease",
      backdropFilter: scrolled ? "blur(10px)" : "none",
    }}>
      <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, color:C.ink, letterSpacing:4, fontWeight:400 }}>
        RAVEKH
      </span>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        {["Beneficios","Cómo funciona","Planes"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(" ","-")}`} style={{
            fontFamily:"Inter, sans-serif", fontSize:11, color:C.muted,
            textDecoration:"none", letterSpacing:2, textTransform:"uppercase",
            transition:"color .2s",
          }}
          onMouseEnter={e=>e.target.style.color=C.terra}
          onMouseLeave={e=>e.target.style.color=C.muted}
          >{l}</a>
        ))}
        <a href="#planes" style={{
          padding:"9px 24px",
          background:C.terra,
          color:C.white,
          fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:500,
          letterSpacing:2, textTransform:"uppercase", textDecoration:"none",
          transition:"background .2s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background=C.terraLt}
        onMouseLeave={e=>e.currentTarget.style.background=C.terra}
        >Empezar</a>
      </div>
    </nav>
  );
}

/* ─── HERO ──────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight:"100vh",
      background:C.bg,
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      alignItems:"stretch",
      paddingTop:60,
    }}>
      {/* left — copy */}
      <div style={{
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"80px 64px 80px 64px",
        borderRight:`1px solid ${C.border}`,
      }}>
        <Tag>Para boutiques · Catálogo digital</Tag>
        <h1 style={{
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:"clamp(44px, 5.5vw, 80px)",
          fontWeight:300,
          color:C.ink,
          lineHeight:1.05,
          margin:"0 0 32px",
          letterSpacing:-1,
        }}>
          Tu ropa<br/>
          <em style={{ fontStyle:"italic", color:C.terra }}>merece ser</em><br/>
          vista con orden
        </h1>
        <p style={{
          fontFamily:"Inter, sans-serif", fontSize:16, color:C.muted,
          lineHeight:1.8, margin:"0 0 48px", maxWidth:440, fontWeight:300,
        }}>
          Deja de mandar fotos una por una. Tu clienta ve toda tu colección en un link, elige lo que quiere y te escribe con el pedido listo.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <a href="#planes" style={{
            padding:"15px 36px",
            background:C.terra, color:C.white,
            fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:500,
            letterSpacing:2, textTransform:"uppercase", textDecoration:"none",
            transition:"background .2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background=C.terraLt}
          onMouseLeave={e=>e.currentTarget.style.background=C.terra}
          >Ver planes</a>
          <a href="#cómo-funciona" style={{
            padding:"15px 36px",
            border:`1px solid ${C.border}`, color:C.muted,
            fontFamily:"Inter, sans-serif", fontSize:12,
            letterSpacing:2, textTransform:"uppercase", textDecoration:"none",
            transition:"all .2s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.terra; e.currentTarget.style.color=C.ink; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; }}
          >Ver demo</a>
        </div>
        {/* mini stats */}
        <div style={{ display:"flex", gap:40, marginTop:56, paddingTop:40, borderTop:`1px solid ${C.border}` }}>
          {[["Sin apps","tu clienta solo abre el link"],["Pedidos claros","directo a tu WhatsApp"],["Fácil de usar","listo en minutos"]].map(([a,b])=>(
            <div key={a}>
              <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:16, color:C.ink, margin:"0 0 4px", fontWeight:500 }}>{a}</p>
              <p style={{ fontFamily:"Inter, sans-serif", fontSize:11, color:C.muted, margin:0, fontWeight:300 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
      {/* right — image */}
      <MockupPlaceholder label="Foto editorial de boutique o screenshot de la app" height="100%" note="Reemplaza con imagen real" />
    </section>
  );
}

/* ─── PROBLEMA ──────────────────────────────────────────────── */
function Problem() {
  const pains = [
    { icon:"👗", title:"Fotos sin contexto", desc:"Mandas cada prenda por separado. La clienta no ve tallas, precios ni disponibilidad de un vistazo." },
    { icon:"🔄", title:"Las mismas preguntas de siempre", desc:"¿Cuánto cuesta? ¿Tienes en S? ¿Hay en otro color? Una y otra vez, en cada conversación." },
    { icon:"📦", title:"Pedidos confusos", desc:"'El vestido que me mandaste el martes'. Sin talla, sin color, sin certeza. El pedido llega mal o no llega." },
  ];
  return (
    <section style={{ background:C.bgAlt, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:64, alignItems:"start" }}>
          <div>
            <Tag>El problema</Tag>
            <h2 style={{
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:"clamp(32px, 3.5vw, 52px)",
              fontWeight:300, color:C.ink, lineHeight:1.1, margin:0,
            }}>
              Vender por WhatsApp sin orden<br/>
              <em style={{ fontStyle:"italic", color:C.terra }}>cansa a tu clienta</em>
            </h2>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {pains.map((p,i)=>(
              <div key={p.title}>
                {i > 0 && <Hairline />}
                <div style={{ display:"flex", gap:24, padding:"28px 0", alignItems:"flex-start" }}>
                  <span style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{p.icon}</span>
                  <div>
                    <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, color:C.ink, margin:"0 0 8px", fontWeight:500 }}>{p.title}</h3>
                    <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, lineHeight:1.7, fontWeight:300 }}>{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CÓMO FUNCIONA ─────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", title:"Carga tu colección", desc:"Sube fotos, nombre, precio, tallas y colores de cada prenda. Una vez, desde tu teléfono." },
    { n:"02", title:"Comparte el link", desc:"Un link único que puedes poner en tu bio de Instagram, mandar por WhatsApp o guardar como respuesta automática." },
    { n:"03", title:"Recibe pedidos listos", desc:"La clienta elige talla, color y cantidad. A ti te llega un mensaje claro con todo lo que necesitas para surtir." },
  ];
  return (
    <section id="cómo-funciona" style={{ background:C.bg, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <Tag>Cómo funciona</Tag>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(32px, 3.5vw, 56px)", fontWeight:300, color:C.ink, margin:0, lineHeight:1.1 }}>
            Tres pasos para vender<br/>
            <em style={{ fontStyle:"italic", color:C.terra }}>con la presentación que te mereces</em>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {steps.map((s,i)=>(
              <div key={s.n}>
                {i > 0 && <Hairline />}
                <div style={{ display:"flex", gap:24, padding:"32px 0" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:13, color:C.terra, letterSpacing:2, minWidth:28, paddingTop:3 }}>{s.n}</span>
                  <div>
                    <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, color:C.ink, margin:"0 0 10px", fontWeight:500 }}>{s.title}</h3>
                    <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, lineHeight:1.7, fontWeight:300 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <MockupPlaceholder label="Screenshot del catálogo — vista del cliente" height={460} note="Reemplaza con imagen de la app" />
        </div>
      </div>
    </section>
  );
}

/* ─── BENEFICIOS ────────────────────────────────────────────── */
function Benefits() {
  const items = [
    { title:"Organizado por colección o temporada", desc:"Agrupa tus prendas como quieras: vestidos, blusas, nueva temporada, sale. Tu clienta encuentra lo que busca sin preguntarte." },
    { title:"Variantes de talla y color", desc:"Cada prenda puede tener sus tallas y colores disponibles. La clienta elige exactamente lo que quiere." },
    { title:"Actualízalo tú misma en segundos", desc:"Entra nueva mercancía, sube los precios o retira lo que ya no tienes. Todo desde tu celular, sin intermediarios." },
    { title:"Botón directo a WhatsApp", desc:"Desde cualquier prenda, tu clienta puede escribirte de inmediato con lo que le interesa." },
    { title:"Link listo para Instagram y redes", desc:"Un solo link para tu bio, para historias, para WhatsApp Business. Siempre actualizado, siempre disponible." },
    { title:"Sin conocimientos técnicos", desc:"No necesitas saber de páginas web ni diseño. Si puedes hacer una historia en Instagram, puedes usar Ravekh." },
  ];
  return (
    <section id="beneficios" style={{ background:C.bgAlt, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 3fr", gap:64, alignItems:"start" }}>
          <div style={{ position:"sticky", top:100 }}>
            <Tag>Beneficios</Tag>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(28px, 3vw, 44px)", fontWeight:300, color:C.ink, margin:0, lineHeight:1.15 }}>
              Todo lo que tu boutique necesita<br/>
              <em style={{ fontStyle:"italic", color:C.terra }}>para ordenarse</em>
            </h2>
          </div>
          <div>
            {items.map((it,i)=>(
              <div key={it.title}>
                {i > 0 && <Hairline />}
                <div style={{
                  display:"flex", gap:24, padding:"32px 0", alignItems:"flex-start",
                  transition:"all .2s",
                }}
                onMouseEnter={e=>{ e.currentTarget.querySelector(".dot").style.background=C.terra; }}
                onMouseLeave={e=>{ e.currentTarget.querySelector(".dot").style.background=C.border; }}
                >
                  <div className="dot" style={{ width:6, height:6, borderRadius:"50%", background:C.border, flexShrink:0, marginTop:9, transition:"background .2s" }} />
                  <div>
                    <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, color:C.ink, margin:"0 0 8px", fontWeight:500 }}>{it.title}</h3>
                    <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, lineHeight:1.7, fontWeight:300 }}>{it.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SHOWCASE ──────────────────────────────────────────────── */
function Showcase() {
  return (
    <section style={{ background:C.bgDark, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <Tag light>La experiencia</Tag>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(30px, 3.5vw, 54px)", color:C.white, fontWeight:300, margin:0, lineHeight:1.1 }}>
            Un catálogo que<br/>
            <em style={{ fontStyle:"italic", color:C.terra }}>refleja el estilo de tu boutique</em>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <div style={{ gridColumn:"span 2" }}>
            <MockupPlaceholder label="Vista principal del catálogo" height={500} note="Screenshot de la app aquí" dark />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <MockupPlaceholder label="Detalle de prenda" height={240} note="Screenshot producto" dark />
            <MockupPlaceholder label="Pedido en WhatsApp" height={248} note="Screenshot pedido" dark />
          </div>
        </div>
        <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:"#5A5250", textAlign:"center", marginTop:28, fontWeight:300, letterSpacing:.5 }}>
          Tu clienta navega desde su teléfono. Tú recibes el pedido completo en WhatsApp.
        </p>
      </div>
    </section>
  );
}

/* ─── TESTIMONIAL ───────────────────────────────────────────── */
function Social() {
  return (
    <section style={{ background:C.bg, padding:"100px 64px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          <div style={{ width:1, height:60, background:C.terra, marginBottom:48, opacity:.5 }} />
          <blockquote style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(24px, 3vw, 38px)",
            color:C.ink,
            fontWeight:300,
            fontStyle:"italic",
            lineHeight:1.45,
            margin:"0 0 40px",
          }}>
            "Antes mis clientas me pedían fotos a toda hora. Ahora les mando el link y ellas solas encuentran lo que buscan. Mis pedidos llegaron más claros desde el primer día."
          </blockquote>
          <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:C.terra, letterSpacing:3, textTransform:"uppercase", margin:"0 0 4px", fontWeight:500 }}>
            — Nombre de clienta
          </p>
          <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:C.muted, margin:0, fontWeight:300 }}>
            Boutique de ropa · Ciudad, México
          </p>
          <div style={{ width:1, height:60, background:C.terra, marginTop:48, opacity:.5 }} />
        </div>
      </div>
    </section>
  );
}

/* ─── PLANES ────────────────────────────────────────────────── */
function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const activeBilling = billingCycleCopy[billingCycle];

  return (
    <section id="planes" style={{ background:C.bgAlt, padding:"100px 64px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:42 }}>
          <Tag>Planes</Tag>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(32px, 3.5vw, 56px)", color:C.ink, fontWeight:300, margin:"0 0 16px", lineHeight:1.1 }}>Empieza cuando quieras.<br/><em style={{ fontStyle:"italic", color:C.terra }}>Crece a tu ritmo.</em></h2>
          <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, fontWeight:300 }}>Sin contratos largos. Sin compromisos.</p>
        </div>
        <div role="group" aria-label="Seleccionar forma de pago" style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:12 }}>{(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle=><button key={cycle} type="button" aria-pressed={billingCycle===cycle} onClick={()=>setBillingCycle(cycle)} style={{ padding:"10px 22px", border:`1px solid ${billingCycle===cycle ? C.terra : C.border}`, background:billingCycle===cycle ? C.terra : "transparent", color:billingCycle===cycle ? C.white : C.muted, fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:500, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>{billingCycleCopy[cycle].label}</button>)}</div>
        <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:C.muted, textAlign:"center", margin:"0 0 36px", fontWeight:300 }}>{activeBilling.helper}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:16 }}>
          {catalogPlans.map(p=>(
            <div key={p.name} style={{ padding:"44px 28px", background:p.recommended ? C.ink : C.card, border:p.recommended ? "none" : `1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"relative" }}>
              {p.recommended && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:C.terra }}/>}<Tag light={p.recommended}>{p.name}</Tag>
              <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, color:p.recommended ? C.white : C.ink, fontWeight:300, margin:"0 0 24px", lineHeight:1.3 }}>{p.limit}</h3>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, margin:"0 0 8px" }}><span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, color:p.recommended ? C.terra : C.ink, fontWeight:300 }}>{p.prices[billingCycle]}</span><span style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:C.muted, fontWeight:300 }}>{p.periodLabel[billingCycle]}</span></div>
              {billingCycle==="annual" && p.annualNote && <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:C.terra, margin:"0 0 18px" }}>{p.annualNote}</p>}
              <ul style={{ margin:"18px 0 36px", padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:14, flex:1 }}>{p.benefits.map(f=><li key={f} style={{ display:"flex", gap:12, alignItems:"flex-start" }}><span style={{ color:C.terra, fontSize:12, marginTop:2, flexShrink:0 }}>✦</span><span style={{ fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:300, color:p.recommended ? "#B0A8A4" : C.muted, lineHeight:1.5 }}>{f}</span></li>)}</ul>
              <a href={p.name===FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(event)=>{ trackMetaEvent("Contact", { content_name:p.name, plan_price:p.prices[billingCycle] }); if(p.name!==FREE_CATALOG_PLAN_NAME){ event.preventDefault(); const checkoutPlan=buildCatalogCheckoutPlan(p,billingCycle); if(!checkoutPlan)return; if(!hasStoredPosSession()){ setLoginModalPlan(checkoutPlan); return; } setUnlockModalPlan(checkoutPlan); } }} style={{ display:"block", textAlign:"center", padding:"14px 0", background:p.recommended ? C.terra : "transparent", border:p.recommended ? "none" : `1px solid ${C.border}`, color:p.recommended ? C.white : C.muted, fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:500, letterSpacing:2, textTransform:"uppercase", textDecoration:"none", transition:"all .2s" }}>Elegir plan</a>
            </div>
          ))}
        </div>
      </div>
      <FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={()=>setLoginModalPlan(null)} />
      <FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={()=>setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado y entrar al punto de venta." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount:unlockModalPlan.amount, plan:unlockModalPlan.plan, label:unlockModalPlan.name } : undefined} onPaymentSuccess={() => { window.location.href = "/MainSales"; }} />
    </section>
  );
}
/* ─── FAQ ───────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"¿Mis clientas necesitan descargar alguna app?", a:"No. Tu catálogo es un link que abren desde cualquier navegador. Nada que instalar, nada que registrar." },
    { q:"¿Puedo subir variantes de talla y color?", a:"Sí, el plan Pro incluye variantes. Cada prenda puede tener todas sus tallas y colores disponibles con sus propios precios si aplica." },
    { q:"¿Puedo actualizar el catálogo yo sola?", a:"Completamente. Entra nueva mercancía, retira lo que ya se vendió o cambia precios en segundos desde tu celular." },
    { q:"¿Funciona con WhatsApp Business?", a:"Sí. El botón de pedido se conecta con tu número de WhatsApp Business para que los mensajes lleguen directo ahí." },
    { q:"¿Necesito saber de diseño o tecnología?", a:"Para nada. Si puedes hacer una publicación de Instagram, puedes usar Ravekh." },
  ];
  return (
    <section style={{ background:C.bg, padding:"100px 64px" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <Tag>Preguntas frecuentes</Tag>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(28px, 3vw, 44px)", color:C.ink, fontWeight:300, margin:0 }}>
            Resolvemos tus dudas
          </h2>
        </div>
        {faqs.map((f,i)=>(
          <div key={f.q} style={{ borderTop:`1px solid ${C.border}`, ...(i===faqs.length-1?{borderBottom:`1px solid ${C.border}`}:{}) }}>
            <button
              onClick={()=>setOpen(open===i ? null : i)}
              style={{
                width:"100%", padding:"24px 0",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
              }}
            >
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:C.ink, fontWeight:400 }}>{f.q}</span>
              <span style={{ color:C.terra, fontSize:20, flexShrink:0, marginLeft:16, transition:"transform .2s", transform: open===i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            {open===i && (
              <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, lineHeight:1.75, margin:"0 0 24px", paddingRight:32, fontWeight:300 }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA FINAL ─────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{
      background:C.bgAlt,
      padding:"120px 64px",
      textAlign:"center",
    }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ width:1, height:60, background:C.terra, margin:"0 auto 56px", opacity:.4 }} />
        <Tag>Empieza hoy</Tag>
        <h2 style={{
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:"clamp(36px, 5vw, 68px)",
          color:C.ink, fontWeight:300, margin:"0 0 24px", lineHeight:1.1,
        }}>
          Tu boutique merece<br/>
          <em style={{ fontStyle:"italic", color:C.terra }}>venderse con orden</em>
        </h2>
        <p style={{ fontFamily:"Inter, sans-serif", fontSize:16, color:C.muted, margin:"0 0 48px", lineHeight:1.8, fontWeight:300 }}>
          Deja el caos de las fotos por WhatsApp. Muestra tu ropa en un catálogo que refleja la calidad de lo que vendes.
        </p>
        <a href="#planes" style={{
          display:"inline-block",
          padding:"17px 52px",
          background:C.terra, color:C.white,
          fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:500,
          letterSpacing:3, textTransform:"uppercase", textDecoration:"none",
          transition:"background .2s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background=C.terraLt}
        onMouseLeave={e=>e.currentTarget.style.background=C.terra}
        >Ver planes y empezar</a>
        <div style={{ width:1, height:60, background:C.terra, margin:"56px auto 0", opacity:.4 }} />
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background:C.bgDark,
      padding:"40px 64px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      flexWrap:"wrap", gap:16,
    }}>
      <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:C.terra, letterSpacing:4 }}>RAVEKH</span>
      <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:"#5A5250", margin:0, fontWeight:300 }}>
        © {new Date().getFullYear()} Ravekh · Catálogo digital para boutiques
      </p>
      <div style={{ display:"flex", gap:24 }}>
        {["Términos","Privacidad","Contacto"].map(l=>(
          <a key={l} href="#" style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:"#5A5250", textDecoration:"none", letterSpacing:1, fontWeight:300 }}
          onMouseEnter={e=>e.target.style.color=C.terra}
          onMouseLeave={e=>e.target.style.color="#5A5250"}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

/* ─── APP ───────────────────────────────────────────────────── */
export function RavekhBoutiquePage() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
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
