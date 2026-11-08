import { readPosCurrency, resolvePosCurrency } from "../../../shared/config/posCurrency";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { cashClosingCsv } from "../model/CashClosing";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import type { EmployeeSummary } from "../interface/ICashClosingRepository";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { usePlanActionGuard } from "../../../shared/hooks/usePlanActionGuard";
import { PlanUpgradeModal } from "../../../shared/ui/PlanUpgradeModal";
import "./PosV2CashClosingPage.css";

const API_BASE_URL = getPosApiBaseUrl();
type ClosingView = {
  id: number;
  employeeId: number;
  total: number;
  date: string;
  employeeName: string;
};

export const PosV2CashClosingPage = () => {
  const [session] = useState(readPosSessionSnapshot);
  const hasSession = Boolean(session.token) && session.businessId > 0;
  const role = resolvePosOperatorRole(session.token);
  const canManageClosings = role === "admin" || role === "manager";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => (session.employeeId > 0 ? String(session.employeeId) : ""));
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [recentClosings, setRecentClosings] = useState<ClosingView[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentCurrency, setCurrentCurrency] = useState(() => readPosCurrency().code as string);
  const requestSequence = useRef(0);
  const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: resolvePosCurrency(currentCurrency).iso });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const hasSalesToClose = currentTotal > 0;
  const { runWithPlanAccess, blockedAction, closeBlockedActionModal, goToUpgradePlan, checkingPlanAccess } = usePlanActionGuard();

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosCashClosingPage();
  }, []);

  const refreshEmployeeData = async (employeeId: number, token: string) => {
    const requestId = ++requestSequence.current;
    const [currentResult, historyResult] = await Promise.allSettled([
      page.loadCurrentPreview(employeeId, token),
      page.listByEmployee(employeeId, token),
    ]);
    if (requestId !== requestSequence.current) return;

    if (currentResult.status === "fulfilled") {
      setCurrentTotal(currentResult.value.total);
      setCurrentCurrency(currentResult.value.currency);
    } else {
      setCurrentTotal(0);
      setError(currentResult.reason instanceof Error ? currentResult.reason.message : "No se pudo consultar el corte actual.");
    }

    if (historyResult.status === "fulfilled") {
      setRecentClosings(historyResult.value.slice(0, 12));
    } else {
      setRecentClosings([]);
      setError(historyResult.reason instanceof Error ? historyResult.reason.message : "No se pudo consultar el historial de cortes.");
    }
  };

  const exportClosings = async () => {
    await runWithPlanAccess("cashClosing.export", () => {
      const url = URL.createObjectURL(new Blob(["\uFEFF", cashClosingCsv(recentClosings)], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a"); link.href = url; link.download = `cortes-${selectedEmployeeId}.csv`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  };

  const refreshData = async (requestedEmployeeId = Number(selectedEmployeeId), listedEmployees?: EmployeeSummary[]) => {
    if (!hasSession) {
      setError("No hay sesión activa para consultar corte de caja.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let employeeId = session.employeeId;
      if (canManageClosings) {
        const loadedEmployees = listedEmployees ?? await page.listEmployees(session.businessId, session.token);
        setEmployees(loadedEmployees);
        employeeId = loadedEmployees.find(employee => employee.id === requestedEmployeeId)?.id
          ?? loadedEmployees[0]?.id ?? 0;
      }

      if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
        setError("No encontramos un empleado para consultar cortes.");
        setCurrentTotal(0);
        setRecentClosings([]);
        return;
      }

      setSelectedEmployeeId(String(employeeId));
      await refreshEmployeeData(employeeId, session.token);
    } catch {
      setError("No se pudo cargar la información del corte de caja. Verifica token, negocio y conectividad.");
      setCurrentTotal(0);
      setRecentClosings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSession) void refreshData();
    return () => { requestSequence.current++; };
  }, [hasSession]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!canManageClosings) {
      setError("Tu cuenta no tiene permiso para confirmar el corte de caja.");
      return;
    }

    const employeeId = Number(selectedEmployeeId);
    if (!employees.some(employee => employee.id === employeeId)) {
      setError("Selecciona un empleado válido para registrar el corte.");
      return;
    }

    if (!hasSalesToClose) {
      setError("No hay ventas acumuladas para cerrar caja.");
      return;
    }

    await runWithPlanAccess("cashClosing.create", async () => {
      setSaving(true);
      setError(null);

      try {
        const preview = await page.loadCurrentPreview(employeeId, session.token);
        const normalizedTotal = preview.total;
        if (!Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
          setCurrentTotal(0);
          setError("No hay ventas acumuladas para cerrar caja.");
          return;
        }
        await page.register({ employeeId }, session.token);
        setToast(`Corte registrado por ${new Intl.NumberFormat("es-MX", { style: "currency", currency: resolvePosCurrency(preview.currency).iso }).format(normalizedTotal)}.`);
        await refreshEmployeeData(employeeId, session.token);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No fue posible registrar el corte de caja.");
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <PosV2Shell title="Corte de caja" subtitle={canManageClosings ? "Consulta y registra los cortes de tus empleados." : "Consulta tu corte de caja."}>
      <section className="pos-v2-cash-closing">
        <header className="pos-v2-cash-closing__header">
          <div>
            <h2>Cierre de turno</h2>
            <p>{canManageClosings ? "Selecciona un empleado para consultar su total y su historial de cortes." : "Consulta tu total y tu historial de cortes en esta sucursal."}</p>
          </div>
          <button type="button" onClick={() => void refreshData()} disabled={loading || saving || checkingPlanAccess}>Actualizar</button>
        </header>

        {!hasSession ? <p className="pos-v2-cash-closing__error">No hay sesión activa. Inicia sesión para gestionar cierres.</p> : null}
        {error ? <p className="pos-v2-cash-closing__error">{error}</p> : null}
        {toast ? <p className="pos-v2-cash-closing__toast">{toast}</p> : null}
        {!canManageClosings && <p className="pos-v2-cash-closing__warning">Solo administradores y gerentes pueden registrar cortes.</p>}
        {hasSession && canManageClosings && !loading && !error && !hasSalesToClose ? (
          <p className="pos-v2-cash-closing__warning">No hay ventas registradas todavía (total en $0.00), así que el corte está deshabilitado.</p>
        ) : null}

        {canManageClosings && (
          <section className="pos-v2-cash-closing__card">
            <h3>Registrar corte</h3>
            <form onSubmit={handleSubmit} className="pos-v2-cash-closing__form">
              <label>
                Empleado
                <select value={selectedEmployeeId} onChange={event => void refreshData(Number(event.target.value), employees)} disabled={loading || saving || checkingPlanAccess || employees.length === 0}>
                  <option value="" disabled>Selecciona...</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={String(employee.id)}>{employee.fullName}{employee.active ? "" : " (dado de baja)"}</option>
                    ))}
                </select>
              </label>
              <p className="pos-v2-cash-closing__hint">
                Total para el corte actual: <strong>{moneyFormatter.format(currentTotal)}</strong>
              </p>
              <button type="submit" disabled={saving || loading || checkingPlanAccess || !hasSalesToClose}>{saving ? "Guardando..." : checkingPlanAccess ? "Validando plan..." : "Confirmar corte"}</button>
            </form>
          </section>
        )}

        <section className="pos-v2-cash-closing__grid">
          <article className="pos-v2-cash-closing__card">
            <h3>Total actual para cierre</h3>
            {loading ? <p>Cargando resumen...</p> : null}
            {!loading ? (
              <div className="pos-v2-cash-closing__current">
                {canManageClosings && <p><strong>Empleado:</strong> {employees.find(employee => String(employee.id) === selectedEmployeeId)?.fullName ?? "Sin seleccionar"}</p>}
                <p><strong>Total:</strong> <span className={currentTotal > 0 ? "is-positive" : "is-equal"}>{moneyFormatter.format(currentTotal)}</span></p>
              </div>
            ) : null}
          </article>

          <article className="pos-v2-cash-closing__card">
            <h3>Historial reciente</h3>
            <button type="button" disabled={loading || saving || checkingPlanAccess || recentClosings.length === 0} onClick={() => void exportClosings()}>Exportar historial mostrado</button>
            <ul className="pos-v2-cash-closing__history">
              {recentClosings.map((closing) => (
                <li key={closing.id}>
                  <div>
                    <strong>Corte #{closing.id}</strong>
                    <small>{closing.date ? new Date(closing.date).toLocaleString("es-MX") : "Sin fecha"}{closing.employeeName ? ` · ${closing.employeeName}` : ""}</small>
                  </div>
                  <span className={closing.total > 0 ? "is-positive" : "is-equal"}>{closing.total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </li>
              ))}
              {!loading && recentClosings.length === 0 ? <li className="is-empty">Aún no hay cierres registrados.</li> : null}
            </ul>
          </article>
        </section>
      </section>
      {blockedAction ? (
        <PlanUpgradeModal
          open
          title={blockedAction.title}
          message={blockedAction.message}
          requiredPlan={blockedAction.requiredPlan}
          ctaLabel={blockedAction.ctaLabel}
          onClose={closeBlockedActionModal}
          onUpgrade={goToUpgradePlan}
        />
      ) : null}
    </PosV2Shell>
  );
};
