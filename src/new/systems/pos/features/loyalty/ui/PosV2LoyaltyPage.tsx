import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./PosV2LoyaltyPage.css";

const API_BASE_URL = getPosApiBaseUrl();

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
  const [visitCustomer, setVisitCustomer] = useState("");
  const [visitCount, setVisitCount] = useState("1");
  const [visitLog, setVisitLog] = useState<Array<{ customerReference: string; visits: number; createdAt: string }>>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [savingVisit, setSavingVisit] = useState(false);
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
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "visits")) {
      return;
    }

    setLoadingVisits(true);
    page.getVisitHistory(session.businessId, session.token)
      .then((history) => setVisitLog(history))
      .catch(() => setVisitLog([]))
      .finally(() => setLoadingVisits(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  const handleRegisterVisit = async (event: FormEvent) => {
    event.preventDefault();
    const customer = visitCustomer.trim();
    const count = Number(visitCount);

    if (!customer || !Number.isFinite(count) || count <= 0) {
      setError("Completa cliente y número de visitas válido.");
      return;
    }

    if (!session.hasSession) {
      setError("No hay sesión activa para registrar visitas.");
      return;
    }

    setSavingVisit(true);
    setError(null);
    try {
      const created = await page.registerVisit(session.businessId, { customerReference: customer, visits: count }, session.token);
      setToast("Visita registrada en el historial operativo.");
      setVisitLog((current) => [created, ...current].slice(0, 20));
      setVisitCustomer("");
      setVisitCount("1");
    } catch {
      setError("No fue posible registrar la visita.");
    } finally {
      setSavingVisit(false);
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

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Registrar visitas</h2>
          <form onSubmit={handleRegisterVisit} className="pos-v2-loyalty__form">
            <input value={visitCustomer} onChange={(event) => setVisitCustomer(event.target.value)} placeholder="Cliente / referencia" />
            <input value={visitCount} inputMode="numeric" onChange={(event) => setVisitCount(event.target.value.replace(/[^\d]/g, ""))} placeholder="Nº visitas" />
            <button type="submit" disabled={savingVisit}>{savingVisit ? "Guardando..." : "Registrar visita"}</button>
          </form>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Historial:</strong> {loadingVisits ? "cargando..." : `${visitLog.length} registro(s)`}</p>
            {visitLog.slice(0, 5).map((visit, index) => (
              <p key={`${visit.customerReference}-${visit.createdAt}-${index}`}>
                {visit.customerReference} · +{visit.visits} visita(s) · {new Date(visit.createdAt).toLocaleString("es-MX")}
              </p>
            ))}
          </div>
        </article> : null}
      </section>
    </PosV2Shell>
  );
};
