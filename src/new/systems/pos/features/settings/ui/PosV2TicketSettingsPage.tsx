import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import { readPosBusinessFeatures } from "../../../shared/config/posFeatureFlags";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { normalizePosPlan } from "../../../shared/config/posPlanAccess";
import { readTicketCustomization, saveTicketCustomization, TicketCustomization } from "../../../shared/config/posTicket";
import "./PosSettings.css";

const switches = [
  ["showLogo", "Logo del negocio"], ["showBusinessPhone", "Teléfono del negocio"],
  ["showBusinessAddress", "Dirección del negocio"], ["showRfc", "RFC"],
  ["showReturnPolicy", "Política de devoluciones"], ["showVisitQr", "QR de visitas"],
  ["showPaymentMethod", "Método de pago"], ["showCashier", "Nombre del vendedor"],
] as const;

export const PosV2TicketSettingsPage = () => {
  const [session] = useState(readPosSessionSnapshot);
  const [settings, setSettings] = useState(() => readTicketCustomization(session.businessId));
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [business, setBusiness] = useState({ Name: "Mi negocio", PhoneNumber: "", Address: "", Logo: "" });
  const allowed = plan !== null && normalizePosPlan(plan) !== "GRATUITO";
  const admin = resolvePosOperatorRole(session.token) === "admin";
  useEffect(() => {
    let active = true;
    new FetchHttpClient(getPosApiBaseUrl()).request<typeof business & { Plan?: string }>({ method: "GET", path: `business/${session.businessId}`, token: session.token }).then(value => { if (active) { setBusiness(value); setPlan(readPosBusinessFeatures(value).plan || "GRATUITO"); } })
      .catch(() => { if (active) setError("No fue posible verificar tu plan. Vuelve a abrir esta pantalla."); });
    return () => { active = false; };
  }, [session.businessId, session.token]);
  const update = <K extends keyof TicketCustomization>(field: K, value: TicketCustomization[K]) => {
    setMessage(""); setSettings(current => ({ ...current, [field]: value }));
  };
  const save = (event: FormEvent) => {
    event.preventDefault(); if (!allowed || !admin) return;
    try { saveTicketCustomization(session.businessId, settings); setMessage("Ticket guardado. Se aplicará al imprimir tus ventas."); setError(""); }
    catch { setError("No se pudo guardar el ticket en este navegador."); }
  };
  return <PosV2Shell title="Ticket" subtitle="Tu ticket, con tu negocio">
    <section className="pos-settings">
      {!admin ? <p role="alert">Disponible para administradores.</p> : <>
        {plan === null && !error ? <p role="status">Verificando plan…</p> : plan !== null && !allowed ? <div className="pos-settings__notice">
          <h2>Haz que cada venta termine con tu marca</h2><p>Logo, RFC, datos del negocio, política de devoluciones y QR de visitas, desde START.</p>
          <Link to={`${POS_V2_PATHS.upgradePlan}?requiredPlan=START&feature=Ticket`}>Desbloquear con START</Link>
        </div> : null}
        <div className="pos-settings__split"><form className="pos-settings__card" onSubmit={save}>
          <h2>Personaliza tu ticket</h2>
          <fieldset disabled={!allowed}>
            {switches.map(([field, label]) => <label className="pos-settings__row" key={field}>{label}<input type="checkbox" checked={settings[field]} onChange={e => update(field, e.target.checked)} /></label>)}
            {([["businessPhone", "Teléfono", 40], ["businessAddress", "Dirección", 250], ["rfc", "RFC", 13], ["returnPolicy", "Política de devoluciones", 500], ["footerMessage", "Mensaje final", 250]] as const).map(([field, label, max]) =>
              <label key={field} className="pos-settings__field">{label}<textarea rows={field === "returnPolicy" ? 3 : 1} maxLength={max} value={settings[field]} onChange={e => update(field, e.target.value)} /></label>)}
            <button type="submit">Guardar ticket</button>
          </fieldset>
          <p>La configuración se guarda por negocio en este navegador.</p>
          <Link to={POS_V2_PATHS.printers}>Configurar impresora y tamaño del papel</Link>
        </form><aside className="pos-settings__card"><h2>Vista previa</h2><div className="pos-settings__preview">
          {settings.showLogo && business.Logo ? <img src={business.Logo} alt={`Logo de ${business.Name}`} /> : null}<h3>{business.Name || "Mi negocio"}</h3>
          {settings.showRfc ? <p>RFC: {settings.rfc || "XAXX010101000"}</p> : null}
          {settings.showBusinessPhone ? <p>Tel: {settings.businessPhone || business.PhoneNumber || "Sin teléfono configurado"}</p> : null}
          {settings.showBusinessAddress ? <p>{settings.businessAddress || business.Address || "Sin dirección configurada"}</p> : null}<hr />
          <p>Producto de ejemplo ×1 · $100.00</p><strong>Total: $100.00</strong>
          {settings.showPaymentMethod ? <p>Método: Efectivo</p> : null}
          {settings.showCashier ? <p>Vendedor: Tu vendedor</p> : null}
          {settings.showReturnPolicy ? <p>{settings.returnPolicy}</p> : null}<p>{settings.footerMessage}</p>
          {settings.showVisitQr ? <p>QR de visitas · sujeto a fidelidad activa</p> : null}
        </div></aside></div>
      </>}
      {error ? <p role="alert">{error}</p> : null}{message ? <p role="status">{message}</p> : null}
    </section>
  </PosV2Shell>;
};
