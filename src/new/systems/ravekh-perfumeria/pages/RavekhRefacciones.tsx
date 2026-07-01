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

/* ─── tokens ─────────────────────────────────────────────── */
const C = {
  bg:      "#F8F8F6",
  bgAlt:   "#EFEFED",
  ink:     "#0D0D0D",
  steel:   "#2D3142",
  orange:  "#E85D04",
  orangeLt:"#FF6B0A",
  muted:   "#6B7280",
  border:  "#D1D1CE",
  borderDk:"#3A3A38",
  white:   "#F8F8F6",
  dark:    "#111217",
};

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    // global reset
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = C.bg;
  }, []);
  return null;
}

/* ─── helpers ─────────────────────────────────────────────── */
const Label = ({ children, light, orange }) => (
  <span style={{
    fontFamily:"Inter, sans-serif", fontSize:10, fontWeight:700,
    letterSpacing:4, textTransform:"uppercase",
    color: orange ? C.orange : light ? "rgba(248,248,246,.45)" : C.muted,
    display:"block", marginBottom:16,
  }}>{children}</span>
);

function MockupPlaceholder({ label, height=400, note, dark }) {
  const bg  = dark ? "#1A1C22" : C.bgAlt;
  const bdr = dark ? C.borderDk : C.border;
  const clr = dark ? "#4A4C52" : C.muted;
  return (
    <div style={{
      width:"100%", height,
      background:bg,
      border:`2px dashed ${bdr}`,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:10,
      flexShrink:0,
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" stroke={C.orange} strokeWidth="1.5" opacity=".4"/>
        <line x1="1" y1="1" x2="12" y2="12" stroke={C.orange} strokeWidth="1" opacity=".3"/>
        <line x1="39" y1="1" x2="28" y2="12" stroke={C.orange} strokeWidth="1" opacity=".3"/>
        <circle cx="20" cy="20" r="7" stroke={C.orange} strokeWidth="1.5" opacity=".5"/>
        <line x1="20" y1="13" x2="20" y2="27" stroke={C.orange} strokeWidth="1" opacity=".4"/>
        <line x1="13" y1="20" x2="27" y2="20" stroke={C.orange} strokeWidth="1" opacity=".4"/>
      </svg>
      <p style={{ fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:500, color:clr, margin:0, letterSpacing:1, textAlign:"center", padding:"0 20px", textTransform:"uppercase" }}>{label}</p>
      {note && <p style={{ fontFamily:"Inter, sans-serif", fontSize:10, color:dark?"#2A2C32":C.border, margin:0, textAlign:"center" }}>{note}</p>}
    </div>
  );
}

/* ─── NAV ──────────────────────────────────────────────────── */
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
      padding:"0 48px", height:56,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(248,248,246,0.97)" : "transparent",
      borderBottom: scrolled ? `2px solid ${C.ink}` : "2px solid transparent",
      transition:"all .25s ease",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:6, height:28, background:C.orange }} />
        <span style={{ fontFamily:"Inter, sans-serif", fontSize:20, fontWeight:900, color:C.ink, letterSpacing:2, textTransform:"uppercase" }}>
          RAVEKH
        </span>
      </div>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        {["Beneficios","Cómo funciona","Planes"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(" ","-")}`} style={{
            fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:600,
            color:C.muted, textDecoration:"none", letterSpacing:2, textTransform:"uppercase",
            transition:"color .15s",
          }}
          onMouseEnter={e=>e.target.style.color=C.orange}
          onMouseLeave={e=>e.target.style.color=C.muted}
          >{l}</a>
        ))}
        <a href="#planes" style={{
          padding:"9px 24px",
          background:C.orange, color:C.white,
          fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:700,
          letterSpacing:2, textTransform:"uppercase", textDecoration:"none",
          transition:"background .15s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background=C.orangeLt}
        onMouseLeave={e=>e.currentTarget.style.background=C.orange}
        >Empezar</a>
      </div>
    </nav>
  );
}

/* ─── HERO ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight:"100vh",
      background:C.dark,
      display:"flex", flexDirection:"column",
      justifyContent:"flex-end",
      padding:"140px 64px 80px",
      position:"relative", overflow:"hidden",
      borderBottom:`4px solid ${C.orange}`,
    }}>
      {/* giant background number */}
      <div style={{
        position:"absolute", top:"50%", right:"-2%",
        transform:"translateY(-50%)",
        fontFamily:"Inter, sans-serif", fontWeight:900,
        fontSize:"clamp(280px, 40vw, 520px)",
        color:"rgba(255,255,255,0.03)",
        lineHeight:1, userSelect:"none", pointerEvents:"none",
        letterSpacing:-20,
      }}>01</div>

      {/* orange accent bar top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:C.orange }} />

      <div style={{ maxWidth:1080, width:"100%", margin:"0 auto" }}>
        <Label light orange>Para refaccionarias · Catálogo digital</Label>

        <h1 style={{
          fontFamily:"Inter, sans-serif",
          fontWeight:900,
          fontSize:"clamp(48px, 8vw, 110px)",
          color:C.white,
          lineHeight:.95,
          margin:"0 0 32px",
          letterSpacing:-3,
          textTransform:"uppercase",
        }}>
          DEJA DE<br/>
          MANDAR<br/>
          <span style={{ color:C.orange, WebkitTextStroke:`1px ${C.orange}` }}>FOTOS</span>
        </h1>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"end" }}>
          <p style={{
            fontFamily:"Inter, sans-serif", fontSize:18, color:"rgba(248,248,246,.55)",
            lineHeight:1.7, margin:0, fontWeight:400, maxWidth:480,
          }}>
            Muestra todas tus refacciones en un catálogo organizado. Tu cliente encuentra la pieza, el precio y la disponibilidad — y te escribe con el pedido listo.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", gap:12 }}>
              <a href="#planes" style={{
                flex:1, textAlign:"center",
                padding:"16px 0",
                background:C.orange, color:C.white,
                fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:700,
                letterSpacing:3, textTransform:"uppercase", textDecoration:"none",
                transition:"background .15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.orangeLt}
              onMouseLeave={e=>e.currentTarget.style.background=C.orange}
              >Ver planes</a>
              <a href="#cómo-funciona" style={{
                flex:1, textAlign:"center",
                padding:"16px 0",
                border:`2px solid rgba(248,248,246,.2)`, color:"rgba(248,248,246,.55)",
                fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:600,
                letterSpacing:3, textTransform:"uppercase", textDecoration:"none",
                transition:"all .15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.orange; e.currentTarget.style.color=C.white; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(248,248,246,.2)"; e.currentTarget.style.color="rgba(248,248,246,.55)"; }}
              >Ver demo</a>
            </div>
            {/* mini stats */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              border:`1px solid rgba(248,248,246,.08)`,
            }}>
              {[["Sin apps","tu cliente solo abre el link"],["Pedidos claros","directo a WhatsApp"],["Listo en minutos","sin técnicos"]].map(([a,b],i)=>(
                <div key={a} style={{
                  padding:"20px 16px",
                  borderLeft: i>0 ? `1px solid rgba(248,248,246,.08)` : "none",
                }}>
                  <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:700, color:C.white, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>{a}</p>
                  <p style={{ fontFamily:"Inter, sans-serif", fontSize:11, color:"rgba(248,248,246,.35)", margin:0 }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEMA ─────────────────────────────────────────────── */
function Problem() {
  const pains = [
    { n:"01", title:"Fotos de catálogo una por una", desc:"El cliente pregunta por una pieza, mandas la foto. Pregunta por otra, mandas otra. Todo el día pegado al teléfono respondiendo lo mismo." },
    { n:"02", title:"Precios que nadie recuerda", desc:"¿Cuánto costaba el filtro? ¿Ya cambió el precio de esa correa? El cliente pregunta, tú buscas, pierdes tiempo." },
    { n:"03", title:"Pedidos sin referencia", desc:"'El cojinete chico de Ford'. ¿Cuál Ford? ¿Qué año? ¿Qué medida? Los pedidos confusos se surten mal." },
  ];
  return (
    <section style={{ background:C.bg, padding:"0" }}>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"100px 64px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }}>
          <div>
            <Label orange>El problema</Label>
            <h2 style={{
              fontFamily:"Inter, sans-serif", fontWeight:900,
              fontSize:"clamp(32px, 4vw, 56px)",
              color:C.ink, lineHeight:1, margin:0,
              textTransform:"uppercase", letterSpacing:-2,
            }}>
              VENDER<br/>POR WHATSAPP<br/>
              <span style={{ color:C.orange }}>SIN ORDEN</span><br/>
              TE CUESTA<br/>TIEMPO Y VENTAS
            </h2>
          </div>
          <div>
            {pains.map((p,i)=>(
              <div key={p.n} style={{
                borderTop:`2px solid ${C.border}`,
                ...(i===pains.length-1 ? {borderBottom:`2px solid ${C.border}`} : {}),
                padding:"28px 0",
                display:"flex", gap:24,
              }}>
                <span style={{ fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:800, color:C.orange, letterSpacing:2, minWidth:28, paddingTop:3 }}>{p.n}</span>
                <div>
                  <h3 style={{ fontFamily:"Inter, sans-serif", fontSize:16, fontWeight:700, color:C.ink, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:.5 }}>{p.title}</h3>
                  <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, lineHeight:1.65 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CÓMO FUNCIONA ────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", title:"Carga tus refacciones", desc:"Sube foto, número de parte, marca, modelo de aplicación y precio. Una vez, desde tu celular o computadora." },
    { n:"02", title:"Comparte el link", desc:"Un link único para tu refaccionaria. Lo mandas por WhatsApp, lo pones en tu negocio, donde quieras." },
    { n:"03", title:"Recibe pedidos con datos", desc:"El cliente busca la pieza, la agrega y te escribe con el número de parte, cantidad y aplicación. Sin confusión." },
  ];
  return (
    <section id="cómo-funciona" style={{ background:C.bgAlt, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:64, gap:32, flexWrap:"wrap" }}>
          <div>
            <Label orange>Cómo funciona</Label>
            <h2 style={{
              fontFamily:"Inter, sans-serif", fontWeight:900,
              fontSize:"clamp(30px, 3.5vw, 52px)",
              color:C.ink, lineHeight:1, margin:0,
              textTransform:"uppercase", letterSpacing:-2,
            }}>
              TRES PASOS.<br/>
              <span style={{ color:C.orange }}>SIN COMPLICACIONES.</span>
            </h2>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
          <div>
            {steps.map((s,i)=>(
              <div key={s.n} style={{
                display:"grid", gridTemplateColumns:"56px 1fr",
                marginBottom: i < steps.length-1 ? 0 : 0,
                position:"relative",
              }}>
                {/* connector line */}
                {i < steps.length-1 && (
                  <div style={{
                    position:"absolute", left:27, top:52, bottom:0,
                    width:2, background:C.border, zIndex:0,
                  }}/>
                )}
                {/* circle */}
                <div style={{
                  width:54, height:54,
                  border:`2px solid ${C.orange}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:C.bgAlt, position:"relative", zIndex:1, flexShrink:0,
                }}>
                  <span style={{ fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:800, color:C.orange, letterSpacing:1 }}>{s.n}</span>
                </div>
                <div style={{ paddingLeft:24, paddingBottom:48 }}>
                  <h3 style={{ fontFamily:"Inter, sans-serif", fontSize:16, fontWeight:800, color:C.ink, margin:"12px 0 8px", textTransform:"uppercase", letterSpacing:.5 }}>{s.title}</h3>
                  <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0, lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <MockupPlaceholder label="Screenshot del catálogo — vista del cliente" height={420} note="Reemplaza con imagen de la app" />
        </div>
      </div>
    </section>
  );
}

