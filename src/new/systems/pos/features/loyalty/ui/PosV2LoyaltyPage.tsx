import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./PosV2LoyaltyPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const isCouponActive = (coupon: { maxRedemptions: number; totalUsers: number; valid: string }) => {
  const availableByLimit = Number(coupon.totalUsers) < Number(coupon.maxRedemptions);
  if (!coupon.valid) return availableByLimit;
  const expiration = new Date(coupon.valid);
  if (Number.isNaN(expiration.getTime())) return availableByLimit;
  return availableByLimit && expiration.getTime() >= Date.now();
};

export const PosV2LoyaltyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session] = useState(() => {
    const snapshot = readPosSessionSnapshot();
    return {
      ...snapshot,
      hasSession: snapshot.token.length > 0 && Number.isFinite(snapshot.businessId) && snapshot.businessId > 0,
    };
  });
  const [lookupDescription, setLookupDescription] = useState("");
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("10");
  const [validDateTime, setValidDateTime] = useState("");
  const [topClientsSort, setTopClientsSort] = useState<"mostFrequent" | "leastFrequent">("mostFrequent");
  const [visitLog, setVisitLog] = useState<Array<{ userId: number; userName: string; date: string; visitCount: number; totalVisits: number }>>([]);
  const [couponList, setCouponList] = useState<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string }>>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [coupon, setCoupon] = useState<{ id: number; qr?: string; description: string; maxRedemptions: number; valid?: string } | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{ name: string; phone: string; address: string; plan: string; chargesEnabled: boolean } | null>(null);
  const [couponDescriptionQuery, setCouponDescriptionQuery] = useState("");
  const [visitQuery, setVisitQuery] = useState("");
  const [isVisitFilterOpen, setIsVisitFilterOpen] = useState(false);
  const [visitQrMode, setVisitQrMode] = useState<"online" | "offline">("online");
  const [visitQrQuantity, setVisitQrQuantity] = useState("1");
  const [visitQrTtl, setVisitQrTtl] = useState("60");
  const [visitQrLoading, setVisitQrLoading] = useState(false);
  const [visitQrTokens, setVisitQrTokens] = useState<Array<{ token: string; qrUrl: string }>>([]);
  const [dynamicQrLoading, setDynamicQrLoading] = useState(false);
  const [dynamicQr, setDynamicQr] = useState<{ token: string; qrUrl: string; refreshAfterSeconds: number } | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createLoyaltyPage();
  }, []);

  const loyaltyView: "coupons" | "visits" | "all" = useMemo(() => {
    if (location.pathname === POS_V2_PATHS.coupons) return "coupons";
    if (location.pathname === POS_V2_PATHS.visits) return "visits";
    return "all";
  }, [location.pathname]);

  const subtitle = loyaltyView === "coupons"
    ? "Gestión de cupones de fidelidad."
    : loyaltyView === "visits"
      ? "Registro de visitas y recurrencia."
      : "Gestión moderna de cupones y beneficios para clientes frecuentes.";

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession) {
      setError("No hay sesión activa para consultar fidelidad.");
      return;
    }

    const descriptionQuery = lookupDescription.trim().toLowerCase();
    if (!descriptionQuery) {
      setError("Ingresa una descripción para buscar cupón.");
      return;
    }

    setLoadingLookup(true);
    setError(null);
    setToast("");

    try {
      const coupons = couponList.length > 0 ? couponList : await page.listCoupons(session.businessId, session.token);
      if (couponList.length === 0) setCouponList(coupons);
      const found = coupons.find((entry) => entry.description.toLowerCase().includes(descriptionQuery));
      if (!found) throw new Error("not-found");
      setCoupon({
        id: found.id,
        qr: found.qr,
        description: found.description,
        maxRedemptions: found.maxRedemptions,
        valid: found.valid,
      });
    } catch {
      setCoupon(null);
      setError("No encontramos un cupón con esa descripción.");
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!session.hasSession) {
      setError("No hay sesión activa para crear cupones.");
      return;
    }

    const qr = `LOYALTY-${session.businessId}-${Date.now()}`;
    const safeDescription = description.trim();
    const maxRedemptions = Number(limitUsers);

    if (safeDescription.length < 3 || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa solo los campos obligatorios: descripción (mín. 3) y límite de canjes.");
      return;
    }

    setSavingCoupon(true);
    setError(null);
    setToast("");

    try {
      const validIso = validDateTime ? new Date(validDateTime).toISOString() : undefined;
      const created = await page.createCoupon(session.businessId, { qr, description: safeDescription, maxRedemptions, valid: validIso }, session.token);
      setCoupon(created);
      setToast("Cupón de fidelidad creado correctamente.");
      setDescription("");
      setLimitUsers("10");
      setValidDateTime("");
    } catch {
      setError("No fue posible crear el cupón de fidelidad.");
    } finally {
      setSavingCoupon(false);
    }
  };

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "visits")) return;
    setLoadingVisits(true);
    page.getVisitHistory(session.businessId, session.token)
      .then((history) => setVisitLog(history))
      .catch(() => setVisitLog([]))
      .finally(() => setLoadingVisits(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  useEffect(() => {
    if (!session.hasSession) return;

    fetch(new URL(`business/${session.businessId}`, API_BASE_URL).toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json() as Record<string, unknown>;
        setBusinessInfo({
          name: String(payload.Name ?? payload.name ?? `Negocio #${session.businessId}`),
          phone: String(payload.PhoneNumber ?? payload.phoneNumber ?? "No disponible"),
          address: String(payload.Address ?? payload.address ?? "No disponible"),
          plan: String(payload.Plan ?? payload.plan ?? "No definido"),
          chargesEnabled: Number(payload.ChargesEnabled ?? payload.chargesEnabled ?? 0) === 1,
        });
      })
      .catch(() => setBusinessInfo(null));
  }, [session.businessId, session.hasSession, session.token]);

  const groupedCoupons = useMemo(() => ({
    actives: couponList.filter((entry) => isCouponActive(entry)),
    inactives: couponList.filter((entry) => !isCouponActive(entry)),
  }), [couponList]);

  const filteredCoupons = useMemo(() => {
    const term = couponDescriptionQuery.trim().toLowerCase();
    if (!term) return couponList;
    return couponList.filter((entry) => entry.description.toLowerCase().includes(term));
  }, [couponDescriptionQuery, couponList]);

  const visitsSummary = useMemo(() => {
    const totalVisits = visitLog.reduce((acc, visit) => acc + Number(visit.visitCount || 0), 0);
    const customers = new Set(visitLog.map((visit) => visit.userId).filter((id) => id > 0));
    return {
      totalVisits,
      uniqueCustomers: customers.size,
    };
  }, [visitLog]);

  const topClients = useMemo(() => {
    const byUser = new Map<number, { userId: number; userName: string; totalVisits: number; lastVisit?: string }>();
    visitLog.forEach((visit) => {
      const current = byUser.get(visit.userId) || {
        userId: visit.userId,
        userName: visit.userName || `Cliente ${visit.userId}`,
        totalVisits: 0,
        lastVisit: "",
      };
      current.totalVisits = Math.max(current.totalVisits, Number(visit.totalVisits || 0), Number(visit.visitCount || 0));
      current.lastVisit = visit.date;
      byUser.set(visit.userId, current);
    });
    const normalized = Array.from(byUser.values());
    return normalized
      .sort((a, b) => (topClientsSort === "mostFrequent" ? b.totalVisits - a.totalVisits : a.totalVisits - b.totalVisits))
      .slice(0, 8);
  }, [topClientsSort, visitLog]);

  const maxTopVisits = useMemo(
    () => topClients.reduce((max, item) => Math.max(max, Number(item.totalVisits || 0)), 0),
    [topClients],
  );

  const filteredVisits = useMemo(() => {
    const term = visitQuery.trim().toLowerCase();
    if (!term) return visitLog;
    return visitLog.filter((visit) =>
      `${visit.userName} ${visit.userId}`.toLowerCase().includes(term),
    );
  }, [visitLog, visitQuery]);

  const visitsByCustomer = useMemo(() => {
    return [...topClients].slice(0, 10);
  }, [topClients]);

  const defaultDomain = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "https://ravekh.com";
  }, []);

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "coupons")) return;
    setLoadingCoupons(true);
    page.listCoupons(session.businessId, session.token)
      .then((coupons) => setCouponList(coupons))
      .catch(() => setCouponList([]))
      .finally(() => setLoadingCoupons(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  const handleGenerateVisitQrs = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession) {
      setError("No hay sesión activa para generar QR de visitas.");
      return;
    }

    const quantity = Number(visitQrQuantity);
    const ttlMinutes = Number(visitQrTtl);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
      setError("Cantidad y vigencia deben ser mayores a 0.");
      return;
    }

    setVisitQrLoading(true);
    setError(null);
    try {
      const domain = visitQrMode === "online" ? defaultDomain : "offline";
      const tokens = await page.generateVisitQrs(session.businessId, { quantity, ttlMinutes, domain }, session.token);
      setVisitQrTokens(tokens);
      setToast(`Se generaron ${tokens.length} QR de visitas (${visitQrMode}).`);
    } catch {
      setVisitQrTokens([]);
      setError("No se pudieron generar los QR de visitas.");
    } finally {
      setVisitQrLoading(false);
    }
  };

  const handleGenerateDynamicQr = async () => {
    if (!session.hasSession) {
      setError("No hay sesión activa para generar QR dinámico.");
      return;
    }

    setDynamicQrLoading(true);
    setError(null);
    try {
      const nextQr = await page.generateDynamicVisitQr(session.businessId, defaultDomain, session.token);
      setDynamicQr(nextQr);
      setToast("QR dinámico actualizado correctamente.");
    } catch {
      setDynamicQr(null);
      setError("No se pudo generar el QR dinámico.");
    } finally {
      setDynamicQrLoading(false);
    }
  };

  return (
    <PosV2Shell title="Fidelidad" subtitle={subtitle}>
      <section className="pos-v2-loyalty">
        <nav className="pos-v2-loyalty__tabs" aria-label="Navegación fidelidad">
          <button type="button" className={loyaltyView === "all" ? "is-active" : ""} onClick={() => navigate(POS_V2_PATHS.loyalty)}>Resumen</button>
          <button type="button" className={loyaltyView === "coupons" ? "is-active" : ""} onClick={() => navigate(POS_V2_PATHS.coupons)}>Cupones</button>
          <button type="button" className={loyaltyView === "visits" ? "is-active" : ""} onClick={() => navigate(POS_V2_PATHS.visits)}>Visitas</button>
        </nav>

        {!session.hasSession ? <p className="pos-v2-loyalty__error">No hay sesión activa para usar fidelidad.</p> : null}
        {error ? <p className="pos-v2-loyalty__error">{error}</p> : null}
        {toast ? <p className="pos-v2-loyalty__toast">{toast}</p> : null}


        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Resumen de cupones</h2>
          <div className="pos-v2-loyalty__kpis">
            <p><strong>{couponList.length}</strong><span>Totales</span></p>
            <p><strong>{groupedCoupons.actives.length}</strong><span>Activos</span></p>
            <p><strong>{groupedCoupons.inactives.length}</strong><span>Inactivos</span></p>
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Buscar cupón por descripción</h2>
          <form onSubmit={handleLookup} className="pos-v2-loyalty__form">
            <label>
              Descripción del cupón <span>*</span>
              <input
                value={lookupDescription}
                onChange={(event) => setLookupDescription(event.target.value)}
                placeholder="Ej. 2x1 en bebidas"
                required
              />
            </label>
            <button type="submit" disabled={loadingLookup}>{loadingLookup ? "Buscando..." : "Buscar primera coincidencia"}</button>
          </form>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Crear cupón</h2>
          <form onSubmit={handleCreate} className="pos-v2-loyalty__form">
            <p className="pos-v2-loyalty__hint">Campos obligatorios: <strong>Descripción</strong> y <strong>Límite de canjes</strong>. La vigencia es opcional.</p>
            <label>
              Descripción del beneficio <span>*</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. 2x1 en bebidas" required />
            </label>
            <label>
              Límite de canjes <span>*</span>
              <input value={limitUsers} inputMode="numeric" onChange={(event) => setLimitUsers(event.target.value.replace(/[^\d]/g, ""))} placeholder="Ej. 20" required />
            </label>
            <label>
              Vigencia (opcional)
              <input type="datetime-local" value={validDateTime} onChange={(event) => setValidDateTime(event.target.value)} />
            </label>
            <button type="submit" disabled={savingCoupon}>{savingCoupon ? "Guardando..." : "Crear cupón"}</button>
          </form>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Detalle actual</h2>
          {!coupon ? <p>No hay cupón seleccionado.</p> : (
            <div className="pos-v2-loyalty__detail">
              <p><strong>ID:</strong> {coupon.id}</p>
              <p><strong>Descripción:</strong> {coupon.description}</p>
              <p><strong>Límite:</strong> {coupon.maxRedemptions} canjes</p>
              {coupon.valid ? <p><strong>Vigencia:</strong> {new Date(coupon.valid).toLocaleString("es-MX")}</p> : null}
            </div>
          )}
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Cupones del negocio</h2>
          <div className="pos-v2-loyalty__form">
            <label>
              Filtrar por descripción
              <input value={couponDescriptionQuery} onChange={(event) => setCouponDescriptionQuery(event.target.value)} placeholder="Escribe parte de la descripción..." />
            </label>
          </div>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Resumen:</strong> {loadingCoupons ? "cargando..." : `${filteredCoupons.length} cupón(es)`}</p>
            <p><strong>Activos:</strong> {groupedCoupons.actives.length} · <strong>Inactivos:</strong> {groupedCoupons.inactives.length}</p>
            {filteredCoupons.filter((entry) => isCouponActive(entry)).slice(0, 6).map((entry) => (
              <p key={`${entry.id}-${entry.qr}`}>
                🟢 {entry.description || "Cupón"} · {entry.totalUsers}/{entry.maxRedemptions} canjes
              </p>
            ))}
            {filteredCoupons.filter((entry) => !isCouponActive(entry)).slice(0, 4).map((entry) => (
              <p key={`inactive-${entry.id}-${entry.qr}`}>
                ⚪ {entry.description || "Cupón"} · {entry.totalUsers}/{entry.maxRedemptions} canjes
              </p>
            ))}
            {!loadingCoupons && filteredCoupons.length === 0 ? <p>No hay cupones para ese criterio.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Resumen de visitas</h2>
          <div className="pos-v2-loyalty__kpis">
            <p><strong>{visitsSummary.totalVisits}</strong><span>Visitas registradas</span></p>
            <p><strong>{visitsSummary.uniqueCustomers}</strong><span>Clientes únicos</span></p>
            <p><strong>{topClients.length}</strong><span>Top clientes</span></p>
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Generación de QR de visitas</h2>
          <form className="pos-v2-loyalty__form" onSubmit={handleGenerateVisitQrs}>
            <label>
              Modo
              <select value={visitQrMode} onChange={(event) => setVisitQrMode(event.target.value as "online" | "offline")}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <label>
              Cantidad de QR
              <input value={visitQrQuantity} onChange={(event) => setVisitQrQuantity(event.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <label>
              Vigencia en minutos
              <input value={visitQrTtl} onChange={(event) => setVisitQrTtl(event.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <button type="submit" disabled={visitQrLoading}>{visitQrLoading ? "Generando..." : "Generar QR de visitas"}</button>
          </form>
          <div className="pos-v2-loyalty__detail">
            {visitQrTokens.slice(0, 5).map((item, index) => (
              <p key={`${item.token}-${index}`}>
                Token: {item.token || "-"} · URL: {item.qrUrl || "Sin URL"}
              </p>
            ))}
            {!visitQrLoading && visitQrTokens.length === 0 ? <p>Aún no hay QR generados en esta sesión.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>QR dinámico</h2>
          <div className="pos-v2-loyalty__quick-actions">
            <button type="button" onClick={handleGenerateDynamicQr} disabled={dynamicQrLoading}>
              {dynamicQrLoading ? "Actualizando..." : "Generar siguiente QR dinámico"}
            </button>
          </div>
          <div className="pos-v2-loyalty__detail">
            {!dynamicQr ? <p>No hay QR dinámico generado aún.</p> : (
              <>
                <p><strong>Token:</strong> {dynamicQr.token || "-"}</p>
                <p><strong>URL:</strong> {dynamicQr.qrUrl}</p>
                <p><strong>Renueva en:</strong> {dynamicQr.refreshAfterSeconds}s</p>
              </>
            )}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Top clientes fieles</h2>
          <div className="pos-v2-loyalty__header-actions">
            <p className="pos-v2-loyalty__caption">Aquí podrás ver el top de tus clientes fieles.</p>
            <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={() => setIsVisitFilterOpen(true)}>
              Filtrar orden
            </button>
          </div>
          <div className="pos-v2-loyalty__detail">
            {topClients.map((visit) => (
              <article key={`top-${visit.userId}`} className="pos-v2-loyalty__row-card">
                <div className="pos-v2-loyalty__row-head">
                  <p>{visit.userName}</p>
                  <strong>{visit.totalVisits} visita(s)</strong>
                </div>
                <div className="pos-v2-loyalty__progress" aria-hidden="true">
                  <span
                    style={{ width: `${maxTopVisits > 0 ? Math.round((visit.totalVisits / maxTopVisits) * 100) : 0}%` }}
                  />
                </div>
                <small>Última visita: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleDateString("es-MX") : "N/A"}</small>
              </article>
            ))}
            {!loadingVisits && topClients.length === 0 ? <p>Aún no hay datos para top de clientes.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Visitas totales por cliente</h2>
          <div className="pos-v2-loyalty__detail">
            {visitsByCustomer.map((item) => (
              <p key={`total-${item.userId}`}>
                {item.userName} · <strong>{item.totalVisits}</strong> visita(s)
              </p>
            ))}
            {!loadingVisits && visitsByCustomer.length === 0 ? <p>No hay visitas registradas todavía.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Historial de visitas</h2>
          <div className="pos-v2-loyalty__form">
            <label>
              Buscar cliente por nombre/ID
              <input value={visitQuery} onChange={(event) => setVisitQuery(event.target.value)} placeholder="Ej. Juan o 123" />
            </label>
          </div>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Historial:</strong> {loadingVisits ? "cargando..." : `${filteredVisits.length} registro(s)`}</p>
            {filteredVisits.slice(0, 8).map((visit, index) => (
              <p key={`${visit.userId}-${visit.date}-${index}`}>
                {visit.userName || `Usuario ${visit.userId || "-"}`} · +{visit.visitCount} visita(s) · Total: {visit.totalVisits} · {new Date(visit.date).toLocaleString("es-MX")}
              </p>
            ))}
            {!loadingVisits && filteredVisits.length === 0 ? <p>No hay visitas registradas para ese filtro.</p> : null}
          </div>
        </article> : null}
        {isVisitFilterOpen ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Filtros de visitas">
            <div className="pos-v2-loyalty__modal-card">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Ordenar top clientes</h3>
                <button type="button" onClick={() => setIsVisitFilterOpen(false)} aria-label="Cerrar filtros">×</button>
              </div>
              <p>Selecciona cómo quieres ordenar el listado.</p>
              <button
                type="button"
                className={topClientsSort === "mostFrequent" ? "is-active" : ""}
                onClick={() => {
                  setTopClientsSort("mostFrequent");
                  setIsVisitFilterOpen(false);
                }}
              >
                Más frecuentes
              </button>
              <button
                type="button"
                className={topClientsSort === "leastFrequent" ? "is-active" : ""}
                onClick={() => {
                  setTopClientsSort("leastFrequent");
                  setIsVisitFilterOpen(false);
                }}
              >
                Menos frecuentes
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
