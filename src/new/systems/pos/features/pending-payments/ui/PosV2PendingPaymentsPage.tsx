import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosPendingPaymentsApi } from "../api/PosPendingPaymentsApi";
import { PendingAccount, PendingAccountDetail, PendingPaymentRecord } from "../model/PendingPayment";
import { PendingPaymentsPage } from "../pages/PendingPaymentsPage";
import { PendingPaymentsService } from "../services/PendingPaymentsService";
import "./PosV2PendingPaymentsPage.css";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: currency || "MXN" }).format(value || 0);

const shortDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
};

export const PosV2PendingPaymentsPage = () => {
  const session = useMemo(() => readPosSessionSnapshot(), []);
  const page = useMemo(() => {
    const client = new FetchHttpClient(getPosApiBaseUrl());
    return new PendingPaymentsPage(new PendingPaymentsService(new PosPendingPaymentsApi(client)));
  }, []);
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [selected, setSelected] = useState<PendingAccountDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState<PendingPaymentRecord | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!session.token || !session.businessId) {
      setError("No hay una sesión activa para cargar cuentas por cobrar.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setAccounts(await page.list(session.businessId, session.token));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar las cuentas por cobrar.");
    } finally {
      setLoading(false);
    }
  }, [page, session.businessId, session.token]);

  const openDetail = useCallback(async (account: PendingAccount) => {
    setError("");
    try {
      setSelected(await page.detail(account.orderId, session.token));
      setEditing(null);
      setAmount("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar el detalle de la cuenta.");
    }
  }, [page, session.token]);

  useEffect(() => { void loadAccounts(); }, [loadAccounts]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es-MX");
    if (!normalized) return accounts;
    return accounts.filter((item) => `${item.customerName} ${item.orderId}`.toLocaleLowerCase("es-MX").includes(normalized));
  }, [accounts, query]);

  const savePayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || busy) return;
    const parsed = Number(amount.replace(",", "."));
    const available = selected.balance + Number(editing?.payment ?? 0);
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await page.updatePayment(editing.id, parsed, available, session.token);
      } else {
        await page.createPayment(selected.orderId, parsed, available, session.token);
      }
      const refreshed = await page.detail(selected.orderId, session.token);
      setSelected(refreshed);
      setEditing(null);
      setAmount("");
      setNotice(editing ? "Abono actualizado." : "Abono registrado.");
      await loadAccounts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el abono.");
    } finally {
      setBusy(false);
    }
  };

  const removePayment = async (payment: PendingPaymentRecord) => {
    if (!selected || busy || !window.confirm("¿Eliminar este abono? El saldo de la orden se recalculará.")) return;
    setBusy(true);
    setError("");
    try {
      await page.deletePayment(payment.id, session.token);
      const refreshed = await page.detail(selected.orderId, session.token);
      setSelected(refreshed);
      setNotice("Abono eliminado.");
      await loadAccounts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible eliminar el abono.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PosV2Shell title="Cuentas por cobrar" subtitle="Saldos pendientes y abonos de tus clientes">
      <section className="pos-pending">
        <div className="pos-pending__toolbar">
          <div>
            <h2>Cuentas pendientes</h2>
            <p>Consulta saldos y registra abonos sin superar la deuda disponible.</p>
          </div>
          <input autoCorrect="on" spellCheck={true} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente u orden" aria-label="Buscar cuentas por cobrar" />
        </div>
        {error ? <p className="pos-pending__message is-error">{error}</p> : null}
        {notice ? <p className="pos-pending__message is-success">{notice}</p> : null}
        <div className="pos-pending__layout">
          <div className="pos-pending__list" aria-busy={loading}>
            {loading ? <div className="pos-pending__empty">Cargando cuentas...</div> : null}
            {!loading && filtered.length === 0 ? <div className="pos-pending__empty">No hay cuentas pendientes.</div> : null}
            {filtered.map((account) => (
              <button key={account.orderId} type="button" className={`pos-pending__account ${selected?.orderId === account.orderId ? "is-active" : ""}`} onClick={() => void openDetail(account)}>
                <span><strong>{account.customerName}</strong><small>Orden #{account.orderId} · {shortDate(account.date)}</small></span>
                <span className="pos-pending__balance"><small>Saldo</small><strong>{money(account.balance, account.currency)}</strong></span>
              </button>
            ))}
          </div>
          <aside className="pos-pending__detail">
            {!selected ? <div className="pos-pending__empty">Selecciona una cuenta para ver su historial.</div> : (
              <>
                <header><div><span className="pos-pending__eyebrow">Orden #{selected.orderId}</span><h3>{selected.customerName}</h3></div><button type="button" className="pos-pending__close" onClick={() => setSelected(null)} aria-label="Cerrar detalle">×</button></header>
                <div className="pos-pending__summary">
                  <div><span>Total</span><strong>{money(selected.total, selected.currency)}</strong></div>
                  <div><span>Pagado</span><strong>{money(selected.paid, selected.currency)}</strong></div>
                  <div className="is-highlight"><span>Pendiente</span><strong>{money(selected.balance, selected.currency)}</strong></div>
                </div>
                <form className="pos-pending__form" onSubmit={savePayment}>
                  <label htmlFor="pending-payment-amount">{editing ? "Editar abono" : "Nuevo abono"}</label>
                  <div className="pos-pending__amount-row">
                    <input id="pending-payment-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" disabled={busy} />
                    <button type="submit" className="is-primary" disabled={busy}>{busy ? "Guardando…" : editing ? "Actualizar" : "Registrar"}</button>
                    {editing ? <button type="button" onClick={() => { setEditing(null); setAmount(""); }} disabled={busy}>Cancelar</button> : null}
                  </div>
                  <small>Máximo disponible: {money(selected.balance + Number(editing?.payment ?? 0), selected.currency)}</small>
                </form>
                <div className="pos-pending__history">
                  <h4>Historial de abonos</h4>
                  {selected.payments.length === 0 ? <p className="pos-pending__muted">Todavía no hay abonos registrados.</p> : null}
                  {selected.payments.map((payment) => (
                    <div className="pos-pending__payment" key={payment.id}>
                      <div><strong>{money(payment.payment, selected.currency)}</strong><small>{shortDate(payment.date)}</small></div>
                      <div className="pos-pending__payment-actions">
                        <button type="button" onClick={() => { setEditing(payment); setAmount(String(payment.payment)); }}>Editar</button>
                        <button type="button" className="is-danger" onClick={() => void removePayment(payment)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </PosV2Shell>
  );
};
