import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { posMoneyFormatter } from "../../../shared/config/posCurrency";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { PosIntelligenceApi } from "../api/PosIntelligenceApi";
import type { BusinessInsight, BusinessIntelligenceResponse, InsightMetric } from "../model/intelligence.types";
import "../../settings/ui/PosSettings.css";

const metricValue = (metric: InsightMetric) => metric.unit === "currency" && typeof metric.value === "number"
  ? posMoneyFormatter.format(metric.value) : `${metric.value}${metric.unit === "percentage" ? "%" : ""}`;
const categories = { SALES: "Ventas", INVENTORY: "Inventario", FINANCE: "Finanzas" };
const severities = { INFO: "Información", WARNING: "Atención", CRITICAL: "Urgente", POSITIVE: "Positivo" };

export const PosV2IntelligencePage = () => {
  const [session] = useState(readPosSessionSnapshot);
  const admin = resolvePosOperatorRole(session.token) === "admin";
  const api = useMemo(() => new PosIntelligenceApi(new FetchHttpClient(getPosApiBaseUrl())), []);
  const [data, setData] = useState<BusinessIntelligenceResponse | null>(null);
  const [items, setItems] = useState<BusinessInsight[]>([]);
  const [history, setHistory] = useState(false);
  const [selected, setSelected] = useState<BusinessInsight | null>(null);
  const [category, setCategory] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const load = async (showHistory = history, refresh = false) => {
    if (!admin) return;
    const id = ++request.current; setBusy(true); setError("");
    try {
      const overview = await api.load(session.token, refresh);
      const response = showHistory && overview.capabilities.history ? await api.history(session.token) : overview;
      if (id !== request.current) return;
      setData(overview); setItems(response.items); setHistory(showHistory && overview.capabilities.history); setSelected(null);
    } catch (cause) { if (id === request.current) setError(cause instanceof Error ? cause.message : "No fue posible cargar el análisis."); }
    finally { if (id === request.current) setBusy(false); }
  };
  useEffect(() => { void load(false); return () => { request.current++; }; }, [admin, api, session.token]);
  const open = async (insight: BusinessInsight) => {
    setBusy(true); setError("");
    try {
      const detail = insight.recordId ? await api.detail(session.token, insight.recordId) : insight;
      setSelected(detail);
      if (detail.recordId && !detail.readAt) {
        const read = await api.markRead(session.token, detail.recordId);
        setSelected(read);
        setItems(current => current.map(item => item.recordId === read.recordId ? read : item));
        setData(current => current ? { ...current, summary: { ...current.summary, unread: Math.max(0, current.summary.unread - 1) } } : current);
      } else setSelected(detail);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible abrir el análisis."); }
    finally { setBusy(false); }
  };
  const dismiss = async () => {
    if (!selected?.recordId || !data?.capabilities.history) return;
    setBusy(true); setError("");
    try { await api.dismiss(session.token, selected.recordId); await load(history); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible archivar el análisis."); }
    finally { setBusy(false); }
  };
  return <PosV2Shell title="Análisis del negocio" subtitle="Señales relevantes con la información que ya registras en RAVEKH">
    <section className="pos-settings">
      {!admin ? <p role="alert">Disponible para administradores.</p> : <>
        <div className="pos-settings__actions"><button aria-pressed={!history} disabled={busy} onClick={() => void load(false)}>Estado del negocio</button>
          {data?.capabilities.history ? <button aria-pressed={history} disabled={busy} onClick={() => void load(true)}>Historial</button> : null}
          <button disabled={busy} onClick={() => void load(history, true)}>Actualizar análisis</button>
        </div>
        {busy ? <p role="status">Cargando análisis…</p> : null}
        {data ? <><div className="pos-settings__stats">{[["Señales", data.summary.total], ["Requieren atención", data.summary.attention], ["Positivas", data.summary.positive], ["Sin leer", data.summary.unread]].map(([label, count]) =>
          <article className="pos-settings__card" key={label}><strong>{count}</strong><span>{label}</span></article>)}
        </div><p>Plan {data.plan} · Actualizado {new Date(data.generatedAt).toLocaleString("es-MX")}</p></> : null}
        {selected ? <article className="pos-settings__card pos-settings__insight" data-severity={selected.severity}>
          <button disabled={busy} onClick={() => setSelected(null)}>Volver a {history ? "historial" : "análisis"}</button>
          <p>{categories[selected.category]} · {severities[selected.severity]}</p><h2>{selected.title}</h2><p>{selected.description}</p>
          <h3>Recomendación</h3><p>{selected.recommendation}</p>
          <dl className="pos-settings__metrics">{selected.metrics.map((metric, i) => <div key={i}><dt>{metric.label}</dt><dd>{metricValue(metric)}</dd>{metric.comparisonValue !== undefined ? <dd>Anterior: {metricValue({ ...metric, value: metric.comparisonValue })}</dd> : null}</div>)}</dl>
          {data?.capabilities.history && selected.recordId && selected.status === "ACTIVE" ? <button disabled={busy} onClick={() => void dismiss()}>Archivar análisis</button> : null}
        </article> : <>
          <h2>{history ? "Historial de análisis" : "Análisis actuales"}</h2>
          <label className="pos-settings__field">Filtrar por área<select value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">Todas</option>{Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          {!busy && data && items.filter(item => category === "ALL" || item.category === category).length === 0 ? <p>No hay análisis {history ? "en el historial" : "para mostrar"}.</p> : null}
          {items.filter(item => category === "ALL" || item.category === category).map(item => <article className="pos-settings__card pos-settings__insight" key={item.recordId ?? item.id} data-severity={item.severity}>
            <p>{categories[item.category]} · {severities[item.severity]}{item.recordId && !item.readAt ? " · Sin leer" : ""}</p><h2>{item.title}</h2><p>{item.description}</p>
            <button disabled={busy} onClick={() => void open(item)}>Ver recomendación</button>
          </article>)}
        </>}
        {data?.lockedFeatures.map(item => <article className="pos-settings__card" key={item.key}><h3>{item.title}</h3><p>{item.description}</p><Link to={`${POS_V2_PATHS.upgradePlan}?requiredPlan=${item.requiredPlan}&feature=${encodeURIComponent(item.title)}`}>Disponible desde {item.requiredPlan}</Link></article>)}
      </>}{error ? <p role="alert">{error}</p> : null}
    </section>
  </PosV2Shell>;
};
