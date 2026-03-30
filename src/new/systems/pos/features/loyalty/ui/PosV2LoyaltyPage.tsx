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
  const [lookupQr, setLookupQr] = useState("");
  const [createQr, setCreateQr] = useState("");
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("10");
  const [visitLog, setVisitLog] = useState<Array<{ userId: number; userName: string; date: string; visitCount: number; totalVisits: number }>>([]);
  const [couponList, setCouponList] = useState<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string }>>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [coupon, setCoupon] = useState<{ id: number; qr?: string; description: string; maxRedemptions: number } | null>(null);

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

    const qr = lookupQr.trim();
    if (!qr) {
      setError("Ingresa un código QR para buscar cupón.");
      return;
    }

    setLoadingLookup(true);
    setError(null);
    setToast("");

    try {
      const found = await page.lookupCoupon(session.businessId, qr, session.token);
      setCoupon({ ...found, qr });
    } catch {
      setCoupon(null);
      setError("No encontramos un cupón con ese QR.");
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

    const qr = createQr.trim();
    const safeDescription = description.trim();
    const maxRedemptions = Number(limitUsers);

    if (!qr || safeDescription.length < 3 || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa QR, descripción (mín. 3) y límite de canjes válido.");
      return;
    }

    setSavingCoupon(true);
    setError(null);
    setToast("");

    try {
      const created = await page.createCoupon(session.businessId, { qr, description: safeDescription, maxRedemptions }, session.token);
      setCoupon(created);
      setToast("Cupón de fidelidad creado correctamente.");
      setCreateQr("");
      setDescription("");
      setLimitUsers("10");
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

  const groupedCoupons = useMemo(() => ({
    actives: couponList.filter((entry) => isCouponActive(entry)),
    inactives: couponList.filter((entry) => !isCouponActive(entry)),
  }), [couponList]);

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "coupons")) return;
    setLoadingCoupons(true);
    page.listCoupons(session.businessId, session.token)
      .then((coupons) => setCouponList(coupons))
      .catch(() => setCouponList([]))
      .finally(() => setLoadingCoupons(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

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
          <h2>Buscar cupón por QR</h2>
          <form onSubmit={handleLookup} className="pos-v2-loyalty__form">
            <input value={lookupQr} onChange={(event) => setLookupQr(event.target.value)} placeholder="QR del cupón" />
            <button type="submit" disabled={loadingLookup}>{loadingLookup ? "Buscando..." : "Buscar"}</button>
          </form>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Crear cupón</h2>
          <form onSubmit={handleCreate} className="pos-v2-loyalty__form">
            <input value={createQr} onChange={(event) => setCreateQr(event.target.value)} placeholder="QR único" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción del beneficio" />
            <input value={limitUsers} inputMode="numeric" onChange={(event) => setLimitUsers(event.target.value.replace(/[^\d]/g, ""))} placeholder="Límite de canjes" />
            <button type="submit" disabled={savingCoupon}>{savingCoupon ? "Guardando..." : "Crear cupón"}</button>
          </form>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Detalle actual</h2>
          {!coupon ? <p>No hay cupón seleccionado.</p> : (
            <div className="pos-v2-loyalty__detail">
              <p><strong>ID:</strong> {coupon.id}</p>
              {coupon.qr ? <p><strong>QR:</strong> {coupon.qr}</p> : null}
              <p><strong>Descripción:</strong> {coupon.description}</p>
              <p><strong>Límite:</strong> {coupon.maxRedemptions} canjes</p>
            </div>
          )}
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Cupones del negocio</h2>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Resumen:</strong> {loadingCoupons ? "cargando..." : `${couponList.length} cupón(es)`}</p>
            <p><strong>Activos:</strong> {groupedCoupons.actives.length} · <strong>Inactivos:</strong> {groupedCoupons.inactives.length}</p>
            {groupedCoupons.actives.slice(0, 6).map((entry) => (
              <p key={`${entry.id}-${entry.qr}`}>
                🟢 {entry.description || "Cupón"} · QR: {entry.qr || "sin QR"} · {entry.totalUsers}/{entry.maxRedemptions} canjes
              </p>
            ))}
            {groupedCoupons.inactives.slice(0, 4).map((entry) => (
              <p key={`inactive-${entry.id}-${entry.qr}`}>
                ⚪ {entry.description || "Cupón"} · {entry.totalUsers}/{entry.maxRedemptions} canjes
              </p>
            ))}
            {!loadingCoupons && couponList.length === 0 ? <p>No hay cupones registrados.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Historial de visitas</h2>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Historial:</strong> {loadingVisits ? "cargando..." : `${visitLog.length} registro(s)`}</p>
            {visitLog.slice(0, 5).map((visit, index) => (
              <p key={`${visit.userId}-${visit.date}-${index}`}>
                {visit.userName || `Usuario ${visit.userId || "-"}`} · +{visit.visitCount} visita(s) · Total: {visit.totalVisits} · {new Date(visit.date).toLocaleString("es-MX")}
              </p>
            ))}
            {!loadingVisits && visitLog.length === 0 ? <p>No hay visitas registradas.</p> : null}
          </div>
        </article> : null}
      </section>
    </PosV2Shell>
  );
};
