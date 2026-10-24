import { useEffect, useMemo, useState } from "react";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { POS_CURRENCIES, persistPosCurrency, resolvePosCurrency } from "../../../shared/config/posCurrency";
import { emitPosBusinessUpdated } from "../../../shared/config/posBusinessEvents";
import { usePlanActionGuard } from "../../../shared/hooks/usePlanActionGuard";
import { PlanUpgradeModal } from "../../../shared/ui/PlanUpgradeModal";
import "./PosSettings.css";

export const PosV2CurrencyPage = () => {
  const [session] = useState(readPosSessionSnapshot);
  const client = useMemo(() => new FetchHttpClient(getPosApiBaseUrl()), []);
  const [current, setCurrent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { runWithPlanAccess, blockedAction, closeBlockedActionModal, goToUpgradePlan } = usePlanActionGuard();
  useEffect(() => {
    let active = true;
    client.request<{ MoneyTipe?: string; Coin_Id?: number }>({ method: "GET", path: `business/${session.businessId}`, token: session.token })
      .then(business => { if (active) { const coin = resolvePosCurrency(business.MoneyTipe ?? business.Coin_Id); setCurrent(coin.id); persistPosCurrency(session.businessId, coin.code); } })
      .catch(() => { if (active) setError("No fue posible cargar la moneda actual."); });
    return () => { active = false; };
  }, [client, session.businessId, session.token]);
  const save = async () => {
    if (selected === null || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await runWithPlanAccess("settings.currency", async () => {
        const result = await client.request<{ Error?: string }>({ method: "POST", path: "monedas", token: session.token, body: { Coin_Id: selected, Business_Id: session.businessId } });
        if (result?.Error) throw new Error(result.Error);
        persistPosCurrency(session.businessId, selected); setCurrent(selected); setSelected(null);
        emitPosBusinessUpdated({ businessId: session.businessId, source: "currency" });
        setMessage("Moneda actualizada.");
      });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar la moneda."); }
    finally { setBusy(false); }
  };
  return <PosV2Shell title="Tipo de moneda" subtitle="Selecciona tu tipo de moneda"><section className="pos-settings">
    <div className="pos-settings__card">
      {current === null && !error ? <p role="status">Cargando moneda…</p> : null}
      {POS_CURRENCIES.map(coin => <label key={coin.id} className="pos-settings__row"><span>{coin.code} · {coin.label}</span>
        <input type="radio" name="currency" value={coin.id} checked={(selected ?? current) === coin.id} disabled={busy || current === null} onChange={() => { setSelected(coin.id); setMessage(""); }} />
      </label>)}
      {selected !== null && selected !== current ? <div className="pos-settings__notice">
        <p>¿Seguro que quieres cambiar la moneda actual? Esto podría alterar la información de los cortes o generar cambios en los reportes.</p>
        <div className="pos-settings__actions"><button disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : "Confirmar cambio"}</button><button disabled={busy} onClick={() => setSelected(null)}>Cancelar</button></div>
      </div> : null}
    </div>{error ? <p role="alert">{error}</p> : null}{message ? <p role="status">{message}</p> : null}
    <PlanUpgradeModal open={Boolean(blockedAction)} title={blockedAction?.title} message={blockedAction?.message} requiredPlan={blockedAction?.requiredPlan} onClose={closeBlockedActionModal} onUpgrade={goToUpgradePlan} />
  </section></PosV2Shell>;
};
