import { Link } from "react-router-dom";

const sections = [
  ["1. Estado del producto", "RAVEKH CRM se encuentra en desarrollo. Sus funciones, disponibilidad y condiciones comerciales pueden cambiar antes de su lanzamiento público."],
  ["2. Uso del servicio", "El servicio está dirigido a negocios que administran sus propias relaciones con clientes. Cada negocio es responsable de contar con las autorizaciones necesarias para usar sus cuentas, números y datos."],
  ["3. WhatsApp Business", "La conexión requiere una cuenta elegible, autorización del negocio propietario y el cumplimiento de los requisitos aplicables de Meta. RAVEKH no garantiza la aprobación, continuidad o disponibilidad de servicios de terceros."],
  ["4. Datos y comunicaciones", "El negocio debe utilizar las funciones de comunicación de forma lícita y respetar las preferencias de sus contactos. El tratamiento de información se describe en la política de privacidad de RAVEKH CRM."],
  ["5. Contacto", "Para preguntas sobre el servicio o estos términos, escribe a ravekh@ravekh.com. Este documento es un borrador informativo pendiente de revisión legal antes del lanzamiento comercial."],
] as const;

export const TermsPage = () => (
  <main className="min-h-screen bg-fondo-oscuro text-white px-4 py-10 md:px-10">
    <div className="max-w-5xl mx-auto">
      <Link to="/crm" className="inline-flex mb-6 text-sm underline">← Volver a RAVEKH CRM</Link>
      <div className="rounded-2xl border border-white/20 bg-white/5 p-5 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold">Términos del servicio — RAVEKH CRM</h1>
        <p className="text-white/80 mt-2">Borrador informativo pendiente de revisión legal.</p>
        <div className="grid gap-4 mt-8">
          {sections.map(([title, content]) => <section key={title} className="rounded-xl border border-white/15 bg-black/20 p-4"><h2 className="font-semibold text-xl">{title}</h2><p className="text-white/85 mt-2 leading-relaxed">{content}</p></section>)}
        </div>
      </div>
    </div>
  </main>
);