/* ─── BENEFICIOS ───────────────────────────────────────────── */
function Benefits() {
  const items = [
    { title:"Busca por número de parte o aplicación", desc:"Tu cliente escribe el número de parte o el modelo del vehículo y encuentra lo que necesita sin preguntarte." },
    { title:"Organizado por categoría", desc:"Filtros, baleros, bandas, bujías, frenos — cada sección en su lugar. Sin revolver todo en un mismo chat." },
    { title:"Precio visible siempre", desc:"El cliente ve el precio antes de preguntar. Menos negociación, más pedidos directos." },
    { title:"Stock y disponibilidad", desc:"Marca qué tienes disponible y qué no. El cliente sabe de inmediato si lo buscado está en tu bodega." },
    { title:"Actualiza tú mismo en segundos", desc:"Entra nueva mercancía, ajusta precios o retira lo que ya se agotó. Desde el celular, sin técnicos." },
    { title:"Pedidos con todos los datos", desc:"Número de parte, marca, cantidad, aplicación. Todo en un solo mensaje. Listo para surtir sin ir y venir." },
  ];
  return (
    <section id="beneficios" style={{ background:C.bg, padding:"100px 64px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ marginBottom:56 }}>
          <Label orange>Beneficios</Label>
          <h2 style={{
            fontFamily:"Inter, sans-serif", fontWeight:900,
            fontSize:"clamp(30px, 3.5vw, 52px)",
            color:C.ink, lineHeight:1, margin:0,
            textTransform:"uppercase", letterSpacing:-2,
          }}>
            TODO LO QUE TU REFACCIONARIA<br/>
            <span style={{ color:C.orange }}>NECESITA PARA ORDENARSE</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:0, border:`2px solid ${C.ink}` }}>
          {items.map((it,i)=>{
            const col = i % 3;
            const row = Math.floor(i / 3);
            return (
              <div key={it.title} style={{
                padding:"32px 28px",
                borderRight: col < 2 ? `1px solid ${C.border}` : "none",
                borderBottom: row < 1 ? `1px solid ${C.border}` : "none",
                background:C.bg,
                transition:"background .15s",
                cursor:"default",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.bgAlt}
              onMouseLeave={e=>e.currentTarget.style.background=C.bg}
              >
                <div style={{ width:28, height:3, background:C.orange, marginBottom:20 }} />
                <h3 style={{ fontFamily:"Inter, sans-serif", fontSize:14, fontWeight:800, color:C.ink, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:.5 }}>{it.title}</h3>
                <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:C.muted, margin:0, lineHeight:1.65 }}>{it.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── SHOWCASE ─────────────────────────────────────────────── */
function Showcase() {
  return (
    <section style={{ background:C.dark, padding:"100px 64px", borderTop:`4px solid ${C.orange}` }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, gap:32, flexWrap:"wrap" }}>
          <div>
            <Label light orange>La experiencia</Label>
            <h2 style={{
              fontFamily:"Inter, sans-serif", fontWeight:900,
              fontSize:"clamp(28px, 3.5vw, 50px)",
              color:C.white, lineHeight:1, margin:0,
              textTransform:"uppercase", letterSpacing:-2,
            }}>
              UN CATÁLOGO QUE<br/>
              <span style={{ color:C.orange }}>TRABAJA POR TI</span>
            </h2>
          </div>
          <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:"rgba(248,248,246,.4)", maxWidth:340, lineHeight:1.65, margin:0 }}>
            Tu cliente busca la pieza desde su teléfono. Tú recibes el pedido completo en WhatsApp. Sin llamadas de aclaración.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:8 }}>
          <MockupPlaceholder label="Vista principal — catálogo de refacciones" height={480} note="Screenshot de la app aquí" dark />
          <MockupPlaceholder label="Detalle de pieza" height={480} note="Screenshot producto" dark />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <MockupPlaceholder label="Búsqueda por aplicación" height={232} note="Screenshot búsqueda" dark />
            <MockupPlaceholder label="Pedido en WhatsApp" height={232} note="Screenshot pedido" dark />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIAL ──────────────────────────────────────────── */
function Social() {
  return (
    <section style={{ background:C.bgAlt, padding:"100px 64px", borderBottom:`2px solid ${C.border}` }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:48, alignItems:"center" }}>
          <div style={{ width:4, height:120, background:C.orange, flexShrink:0 }} />
          <div>
            <blockquote style={{
              fontFamily:"Inter, sans-serif", fontWeight:700,
              fontSize:"clamp(20px, 2.5vw, 32px)",
              color:C.ink, lineHeight:1.3, margin:"0 0 28px",
              textTransform:"uppercase", letterSpacing:-1,
            }}>
              "Antes perdía media hora diaria mandando fotos. Ahora mando el link y el pedido me llega con el número de parte y todo."
            </blockquote>
            <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:700, color:C.orange, letterSpacing:3, textTransform:"uppercase", margin:"0 0 4px" }}>
              — Nombre del cliente
            </p>
            <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:C.muted, margin:0 }}>
              Refaccionaria · Ciudad, México
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PLANES ───────────────────────────────────────────────── */
function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loginModalPlan, setLoginModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const [unlockModalPlan, setUnlockModalPlan] = useState<CatalogCheckoutPlan | null>(null);
  const activeBilling = billingCycleCopy[billingCycle];

  return (
    <section id="planes" style={{ background:C.bg, padding:"100px 64px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ marginBottom:42 }}><Label orange>Planes</Label><h2 style={{ fontFamily:"Inter, sans-serif", fontWeight:900, fontSize:"clamp(30px, 3.5vw, 52px)", color:C.ink, lineHeight:1, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:-2 }}>EMPIEZA HOY.<br/><span style={{ color:C.orange }}>SIN COMPROMISOS.</span></h2><p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, margin:0 }}>Sin contratos largos. Cancela cuando quieras.</p></div>
        <div role="group" aria-label="Seleccionar forma de pago" style={{ display:"flex", gap:8, marginBottom:12 }}>{(Object.keys(billingCycleCopy) as BillingCycle[]).map(cycle=><button key={cycle} type="button" aria-pressed={billingCycle===cycle} onClick={()=>setBillingCycle(cycle)} style={{ padding:"10px 22px", border:`2px solid ${billingCycle===cycle ? C.orange : C.ink}`, background:billingCycle===cycle ? C.orange : "transparent", color:billingCycle===cycle ? C.white : C.ink, fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:800, letterSpacing:3, textTransform:"uppercase", cursor:"pointer" }}>{billingCycleCopy[cycle].label}</button>)}</div>
        <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:C.muted, margin:"0 0 36px" }}>{activeBilling.helper}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:0, border:`2px solid ${C.ink}` }}>{catalogPlans.map((p,i)=><div key={p.name} style={{ padding:"40px 28px", background:p.recommended ? C.ink : C.bg, borderRight:i < catalogPlans.length-1 ? `1px solid ${p.recommended ? C.borderDk : C.border}` : "none", display:"flex", flexDirection:"column", position:"relative" }}>{p.recommended && <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:C.orange }} />}<span style={{ fontFamily:"Inter, sans-serif", fontSize:9, fontWeight:800, letterSpacing:4, textTransform:"uppercase", color:p.recommended ? C.orange : C.muted, display:"block", marginBottom:8 }}>{p.name}</span><h3 style={{ fontFamily:"Inter, sans-serif", fontSize:15, fontWeight:700, color:p.recommended ? C.white : C.ink, margin:"0 0 24px", textTransform:"uppercase", letterSpacing:.5, lineHeight:1.3 }}>{p.limit}</h3><div style={{ display:"flex", alignItems:"baseline", gap:4, margin:"0 0 8px" }}><span style={{ fontFamily:"Inter, sans-serif", fontSize:42, fontWeight:900, color:p.recommended ? C.orange : C.ink, letterSpacing:-2 }}>{p.prices[billingCycle]}</span><span style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:C.muted }}>{p.periodLabel[billingCycle]}</span></div>{billingCycle==="annual" && p.annualNote && <p style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:C.orange, margin:"0 0 18px" }}>{p.annualNote}</p>}<div style={{ height:2, background:p.recommended ? C.borderDk : C.border, marginBottom:24 }} /><ul style={{ margin:"0 0 32px", padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:12, flex:1 }}>{p.benefits.map(f=><li key={f} style={{ display:"flex", gap:10, alignItems:"flex-start" }}><span style={{ color:C.orange, fontSize:10, fontWeight:900, marginTop:3, flexShrink:0 }}>►</span><span style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:p.recommended ? "rgba(248,248,246,.6)" : C.muted, lineHeight:1.5 }}>{f}</span></li>)}</ul><a href={p.name===FREE_CATALOG_PLAN_NAME ? LOGIN_POS_PATH : "#planes"} onClick={(event)=>{ trackMetaEvent("Contact", { content_name:p.name, plan_price:p.prices[billingCycle] }); if(p.name!==FREE_CATALOG_PLAN_NAME){ event.preventDefault(); const checkoutPlan=buildCatalogCheckoutPlan(p,billingCycle); if(!checkoutPlan)return; if(!hasStoredPosSession()){ setLoginModalPlan(checkoutPlan); return; } setUnlockModalPlan(checkoutPlan); } }} style={{ display:"block", textAlign:"center", padding:"14px 0", background:p.recommended ? C.orange : "transparent", border:p.recommended ? "none" : `2px solid ${C.ink}`, color:p.recommended ? C.white : C.ink, fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:800, letterSpacing:3, textTransform:"uppercase", textDecoration:"none", transition:"all .15s" }}>Elegir plan</a></div>)}</div>
      </div>
      <FreeCatalogLoginModal open={Boolean(loginModalPlan)} planName={loginModalPlan?.name} onAuthenticated={() => { setUnlockModalPlan(loginModalPlan); setLoginModalPlan(null); }} onClose={()=>setLoginModalPlan(null)} />
      <FeatureUnlockModal open={Boolean(unlockModalPlan)} onClose={()=>setUnlockModalPlan(null)} title={`Activa ${unlockModalPlan?.name ?? "tu plan"}`} message="Completa el pago para activar el paquete seleccionado y entrar al punto de venta." buttonText="Continuar al pago" unlockFeature="Catalog" initialPlan={unlockModalPlan ? { amount:unlockModalPlan.amount, plan:unlockModalPlan.plan, label:unlockModalPlan.name } : undefined} onPaymentSuccess={() => { window.location.href = "/MainSales"; }} />
    </section>
  );
}
/* ─── FAQ ──────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"¿Mis clientes necesitan instalar alguna app?", a:"No. Tu catálogo es un link que abren desde cualquier navegador en su celular o computadora. Sin registros ni descargas." },
    { q:"¿Puedo buscar por número de parte o aplicación?", a:"Sí, el plan Pro incluye búsqueda avanzada. Tu cliente escribe el número de parte o el modelo del vehículo y encuentra la pieza de inmediato." },
    { q:"¿Puedo actualizar precios y stock yo mismo?", a:"Completamente. Entra nueva mercancía, ajusta precios o marca qué está agotado en segundos desde tu celular." },
    { q:"¿Funciona con WhatsApp Business?", a:"Sí. Los pedidos llegan directamente a tu número de WhatsApp Business con todos los datos de la pieza." },
    { q:"¿Necesito saber de páginas web o tecnología?", a:"Nada. Si puedes mandar un mensaje por WhatsApp, puedes usar Ravekh." },
  ];
  return (
    <section style={{ background:C.bgAlt, padding:"100px 64px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div style={{ marginBottom:56 }}>
          <Label orange>Preguntas frecuentes</Label>
          <h2 style={{
            fontFamily:"Inter, sans-serif", fontWeight:900,
            fontSize:"clamp(28px, 3vw, 44px)",
            color:C.ink, lineHeight:1, margin:0,
            textTransform:"uppercase", letterSpacing:-2,
          }}>RESOLVEMOS TUS DUDAS</h2>
        </div>
        {faqs.map((f,i)=>(
          <div key={f.q} style={{ borderTop:`2px solid ${C.border}`, ...(i===faqs.length-1?{borderBottom:`2px solid ${C.border}`}:{}) }}>
            <button
              onClick={()=>setOpen(open===i ? null : i)}
              style={{
                width:"100%", padding:"22px 0",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"transparent", border:"none", cursor:"pointer", textAlign:"left", gap:16,
              }}
            >
              <span style={{ fontFamily:"Inter, sans-serif", fontSize:15, fontWeight:700, color:C.ink, textTransform:"uppercase", letterSpacing:.5, lineHeight:1.3 }}>{f.q}</span>
              <span style={{ color:C.orange, fontSize:22, flexShrink:0, fontWeight:700, transition:"transform .15s", transform: open===i ? "rotate(45deg)" : "none", display:"block" }}>+</span>
            </button>
            {open===i && (
              <p style={{ fontFamily:"Inter, sans-serif", fontSize:14, color:C.muted, lineHeight:1.7, margin:"0 0 22px", paddingRight:32 }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA FINAL ────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{
      background:C.dark,
      padding:"120px 64px",
      position:"relative", overflow:"hidden",
      borderTop:`4px solid ${C.orange}`,
    }}>
      <div style={{
        position:"absolute", bottom:"-10%", right:"-2%",
        fontFamily:"Inter, sans-serif", fontWeight:900,
        fontSize:"clamp(200px, 35vw, 420px)",
        color:"rgba(255,255,255,0.025)",
        lineHeight:1, userSelect:"none", pointerEvents:"none",
        letterSpacing:-20,
      }}>00</div>
      <div style={{ maxWidth:1080, margin:"0 auto", position:"relative" }}>
        <Label light orange>Empieza hoy</Label>
        <h2 style={{
          fontFamily:"Inter, sans-serif", fontWeight:900,
          fontSize:"clamp(36px, 6vw, 88px)",
          color:C.white, lineHeight:.95, margin:"0 0 28px",
          textTransform:"uppercase", letterSpacing:-3,
          maxWidth:700,
        }}>
          TU REFACCIONARIA<br/>
          MERECE VENDER<br/>
          <span style={{ color:C.orange }}>CON ORDEN</span>
        </h2>
        <p style={{ fontFamily:"Inter, sans-serif", fontSize:16, color:"rgba(248,248,246,.45)", maxWidth:480, lineHeight:1.7, margin:"0 0 48px" }}>
          Deja el caos de las fotos por WhatsApp. Muestra tus piezas en un catálogo claro, recibe pedidos con todos los datos y surte más rápido.
        </p>
        <a href="#planes" style={{
          display:"inline-block",
          padding:"18px 52px",
          background:C.orange, color:C.white,
          fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:800,
          letterSpacing:4, textTransform:"uppercase", textDecoration:"none",
          transition:"background .15s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background=C.orangeLt}
        onMouseLeave={e=>e.currentTarget.style.background=C.orange}
        >Ver planes y empezar</a>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background:C.ink,
      padding:"32px 64px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      flexWrap:"wrap", gap:16,
      borderTop:`1px solid ${C.borderDk}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:4, height:20, background:C.orange }} />
        <span style={{ fontFamily:"Inter, sans-serif", fontSize:16, fontWeight:900, color:C.white, letterSpacing:3, textTransform:"uppercase" }}>RAVEKH</span>
      </div>
      <p style={{ fontFamily:"Inter, sans-serif", fontSize:11, color:"rgba(248,248,246,.3)", margin:0, textTransform:"uppercase", letterSpacing:1 }}>
        © {new Date().getFullYear()} Ravekh · Catálogo digital para refaccionarias
      </p>
      <div style={{ display:"flex", gap:24 }}>
        {["Términos","Privacidad","Contacto"].map(l=>(
          <a key={l} href="#" style={{ fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:600, color:"rgba(248,248,246,.3)", textDecoration:"none", letterSpacing:2, textTransform:"uppercase" }}
          onMouseEnter={e=>e.target.style.color=C.orange}
          onMouseLeave={e=>e.target.style.color="rgba(248,248,246,.3)"}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

/* ─── APP ──────────────────────────────────────────────────── */
export function RavekhRefaccionesPage() {
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